"use client";

import {
  deleteProduct,
  toggleProductAvailable,
} from "@/app/admin/_actions/productActions";
import prisma from "@/components/db/db";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ToggleAvailableDropdownItem({
  id,
  availableForPurchase,
}: {
  id: string;
  availableForPurchase: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <DropdownMenuItem
      onClick={() => {
        startTransition(async () => {
          await toggleProductAvailable(id, !availableForPurchase);
          router.refresh();
        });
      }}
    >
      {availableForPurchase ? "Deactivate" : "Activate"}
    </DropdownMenuItem>
  );
}

export function DeleteDropdownItem({
  id,
  disabled,
}: {
  id: string;
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <DropdownMenuItem
      variant="destructive"
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          await deleteProduct(id);
          router.refresh();
        });
      }}
    >
      Delete
    </DropdownMenuItem>
  );
}
