"use client";

import type { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { Globe } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../BaseExecutionNode";

type HTTPRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  [key: string]: unknown;
};

type HTTPRequestNodeType = Node<HTTPRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HTTPRequestNodeType>) => {
  const nodeData = props.data as HTTPRequestNodeData;
  const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
    : "Not Configured";

  return (
    <>
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={Globe}
        name="HTTP Request"
        description={description}
        onSettings={() => {}}
        onDoubleClick={() => {}}
      />
    </>
  );
});

HttpRequestNode.displayName = "HttpRequestNode";
