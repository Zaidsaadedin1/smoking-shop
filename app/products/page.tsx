import { ProductsScreen } from '@/components/customer/screens/CatalogScreens';
import { getProducts } from '@/lib/storefront-server';

export default async function ProductsPage() {
  const products = await getProducts();

  return <ProductsScreen products={products} />;
}
