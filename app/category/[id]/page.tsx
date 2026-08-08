import { CategoryDetailScreen } from '@/components/customer/screens/CatalogScreens';
import { getStorefrontSnapshot } from '@/lib/storefront-server';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { categories, products } = await getStorefrontSnapshot();

  return <CategoryDetailScreen id={id} categories={categories} products={products} />;
}
