'use client';

import { Badge, Button, Grid, Group, Modal, SimpleGrid, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import { useState } from 'react';
import { promoBanners } from '@/lib/customer-app-data';
import { Category, Product } from '@/lib/storefront-types';
import { ProductCard } from '../catalog/CatalogComponents';
import { SearchBar, SectionEyebrow, SurfaceCard } from '../shared/SharedComponents';

export function HomeHeader() {
  return (
    <Group justify="space-between" align="flex-start" mb="lg">
      <Stack gap={4}>
        <Text fw={700} size="2rem">
          Tourmaline Coven
        </Text>
        <Text c="rgba(255,255,255,0.65)">Shop dark luxury apparel, jewelry, and ritual objects.</Text>
      </Stack>
      <Group gap="sm">
        <StatusBadge />
        <Badge variant="outline" color="gray" radius="xl">
          New arrivals weekly
        </Badge>
      </Group>
    </Group>
  );
}

function StatusBadge() {
  return (
    <Badge variant="light" color="grape" radius="xl">
      Live catalog
    </Badge>
  );
}

export function HeroBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <SurfaceCard>
      <Stack gap="xl">
        <Group gap="sm" wrap="wrap">
          <Badge size="lg" radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
            Limited drop
          </Badge>
          <Badge size="lg" radius="xl" variant="dot" color="grape">
            Ready to ship
          </Badge>
        </Group>
        <Stack gap="sm">
          <Text fw={700} style={{ fontSize: 'clamp(2.4rem, 5vw, 4.4rem)', lineHeight: 0.95 }}>
            Gothic fashion, ritual objects, and statement jewelry in one storefront.
          </Text>
          <Text size="lg" c="rgba(255,255,255,0.72)" style={{ lineHeight: 1.8, maxWidth: 620 }}>
            {subtitle}
          </Text>
        </Stack>
        <Group gap="md">
          <CommerceHighlight label="Free delivery over 120 JOD" />
          <CommerceHighlight label="Secure checkout" />
          <CommerceHighlight label="Curated coven picks" />
        </Group>
        <Group gap="md" wrap="wrap">
          <Link href="/products" style={{ textDecoration: 'none' }}>
            <Button component="span" size="lg" radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
              Shop all products
            </Button>
          </Link>
          <Link href="/categories" style={{ textDecoration: 'none' }}>
            <Button component="span" size="lg" radius="xl" variant="default" color="dark">
              Browse categories
            </Button>
          </Link>
        </Group>
        <Grid gutter="md">
          <Grid.Col span={4}>
            <HeroMetric value="48+" label="curated pieces" />
          </Grid.Col>
          <Grid.Col span={4}>
            <HeroMetric value="3" label="core collections" />
          </Grid.Col>
          <Grid.Col span={4}>
            <HeroMetric value="24h" label="flash offers" />
          </Grid.Col>
        </Grid>
      </Stack>
    </SurfaceCard>
  );
}

function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <SurfaceCard>
      <Stack gap={2}>
        <Text fw={700} size="1.8rem" c="#dfcfff">
          {value}
        </Text>
        <Text size="sm" c="rgba(255,255,255,0.58)">
          {label}
        </Text>
      </Stack>
    </SurfaceCard>
  );
}

function CommerceHighlight({ label }: { label: string }) {
  return (
    <Badge variant="outline" color="gray" radius="xl" size="lg">
      {label}
    </Badge>
  );
}

export function FlashSaleCountdown() {
  return (
    <Group gap="sm">
      {['06h', '14m', '27s'].map((part) => (
        <Badge key={part} color="grape" variant="outline" radius="xl" size="lg">
          {part}
        </Badge>
      ))}
    </Group>
  );
}

export function FlashSaleBanner({ title, subtitle, discount }: { title: string; subtitle: string; discount: string }) {
  return (
    <SurfaceCard>
      <Stack gap="lg">
        <SectionEyebrow>Flash sale</SectionEyebrow>
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={700} size="1.6rem">
              {title}
            </Text>
            <Text c="rgba(255,255,255,0.68)">{subtitle}</Text>
          </div>
          <Badge color="grape" variant="light" radius="xl">
            {discount}
          </Badge>
        </Group>
        <FlashSaleCountdown />
        <Link href="/products" style={{ textDecoration: 'none' }}>
          <Button component="span" fullWidth radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
            Shop sale now
          </Button>
        </Link>
      </Stack>
    </SurfaceCard>
  );
}

