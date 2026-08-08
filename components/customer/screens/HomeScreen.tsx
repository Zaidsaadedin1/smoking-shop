import { Badge, Button, Grid, Group, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import { MotionReveal } from '@/components/storefront/MotionReveal';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { CategoryListWithData, ProductGridSection, SurfaceCard } from '@/components/customer/UiPieces';
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
      <MotionReveal transition="fade-down" duration={700}>
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <SurfaceCard>
              <Stack gap="lg">
                <Group gap="sm">
                  <Badge size="lg" radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
                    Hero banner
                  </Badge>
                  <Badge size="lg" radius="xl" variant="dot" color="grape">
                    Flash sale modal
                  </Badge>
                </Group>
                <Text fw={700} size="2rem">
                  {flashSale.title}
                </Text>
                <Text size="lg" c="rgba(255,255,255,0.72)" style={{ lineHeight: 1.8 }}>
                  {flashSale.subtitle}
                </Text>
                <Group gap="md">
                  <Link href="/products" style={{ textDecoration: 'none' }}>
                    <Button component="span" radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
                      Shop now
                    </Button>
                  </Link>
                  <Link href="/search" style={{ textDecoration: 'none' }}>
                    <Button component="span" radius="xl" variant="default" color="dark">
                      Search catalog
                    </Button>
                  </Link>
                </Group>
              </Stack>
            </SurfaceCard>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <CategoryListWithData categories={categories} products={products} />
          </Grid.Col>
        </Grid>
      </MotionReveal>

      <MotionReveal duration={850}>
        <Stack gap="xl" mt={32}>
          <ProductGridSection title="Featured products" items={featuredProducts} />
          <ProductGridSection title="New arrivals" items={newArrivals} />
          <ProductGridSection title="Best sellers" items={bestSellers} />
          <ProductGridSection title="Recently viewed" items={recentProducts} />
        </Stack>
      </MotionReveal>
    </CustomerShell>
  );
}
