import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminProductsPage() {
  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <PageHeader>Products</PageHeader>
        <Button asChild>
          <Link href={"/admin/products/add"}>Add Product</Link>
        </Button>
      </div>
    </>
  );
}
