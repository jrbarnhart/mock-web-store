"use server";

import prisma from "@/components/db/db";

export async function toggleProductAvailable(
  id: string,
  availableForPurchase: boolean
) {
  await prisma.product.update({
    where: { id },
    data: { availableForPurchase },
  });
}
