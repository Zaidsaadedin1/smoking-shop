import { AdminProductsScreen } from '@/components/customer/screens/AdminScreens';
import { getProducts } from '@/lib/storefront-server';

export default async function AdminProductsPage() {
  const products = await getProducts();

  return <AdminProductsScreen products={products} />;
}
