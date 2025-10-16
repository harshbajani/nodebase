import { SignupForm } from "@/features/auth/ui/components/signup-form";
import { requireUnauth } from "@/lib/auth-utils";
import React from "react";

const Page = async () => {
  await requireUnauth();
  return <SignupForm />;
};

export default Page;