export function CategorySlider({ categories }: { categories: Category[] }) {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <div>
          <SectionEyebrow>Shop by category</SectionEyebrow>
          <Text fw={700} size="1.6rem" mt={4}>
            Start with the collection that fits the mood
          </Text>
        </div>
        <Link href="/categories" style={{ textDecoration: 'none' }}>
          <Button component="span" radius="xl" variant="subtle" color="gray">
            View all
          </Button>
        </Link>
      </Group>
      <Group wrap="nowrap" style={{ overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map((category) => (
          <SurfaceCard key={category.id}>
            <Stack gap={10} miw={240}>
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
      </Group>
    </Stack>
  );
}

export function ProductHorizontalList({ title, products }: { title: string; products: Product[] }) {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <div>
          <SectionEyebrow>{title}</SectionEyebrow>
          <Text fw={700} size="1.5rem" mt={4}>
            {mapProductSectionTitle(title)}
          </Text>
        </div>
        <Link href="/products" style={{ textDecoration: 'none' }}>
          <Button component="span" radius="xl" variant="subtle" color="gray">
            Shop all
          </Button>
        </Link>
      </Group>
      <Group wrap="nowrap" style={{ overflowX: 'auto', paddingBottom: 4 }}>
        {products.map((product) => (
          <div key={product.id} style={{ minWidth: 320 }}>
            <ProductCard product={product} />
          </div>
        ))}
      </Group>
    </Stack>
  );
}

export function FeaturedProducts({ products }: { products: Product[] }) {
  return <ProductHorizontalList title="FeaturedProducts" products={products} />;
}

export function NewArrivals({ products }: { products: Product[] }) {
  return <ProductHorizontalList title="NewArrivals" products={products} />;
}

export function BestSellers({ products }: { products: Product[] }) {
  return <ProductHorizontalList title="BestSellers" products={products} />;
}

export function RecentlyViewed({ products }: { products: Product[] }) {
  return <ProductHorizontalList title="RecentlyViewed" products={products} />;
}

export function PromoBanner() {
  return (
    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
      {promoBanners.map((banner) => (
        <SurfaceCard key={banner}>
          <Text fw={600}>{banner}</Text>
        </SurfaceCard>
      ))}
    </SimpleGrid>
  );
}

function mapProductSectionTitle(title: string) {
  if (title === 'FeaturedProducts') return 'Most wanted right now';
  if (title === 'NewArrivals') return 'Latest drops into the archive';
  if (title === 'BestSellers') return 'Customer favorites that keep moving';
  if (title === 'RecentlyViewed') return 'Pick up where you left off';
  return title;
}

export function FlashSaleModal({ title, subtitle, discount }: { title: string; subtitle: string; discount: string }) {
  const [opened, setOpened] = useState(true);

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      centered
      radius="xl"
      overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
      title={<Text fw={700}>FlashSaleModal</Text>}
    >
      <Stack gap="md">
        <Text fw={700} size="1.4rem">
          {title}
        </Text>
        <Text c="rgba(255,255,255,0.72)">{subtitle}</Text>
        <Badge color="grape" variant="light" radius="xl" w="fit-content">
          {discount}
        </Badge>
        <FlashSaleCountdown />
      </Stack>
    </Modal>
  );
}

export function HomeSearchSection() {
  return (
    <Stack gap="md">
      <SectionEyebrow>Search the catalog</SectionEyebrow>
      <SearchBar />
    </Stack>
  );
}

export function CommerceBenefits() {
  return (
    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
      {[
        {
          title: 'Fast browse path',
          text: 'Move from home to categories, products, and checkout with fewer jumps.',
        },
        {
          title: 'Clear merchandising',
          text: 'Featured, new arrivals, best sellers, and promo banners are separated cleanly.',
        },
        {
          title: 'Store confidence',
          text: 'Shipping, security, and offer visibility are surfaced early like a real shop.',
        },
      ].map((item) => (
        <SurfaceCard key={item.title}>
          <Text fw={700} mb={6}>
            {item.title}
          </Text>
          <Text size="sm" c="rgba(255,255,255,0.6)">
            {item.text}
          </Text>
        </SurfaceCard>
      ))}
    </SimpleGrid>
  );
}
