import { getPopularProducts, getRecentProducts } from "@/lib/queryProducts";
import { ProductFetcher } from "@/lib/types";

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
      </div>
    </div>
  );
}
