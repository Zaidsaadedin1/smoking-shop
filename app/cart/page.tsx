import { CartPageView } from '@/components/storefront/storefront-pages';
import { getProducts } from '@/lib/commerce-server';

export default async function CartPage() {
  const products = await getProducts();

  return <CartPageView products={products} />;
}
