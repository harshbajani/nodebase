"use client";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import { useTRPC } from "@/trpc/client";
import { caller } from "@/trpc/server";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.getWorkflows.queryOptions());
      },
    })
  );

  const testAi = useMutation(
    trpc.testAI.mutationOptions({
      onSuccess: () => {
        toast.success("AI job queued");
      },
    })
  );

  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen flex-col">
      Protected server component
      <div>{JSON.stringify(data, null, 2)}</div>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        create Workflow
      </Button>
      <Button disabled={testAi.isPending} onClick={() => testAi.mutate()}>
        gemini
      </Button>
    </div>
  );
};

export default Page;
