import ProductCard, {
  ProductCardSkeleton,
} from "@/components/shop/products/ProductCard";
import { getAvailableProducts } from "@/lib/queryProducts";
import { Suspense } from "react";

export default function ProductsPage() {
  return (
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
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductsSuspense />
        </Suspense>
      </Suspense>
    </div>
  );
}

async function ProductsSuspense() {
  const products = await getAvailableProducts();
  return products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}
