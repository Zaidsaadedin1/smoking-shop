'use client';

import { Badge, Button, Group, Modal, SimpleGrid, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import { useState } from 'react';
import { promoBanners } from '@/lib/customer-app-data';
import { Category, Product } from '@/lib/storefront-types';
import { ProductCard } from '../catalog/CatalogComponents';
import { SearchBar, SectionEyebrow, SurfaceCard } from '../shared/SharedComponents';

export function HomeHeader() {
  return (
    <Group justify="space-between" mb="lg">
      <Stack gap={2}>
        <Text fw={700} size="1.8rem">
          HomeHeader
        </Text>
        <Text c="rgba(255,255,255,0.65)">Tourmaline Coven customer entry</Text>
      </Stack>
      <StatusBadge />
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
      <Stack gap="lg">
        <Group gap="sm">
          <Badge size="lg" radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
            HeroBanner
          </Badge>
          <Badge size="lg" radius="xl" variant="dot" color="grape">
            Gothic commerce
          </Badge>
        </Group>
        <Text fw={700} size="2.3rem">
          {title}
        </Text>
        <Text size="lg" c="rgba(255,255,255,0.72)" style={{ lineHeight: 1.8 }}>
          {subtitle}
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
      <Stack gap="md">
        <SectionEyebrow>FlashSaleBanner</SectionEyebrow>
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
      </Stack>
    </SurfaceCard>
  );
}

export function CategorySlider({ categories }: { categories: Category[] }) {
  return (
    <Stack gap="md">
      <SectionEyebrow>CategorySlider</SectionEyebrow>
      <Group wrap="nowrap" style={{ overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map((category) => (
          <SurfaceCard key={category.id}>
            <Stack gap={6} miw={220}>
              <Text fw={700}>{category.name}</Text>
              <Text size="sm" c="rgba(255,255,255,0.6)">
                {category.description}
              </Text>
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
      <SectionEyebrow>{title}</SectionEyebrow>
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
      <SectionEyebrow>SearchBar</SectionEyebrow>
      <SearchBar />
    </Stack>
  );
}
