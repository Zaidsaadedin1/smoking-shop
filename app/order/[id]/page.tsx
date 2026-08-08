import { OrderDetailPageView } from '@/components/storefront/storefront-account-pages';
import { getOrderById } from '@/lib/api/store-api';
import { getCustomerAuthHeaders, requireCustomerSession } from '@/lib/customer/auth';

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCustomerSession();
  const authHeaders = await getCustomerAuthHeaders();
  const { id } = await params;
  const order = await getOrderById(id, authHeaders ? { headers: authHeaders } : undefined);

  if (!order.data || order.data.user_id !== session.id) {
    return <OrderDetailPageView order={null} />;
  }

  return (
    <OrderDetailPageView
      order={{
        id: order.data.id,
        number: order.data.order_number,
        createdAt: new Intl.DateTimeFormat('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(new Date(order.data.created_at)),
        status: order.data.status,
        paymentStatus: order.data.payment_status,
        paymentMethod: order.data.payment_method,
        total: Number(order.data.total_amount),
        currency: order.data.currency,
        trackingNumber: order.data.tracking_number,
        shippingCarrier: order.data.shipping_carrier,
        customerName: order.data.customer_name,
        customerPhone: order.data.customer_phone,
        notes: order.data.notes,
      }}
    />
  );
}
