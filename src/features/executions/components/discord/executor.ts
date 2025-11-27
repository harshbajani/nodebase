import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { discordChannel } from "@/inngest/channels/discord";
import { decode } from "html-entities";
import ky, { HTTPError } from "ky";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(discordChannel().status({ nodeId, status: "loading" }));

  if (!data.content) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Discord node: Message content is required");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const decodedContent = decode(rawContent);
  const preparedContent = decodedContent.slice(0, 2000);
  const compiledUsername = data.username
    ? decode(Handlebars.compile(data.username)(context)).trim()
    : undefined;
  if (compiledUsername && /discord/i.test(compiledUsername)) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(
      'Discord node: Username cannot contain the word "discord"'
    );
  }
  const username = compiledUsername?.slice(0, 80);
  const webhookUrl = data.webhookUrl?.trim();

  if (!preparedContent.trim()) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(
      "Discord node: Message content resolved to an empty string"
    );
  }

  try {
    const result = await step.run("discord-webhook", async () => {
      if (!webhookUrl) {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Discord node: Webhook URL is required");
      }

      try {
        await ky.post(webhookUrl, {
          json: {
            content: preparedContent,
            username,
          },
        });
      } catch (error) {
        if (error instanceof HTTPError) {
          const responseText = await error.response.text();
          throw new NonRetriableError(
            `Discord node: Webhook rejected (${
              error.response.status
            }) ${responseText.slice(0, 200)}`
          );
        }
        throw error;
      }

      if (!data.variableName) {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Discord node: Variable name is missing");
      }

      return {
        ...context,
        [data.variableName]: {
          messageContent: preparedContent,
        },
      };
    });

    await publish(
      discordChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;
  } catch (error) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(
      `Discord node: Failed to generate text${
        error instanceof Error ? ` - ${error.message}` : ""
      }`
    );
  }
};
