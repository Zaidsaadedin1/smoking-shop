import { AccountDashboardPageView } from "@/components/storefront/storefront-account-pages";
import { listAddresses, listFavorites, listOrders } from "@/lib/api/store-api";
import {
  getCustomerAuthHeaders,
  requireCustomerSession,
} from "@/lib/customer/auth";

export default async function AccountPage() {
  const session = await requireCustomerSession();
  const authHeaders = await getCustomerAuthHeaders();
  const auth = authHeaders ? { headers: authHeaders } : undefined;
  const [orders, favorites, addresses] = await Promise.all([
    listOrders(undefined, auth),
    listFavorites(session.id, auth),
    listAddresses(session.id, auth),
  ]);

  return (
    <AccountDashboardPageView
      session={session}
      orderCount={orders?.length ?? 0}
      favoriteCount={favorites?.length ?? 0}
      addressCount={addresses?.length ?? 0}
    />
  );
}
