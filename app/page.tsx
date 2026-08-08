import { StorefrontHome } from '@/components/storefront/storefront-home';
import { getStorefrontData } from '@/lib/commerce-server';

export default async function HomePage() {
  const { categories, products, flashSale } = await getStorefrontData();

  return <StorefrontHome categories={categories} products={products} flashSale={flashSale} />;
}
