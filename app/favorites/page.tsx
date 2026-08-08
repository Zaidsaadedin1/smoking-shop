import { FavoritesPageView } from '@/components/storefront/storefront-account-pages';
import { getProducts } from '@/lib/commerce-server';
import { listFavorites } from '@/lib/api/store-api';
import { getCustomerAuthHeaders, requireCustomerSession } from '@/lib/customer/auth';

export default async function FavoritesPage() {
  const session = await requireCustomerSession();
  const authHeaders = await getCustomerAuthHeaders();
  const [products, favorites] = await Promise.all([
    getProducts(),
    listFavorites(session.id, authHeaders ? { headers: authHeaders } : undefined),
  ]);

  const favoriteIds = new Set((favorites ?? []).map((item) => item.product_id));

  return <FavoritesPageView products={products.filter((product) => favoriteIds.has(product.id))} />;
}
