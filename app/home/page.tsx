import { HomeScreen } from '@/components/customer/screens/HomeScreen';
import { getStorefrontSnapshot } from '@/lib/storefront-server';

export default async function HomePage() {
  const { categories, products } = await getStorefrontSnapshot();

  return <HomeScreen categories={categories} products={products} />;
}
