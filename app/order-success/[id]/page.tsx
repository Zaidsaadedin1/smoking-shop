import { OrderSuccessPageView } from '@/components/storefront/storefront-pages';
import { getOrderById } from '@/lib/api/store-api';
import { getCustomerAuthHeaders, requireCustomerSession } from '@/lib/customer/auth';

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCustomerSession();
  const authHeaders = await getCustomerAuthHeaders();
  const order = await getOrderById(id, authHeaders ? { headers: authHeaders } : undefined);

  if (!order.data || order.data.user_id !== session.id) {
    return <OrderSuccessPageView orderId={id} order={null} />;
  }

  return <OrderSuccessPageView orderId={id} order={order.data} />;
}
