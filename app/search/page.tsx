import { SearchPageView } from '@/components/storefront/storefront-pages';
import { getProducts } from '@/lib/commerce-server';

export default async function SearchPage() {
  const products = await getProducts();

  return <SearchPageView products={products} />;
}
