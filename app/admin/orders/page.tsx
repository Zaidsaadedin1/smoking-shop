import { AdminOrdersScreen } from '@/components/customer/screens/AdminScreens';
import { getOrders } from '@/lib/storefront-server';

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return <AdminOrdersScreen orders={orders} />;
}
