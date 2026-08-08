import { SearchScreen } from '@/components/customer/screens/CatalogScreens';
import { getProducts } from '@/lib/storefront-server';

export default async function SearchPage() {
  const products = await getProducts();

  return <SearchScreen products={products} />;
}
