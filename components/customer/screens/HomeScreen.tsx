import { Badge, Button, Grid, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { ProductCard } from '@/components/customer/catalog/CatalogComponents';
import { SearchInput, SectionEyebrow, SurfaceCard } from '@/components/customer/shared/SharedComponents';
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

  return (
    <CustomerShell
      title="Dark commerce, built for the customer app"
      subtitle="Home is split into reusable sections for banners, featured products, new arrivals, best sellers, and recent activity instead of one oversized file."
      activeTab="Home"
      badge="Home"
      homeStyle
      hideIntro
    >
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Stack gap={4}>
            <Text fw={700} size="1.9rem">
              New season edit
            </Text>
            <Text c="rgba(255,255,255,0.65)">
              Curated gothic pieces, jewelry, and limited ritual accents.
            </Text>
          </Stack>
          <Group gap="sm">
            <Badge variant="light" color="grape" radius="xl">
              Live catalog
            </Badge>
            <Badge variant="outline" color="gray" radius="xl">
              New arrivals weekly
            </Badge>
          </Group>
        </Group>

        <SurfaceCard>
          <Stack gap="md">
            <SectionEyebrow>Search the catalog</SectionEyebrow>
            <SearchInput />
          </Stack>
        </SurfaceCard>
      </Stack>

      <Grid gap="lg" mt={12}>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <SurfaceCard>
            <Stack gap="xl">
              <Group gap="sm" wrap="wrap">
                <Badge size="lg" radius="xl" variant="gradient" gradient={{ from: '#3d1629', to: '#6b2b49', deg: 135 }}>
                  Limited drop
                </Badge>
                <Badge size="lg" radius="xl" variant="dot" color="pink">
                  Not for everyone
                </Badge>
              </Group>

              <Stack gap="sm">
                <Text
                  fw={700}
                  style={{
                    fontSize: 'clamp(3rem, 7vw, 5.6rem)',
                    lineHeight: 0.88,
                    maxWidth: 560,
                  }}
                >
                  NOT FOR
                  <br />
                  EVERYONE.
                </Text>
                <Text size="lg" c="rgba(255,255,255,0.74)" maw={420} style={{ lineHeight: 1.8 }}>
                  Dark feminine pieces for girls who don&apos;t dress to disappear.
                </Text>
              </Stack>

              <Group gap="md" wrap="wrap">
                <Badge variant="outline" color="gray" radius="xl" size="lg">
                  Free delivery over 120 JOD
                </Badge>
                <Badge variant="outline" color="gray" radius="xl" size="lg">
                  Secure checkout
                </Badge>
                <Badge variant="outline" color="gray" radius="xl" size="lg">
                  Curated coven picks
                </Badge>
              </Group>

              <Group gap="md" wrap="wrap">
                <Link href="/products" style={{ textDecoration: 'none' }}>
                  <Button component="span" size="lg" radius="xl" variant="gradient" gradient={{ from: '#3d1629', to: '#6b2b49', deg: 135 }}>
                    Shop the drop
                  </Button>
                </Link>
                <Link href="/categories" style={{ textDecoration: 'none' }}>
                  <Button component="span" size="lg" radius="xl" variant="default" color="dark">
                    Browse categories
                  </Button>
                </Link>
              </Group>
            </Stack>
          </SurfaceCard>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <SurfaceCard>
            <Stack gap="lg">
              <SectionEyebrow>Midnight sale</SectionEyebrow>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={700} size="1.6rem">
                    MIDNIGHT SALE
                  </Text>
                  <Text c="rgba(255,255,255,0.68)">
                    {flashSale.subtitle}
                  </Text>
                </div>
                <Badge color="grape" variant="light" radius="xl">
                  {flashSale.discount}
                </Badge>
              </Group>
              <Group gap="sm">
                {['06h', '14m', '27s'].map((part) => (
                  <Badge key={part} color="grape" variant="outline" radius="xl" size="lg">
                    {part}
                  </Badge>
                ))}
              </Group>
              <Link href="/products" style={{ textDecoration: 'none' }}>
                <Button component="span" fullWidth radius="xl" variant="gradient" gradient={{ from: '#3d1629', to: '#6b2b49', deg: 135 }}>
                  Shop sale now
                </Button>
              </Link>
            </Stack>
          </SurfaceCard>
        </Grid.Col>
      </Grid>

      <Stack gap="xl" mt={32}>
        <div>
          <SectionEyebrow>Shop by category</SectionEyebrow>
          <Text fw={700} size="1.6rem" mt={4} mb="md">
            Start with the collection that fits the mood
          </Text>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {categories.slice(0, 3).map((category) => (
              <SurfaceCard key={category.id}>
                <Stack gap={10}>
                  <Badge color="grape" variant="light" radius="xl" w="fit-content">
                    {category.accent}
                  </Badge>
                  <Text fw={700}>{category.name}</Text>
                  <Text size="sm" c="rgba(255,255,255,0.6)">
                    {category.description}
                  </Text>
                  <Link href={`/category/${category.slug}`} style={{ textDecoration: 'none' }}>
                    <Button component="span" radius="xl" variant="default" color="dark">
                      Explore
                    </Button>
                  </Link>
                </Stack>
              </SurfaceCard>
            ))}
          </SimpleGrid>
        </div>

        <div>
          <SectionEyebrow>Featured products</SectionEyebrow>
          <Text fw={700} size="1.5rem" mt={4} mb="md">
            Most wanted right now
          </Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </SimpleGrid>
        </div>

        <div>
          <SectionEyebrow>New arrivals</SectionEyebrow>
          <Text fw={700} size="1.5rem" mt={4} mb="md">
            Latest drops into the archive
          </Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </SimpleGrid>
        </div>

        <div>
          <SectionEyebrow>Best sellers</SectionEyebrow>
          <Text fw={700} size="1.5rem" mt={4} mb="md">
            Customer favorites that keep moving
          </Text>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </SimpleGrid>
        </div>
      </Stack>
    </CustomerShell>
  );
}
