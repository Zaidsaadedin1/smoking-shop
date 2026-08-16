import { OrderDetailPageView } from "@/components/storefront/storefront-account-pages";
import { getOrderById } from "@/lib/api/store-api";
import {
  getCustomerAuthHeaders,
  requireCustomerSession,
} from "@/lib/customer/auth";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCustomerSession();
  const authHeaders = await getCustomerAuthHeaders();
  const { id } = await params;
  const order = await getOrderById(
    id,
    authHeaders ? { headers: authHeaders } : undefined,
  );

  // Allow viewing orders that belong to the user OR guest orders with null user_id
  if (
    !order.data ||
    (order.data.user_id !== session.id && order.data.user_id !== null)
  ) {
    return <OrderDetailPageView order={null} />;
  }

  const orderData = order.data as typeof order.data & {
    items?: Array<{
      id: string;
      product_name: string;
      sku: string | null;
      size_name: string | null;
      color_name: string | null;
      image_url: string | null;
      unit_price: string | number;
      quantity: number;
      line_total: string | number;
    }>;
  };

  return (
    <OrderDetailPageView
      order={{
        id: orderData.id,
        number: orderData.order_number,
        createdAt: new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(new Date(orderData.created_at)),
        status: orderData.status,
        paymentStatus: orderData.payment_status,
        paymentMethod: orderData.payment_method,
        total: Number(orderData.total_amount),
        currency: orderData.currency,
        trackingNumber: orderData.tracking_number,
        shippingCarrier: orderData.shipping_carrier,
        customerName: orderData.customer_name,
        customerPhone: orderData.customer_phone,
        notes: orderData.notes,
        items: (orderData.items ?? []).map((item) => ({
          id: item.id,
          productName: item.product_name,
          sku: item.sku,
          sizeName: item.size_name,
          colorName: item.color_name,
          imageUrl: item.image_url,
          unitPrice: Number(item.unit_price),
          quantity: item.quantity,
          lineTotal: Number(item.line_total),
        })),
      }}
    />
  );
}
