"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { memo } from "react";

export const AddNodeButton = memo(() => {
  return (
    <Button
      onClick={() => {}}
      size="icon"
      variant="outline"
      className="bg-background"
    >
      <Plus />
    </Button>
  );
});

AddNodeButton.displayName = "AddNodeButton";
