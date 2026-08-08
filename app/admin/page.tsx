import { AdminDashboardScreen } from '@/components/customer/screens/AdminScreens';
import { getStorefrontSnapshot } from '@/lib/storefront-server';

export default async function AdminPage() {
  const { categories, products, orders } = await getStorefrontSnapshot();

  return <AdminDashboardScreen categories={categories} products={products} orders={orders} />;
}
