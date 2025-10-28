import { InitialNode } from "@/components/InitialNode";
import { HttpRequestNode } from "@/features/executions/components/http-request/Node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/Node";
import { NodeType } from "@/generated/prisma";
import type { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
