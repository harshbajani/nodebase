import { NodeType } from "@/generated/prisma";
import { NodeExecutor, type NodeExecutorParams } from "../types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { geminiExecutor } from "../components/gemini/executor";
import { openAiExecutor } from "../components/openai/executor";
import { anthropicExecutor } from "../components/anthropic/executor";

const adaptExecutor = <TData>(executor: NodeExecutor<TData>): NodeExecutor => {
  return async (params) => executor(params as NodeExecutorParams<TData>);
};

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: adaptExecutor(manualTriggerExecutor),
  [NodeType.INITIAL]: adaptExecutor(manualTriggerExecutor),
  [NodeType.HTTP_REQUEST]: adaptExecutor(httpRequestExecutor),
  [NodeType.GOOGLE_FORM_TRIGGER]: adaptExecutor(googleFormTriggerExecutor),
  [NodeType.STRIPE_TRIGGER]: adaptExecutor(stripeTriggerExecutor),
  [NodeType.GEMINI]: adaptExecutor(geminiExecutor),
  [NodeType.ANTHROPIC]: adaptExecutor(anthropicExecutor),
  [NodeType.OPENAI]: adaptExecutor(openAiExecutor),
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }
  return executor;
};
