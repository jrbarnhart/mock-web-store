import { AddProductForm } from "@/components/admin/products/AddProductForm";
import { PageHeader } from "@/components/admin/PageHeader";
import prisma from "@/components/db/db";

export default async function EditProductPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <AddProductForm product={product} />
    </>
  );
}
