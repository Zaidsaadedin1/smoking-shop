import { BrandsPageView } from '@/components/storefront/storefront-pages';
import { getStorefrontData } from '@/lib/commerce-server';

export default async function BrandsPage() {
  const { brands, products } = await getStorefrontData();

  return <BrandsPageView brands={brands} products={products} />;
}
