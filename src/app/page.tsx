"use client";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import { useTRPC } from "@/trpc/client";
import { caller } from "@/trpc/server";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen flex-col">
      Protected server component
      <div>{JSON.stringify(data, null, 2)}</div>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        create Workflow
      </Button>
    </div>
  );
};

export default Page;
