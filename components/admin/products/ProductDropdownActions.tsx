"use client";

import { toggleProductAvailable } from "@/app/admin/_actions/productActions";
import prisma from "@/components/db/db";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTransition } from "react";

export function ToggleAvailableDropdownItem({
  id,
  availableForPurchase,
}: {
  id: string;
  availableForPurchase: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <DropdownMenuItem
      onClick={() => {
        startTransition(async () => {
          await toggleProductAvailable(id, !availableForPurchase);
        });
      }}
    >
      {availableForPurchase ? "Deactivate" : "Activate"}
    </DropdownMenuItem>
  );
}

export function DeleteDropdownItem() {}
