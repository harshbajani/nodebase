import { getQueryClient, trpc } from "@/trpc/server";
import { Client } from "./client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

const Page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.getUsers.queryOptions());
  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen">
      <h1>hello</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>loading...</p>}>
          <Client />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
};

export default Page;
