import prisma from "@/components/db/db";

function getProducts() {
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

function getRecentProducts() {
  return prisma.product.findMany({
    where: { availableForPurchase: true },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });
}
