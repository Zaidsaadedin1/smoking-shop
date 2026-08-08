import { ProductDetailScreen } from '@/components/customer/screens/CatalogScreens';
import { getProducts } from '@/lib/storefront-server';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = await getProducts();

  return <ProductDetailScreen id={id} products={products} />;
}
