'use client';

import { Badge, Button, Group, Loader, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import { useLocale } from '@/components/storefront/locale-provider';
import { Category, Product } from '@/lib/storefront-types';
import { SearchInput, SectionEyebrow, SurfaceCard } from '../shared/SharedComponents';

export function ProductsHeader({ title, total }: { title: string; total: number }) {
  const { t } = useLocale();
  return (
    <Group justify="space-between">
      <div>
        <Text fw={700} size="2rem">
          {t(title)}
        </Text>
        <Text c="rgba(255,255,255,0.58)">{total} {t('pieces')}</Text>
      </div>
      <SearchInput />
    </Group>
  );
}

export function CategoryTabs({ categories }: { categories: Category[] }) {
  const { t } = useLocale();
  return (
    <Group gap="sm" wrap="wrap">
      {categories.map((category) => (
        <Badge key={category.id} variant="outline" color="grape" radius="xl">
          {t(category.name)}
        </Badge>
      ))}
    </Group>
  );
}

export function FilterButton() {
  const { t } = useLocale();
  return (
    <Button radius="xl" variant="light" color="grape">
      {t('FilterButton')}
    </Button>
  );
}

export function SortButton() {
  const { t } = useLocale();
  return (
    <Button radius="xl" variant="outline" color="gray">
      {t('SortButton')}
    </Button>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text fw={700} size="lg">
              {t(product.name)}
            </Text>
            <Text size="sm" c="rgba(255,255,255,0.58)">
              {product.color} • {product.sizeRange}
            </Text>
          </Stack>
          <Badge color="grape" variant="light" radius="xl">
            {product.status}
          </Badge>
        </Group>
        <Text c="rgba(255,255,255,0.68)" style={{ lineHeight: 1.75 }}>
          {t(product.description)}
        </Text>
        <Group justify="space-between">
          <Text fw={700} size="1.4rem" c="#dfcfff">
            ${product.price}
          </Text>
          <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
            <Button component="span" radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
              View
              {t('View')}
            </Button>
          </Link>
        </Group>
      </Stack>
    </SurfaceCard>
  );
}

export function ProductSkeleton() {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Stack gap="md">
        <Loader color="grape" size="sm" />
        <Text c="rgba(255,255,255,0.58)">{t('Loading product...')}</Text>
      </Stack>
    </SurfaceCard>
  );
}

export function EmptyProducts() {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Text fw={600}>{t('EmptyProducts')}</Text>
      <Text c="rgba(255,255,255,0.58)">{t('No products matched the current filters.')}</Text>
    </SurfaceCard>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <EmptyProducts />;
  }

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </SimpleGrid>
  );
}

export function PaginationControls() {
  const { t } = useLocale();
  return (
    <Group justify="center">
      <Button radius="xl" variant="default" color="dark">
        {t('Pagination / InfiniteScroll')}
      </Button>
    </Group>
  );
}

export function PriceRangeFilter() {
  const { t } = useLocale();
  return <Select label={t('PriceRangeFilter')} placeholder={t('Any')} data={[t('Any'), '$0-$50', '$50-$100', '$100+']} radius="md" />;
}

export function SizeFilter() {
  const { t } = useLocale();
  return <Select label={t('SizeFilter')} placeholder={t('Any')} data={[t('Any'), 'XS', 'S', 'M', 'L', 'XL']} radius="md" />;
}

export function ColorFilter() {
  const { t } = useLocale();
  return <Select label={t('ColorFilter')} placeholder={t('Any')} data={[t('Any'), 'Black', 'Silver', 'Plum']} radius="md" />;
}

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const { t } = useLocale();
  return <Select label={t('CategoryFilter')} placeholder={t('All categories')} data={categories.map((category) => t(category.name))} radius="md" />;
}

export function BrandFilter() {
  const { t } = useLocale();
  return <Select label={t('BrandFilter')} placeholder={t('All brands')} data={[t('Tourmaline Coven'), 'In-house', 'Guest label']} radius="md" />;
}

export function AvailabilityFilter() {
  const { t } = useLocale();
  return <Select label={t('AvailabilityFilter')} placeholder={t('All')} data={[t('All'), t('In stock'), t('Limited')]} radius="md" />;
}

export function FilterSheet({ categories }: { categories: Category[] }) {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Stack gap="md">
        <SectionEyebrow>{t('FilterSheet')}</SectionEyebrow>
        <PriceRangeFilter />
        <SizeFilter />
        <ColorFilter />
        <CategoryFilter categories={categories} />
        <BrandFilter />
        <AvailabilityFilter />
      </Stack>
    </SurfaceCard>
  );
}
