import { CategoriesScreen } from '@/components/customer/screens/CatalogScreens';
import { getStorefrontSnapshot } from '@/lib/storefront-server';

export default async function CategoriesPage() {
  const { categories, products } = await getStorefrontSnapshot();

  return <CategoriesScreen categories={categories} products={products} />;
}
