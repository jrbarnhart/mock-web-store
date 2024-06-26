"use server";

import prisma from "@/components/db/db";
import { notFound } from "next/navigation";
import { del } from "@vercel/blob";

export async function toggleProductAvailable(
  id: string,
  availableForPurchase: boolean
) {
  await prisma.product.update({
    where: { id },
    data: { availableForPurchase },
  });
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.delete({ where: { id } });
  if (product === null) return notFound();
  del(product.imageSource);
}
