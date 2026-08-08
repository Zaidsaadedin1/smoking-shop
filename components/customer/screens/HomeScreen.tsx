import { Grid, Stack } from '@mantine/core';
import { MotionReveal } from '@/components/storefront/MotionReveal';
import { CustomerShell } from '@/components/customer/CustomerShell';
import {
  BestSellers,
  CategorySlider,
  FeaturedProducts,
  FlashSaleBanner,
  FlashSaleModal,
  HeroBanner,
  HomeHeader,
  HomeSearchSection,
  NewArrivals,
  PromoBanner,
  RecentlyViewed,
} from '@/components/customer/home/HomeComponents';
import { flashSale } from '@/lib/customer-app-data';
import { Category, Product } from '@/lib/storefront-types';

type HomeScreenProps = {
  categories: Category[];
  products: Product[];
};

export function HomeScreen({ categories, products }: HomeScreenProps) {
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.slice(0, 4);
  const bestSellers = [...products].reverse().slice(0, 3);
  const recentProducts = products.slice(1, 5);

  return (
    <CustomerShell
      title="Dark commerce, built for the customer app"
      subtitle="Home is split into reusable sections for banners, featured products, new arrivals, best sellers, and recent activity instead of one oversized file."
      activeTab="Home"
      badge="Home"
    >
      <FlashSaleModal title={flashSale.title} subtitle={flashSale.subtitle} discount={flashSale.discount} />
      <MotionReveal transition="fade-down" duration={700}>
        <Stack gap="lg">
          <HomeHeader />
          <HomeSearchSection />
        </Stack>
      </MotionReveal>

      <MotionReveal duration={760}>
        <Grid gutter="lg" mt={12}>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <HeroBanner title={flashSale.title} subtitle={flashSale.subtitle} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <FlashSaleBanner title={flashSale.title} subtitle={flashSale.subtitle} discount={flashSale.discount} />
          </Grid.Col>
        </Grid>
      </MotionReveal>

      <MotionReveal duration={850}>
        <Stack gap="xl" mt={32}>
          <CategorySlider categories={categories} />
          <FeaturedProducts products={featuredProducts} />
          <NewArrivals products={newArrivals} />
          <BestSellers products={bestSellers} />
          <PromoBanner />
          <RecentlyViewed products={recentProducts} />
        </Stack>
      </MotionReveal>
    </CustomerShell>
  );
}
