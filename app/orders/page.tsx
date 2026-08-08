import { OrdersScreen } from '@/components/customer/screens/OrderAndProfileScreens';
import { getOrders } from '@/lib/storefront-server';

export default async function OrdersPage() {
  const orders = await getOrders();

  return <OrdersScreen orders={orders} />;
}
