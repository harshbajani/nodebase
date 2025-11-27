import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { slackChannel } from "@/inngest/channels/slack";
import { decode } from "html-entities";
import ky, { HTTPError } from "ky";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(slackChannel().status({ nodeId, status: "loading" }));

  if (!data.content) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Slack node: Message content is required");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const decodedContent = decode(rawContent);
  const preparedContent = decodedContent.slice(0, 2000);
  const webhookUrl = data.webhookUrl?.trim();

  if (!preparedContent.trim()) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(
      "Slack node: Message content resolved to an empty string"
    );
  }

  try {
    const result = await step.run("Slack-webhook", async () => {
      if (!webhookUrl) {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Slack node: Webhook URL is required");
      }

      try {
        await ky.post(webhookUrl, {
          json: {
            content: decodedContent,
          },
        });
      } catch (error) {
        if (error instanceof HTTPError) {
          const responseText = await error.response.text();
          throw new NonRetriableError(
            `Slack node: Webhook rejected (${
              error.response.status
            }) ${responseText.slice(0, 200)}`
          );
        }
        throw error;
      }

      if (!data.variableName) {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Slack node: Variable name is missing");
      }

      return {
        ...context,
        [data.variableName]: {
          messageContent: preparedContent,
        },
      };
    });

    await publish(
      slackChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;
  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(
      `Slack node: Failed to generate text${
        error instanceof Error ? ` - ${error.message}` : ""
      }`
    );
  }
};
