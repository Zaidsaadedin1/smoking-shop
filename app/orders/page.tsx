import { OrdersPageView } from "@/components/storefront/storefront-account-pages";
import { listOrders } from "@/lib/api/store-api";
import {
  getCustomerAuthHeaders,
  requireCustomerSession,
} from "@/lib/customer/auth";

export default async function OrdersPage() {
  const session = await requireCustomerSession();
  const authHeaders = await getCustomerAuthHeaders();

  const orders = await listOrders(
    session.id,
    authHeaders
      ? {
          headers: authHeaders,
        }
      : undefined,
  );

  const mappedOrders = (orders ?? []).map((order) => ({
    id: order.id,
    number: order.order_number,
    createdAt: order.created_at,
    status: order.status,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method,
    total: Number(order.total_amount),
    currency: order.currency,
  }));

  return <OrdersPageView orders={mappedOrders} />;
}
