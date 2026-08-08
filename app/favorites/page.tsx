import { FavoritesScreen } from '@/components/customer/screens/CatalogScreens';
import { getProducts } from '@/lib/storefront-server';

export default async function FavoritesPage() {
  const products = await getProducts();

  return <FavoritesScreen products={products} />;
}
