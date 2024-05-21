import prisma from "@/components/db/db";

export function getAvailableProducts() {
  return prisma.product.findMany({
    where: { availableForPurchase: true },
    orderBy: { name: "asc" },
  });
}

export function getPopularProducts() {
  return prisma.product.findMany({
    where: { availableForPurchase: true },
    orderBy: {
      orderItems: {
        _count: "desc",
      },
    },
    take: 6,
  });
}

export function getRecentProducts() {
  return prisma.product.findMany({
    where: { availableForPurchase: true },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });
}
