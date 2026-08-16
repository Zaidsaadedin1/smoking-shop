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
    undefined,
    authHeaders ? { headers: authHeaders } : undefined,
  );

  return (
    <OrdersPageView
      orders={(orders ?? []).map((order) => ({
        id: order.id,
        number: order.order_number,
        createdAt: new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(new Date(order.created_at)),
        status: order.status,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        total: Number(order.total_amount),
        currency: order.currency,
      }))}
    />
  );
}
