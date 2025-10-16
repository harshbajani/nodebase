import { LoginForm } from "@/features/auth/ui/components/login-form";
import { requireUnauth } from "@/lib/auth-utils";
import React from "react";

const Page = async () => {
  await requireUnauth();
  return <LoginForm />;
};

export default Page;
