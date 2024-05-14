export default function Page({ params }: { params: { id: string } }) {
  return <p>This is a product details page for product id: {params.id}</p>;
}
