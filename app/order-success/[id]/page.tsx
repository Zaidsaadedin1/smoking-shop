import { OrderSuccessPageView } from '@/components/storefront/storefront-pages';
import { getOrderById } from '@/lib/api/store-api';
import { getCustomerAuthHeaders, getCustomerSession } from '@/lib/customer/auth';
import { getSupabaseServiceRoleHeaders } from '@/lib/supabase/rest';

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getCustomerSession();

  if (!session) {
    const serviceRoleHeaders = getSupabaseServiceRoleHeaders();
    const guestOrder = serviceRoleHeaders
      ? await getOrderById(id, { headers: serviceRoleHeaders })
      : null;
    const guestOrderData = guestOrder?.data;

    return (
      <OrderSuccessPageView
        orderId={id}
        order={guestOrderData?.user_id === null ? guestOrderData : null}
        isGuest
      />
    );
  }

  const authHeaders = await getCustomerAuthHeaders();
  const order = await getOrderById(id, authHeaders ? { headers: authHeaders } : undefined);

  if (!order.data || order.data.user_id !== session.id) {
    return <OrderSuccessPageView orderId={id} order={null} />;
  }

  return <OrderSuccessPageView orderId={id} order={order.data} />;
}
