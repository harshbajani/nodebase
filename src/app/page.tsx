import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";

const Page = async () => {
  await requireAuth();
  const data = await caller.getUsers();
  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen flex-col">
      Protected server component
      <div>{JSON.stringify(data, null, 2)}</div>
    </div>
  );
};

export default Page;
