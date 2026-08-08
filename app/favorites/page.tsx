import { FavoritesPageView } from '@/components/storefront/storefront-pages';
import { getProducts } from '@/lib/commerce-server';

export default async function FavoritesPage() {
  const products = await getProducts();

  return <FavoritesPageView products={products} />;
}
