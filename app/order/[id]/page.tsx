import { OrderDetailScreen } from '@/components/customer/screens/OrderAndProfileScreens';
import { getOrders } from '@/lib/storefront-server';

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orders = await getOrders();

  return <OrderDetailScreen id={id} orders={orders} />;
}
