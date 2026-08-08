import { ShopPageView } from '@/components/storefront/storefront-pages';
import { getStorefrontData } from '@/lib/commerce-server';

export default async function ShopPage() {
  const { products, categories, flashSale } = await getStorefrontData();

  return <ShopPageView products={products} categories={categories} flashSale={flashSale} />;
}
