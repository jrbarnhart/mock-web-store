import ProductCard, {
  ProductCardSkeleton,
} from "@/components/shop/products/ProductCard";
import { Button } from "@/components/ui/button";
import { getPopularProducts, getRecentProducts } from "@/lib/queryProducts";
import { ProductFetcher } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <main className="space-y-12">
      <ProductGridSection
        title="Trending"
        productFetcher={getPopularProducts}
      />
      <ProductGridSection title="New" productFetcher={getRecentProducts} />
    </main>
  );
}

function ProductGridSection({
  productFetcher,
  title,
}: {
  productFetcher: ProductFetcher;
  title: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button variant="outline" asChild>
          <Link className="space-x-2" href="/products">
            <span>View All</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductSuspense productFetcher={productFetcher} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductSuspense({
  productFetcher,
}: {
  productFetcher: ProductFetcher;
}) {
  return (await productFetcher()).map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}
