import { Badge, Button, Group, Loader, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import { Category, Product } from '@/lib/storefront-types';
import { SearchInput, SectionEyebrow, SurfaceCard } from '../shared/SharedComponents';

export function ProductsHeader({ title, total }: { title: string; total: number }) {
  return (
    <Group justify="space-between">
      <div>
        <Text fw={700} size="2rem">
          {title}
        </Text>
        <Text c="rgba(255,255,255,0.58)">{total} pieces</Text>
      </div>
      <SearchInput />
    </Group>
  );
}

export function CategoryTabs({ categories }: { categories: Category[] }) {
  return (
    <Group gap="sm" wrap="wrap">
      {categories.map((category) => (
        <Badge key={category.id} variant="outline" color="grape" radius="xl">
          {category.name}
        </Badge>
      ))}
    </Group>
  );
}

export function FilterButton() {
  return (
    <Button radius="xl" variant="light" color="grape">
      FilterButton
    </Button>
  );
}

export function SortButton() {
  return (
    <Button radius="xl" variant="outline" color="gray">
      SortButton
    </Button>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <SurfaceCard>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text fw={700} size="lg">
              {product.name}
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
          {product.description}
        </Text>
        <Group justify="space-between">
          <Text fw={700} size="1.4rem" c="#dfcfff">
            ${product.price}
          </Text>
          <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
            <Button component="span" radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
              View
            </Button>
          </Link>
        </Group>
      </Stack>
    </SurfaceCard>
  );
}

export function ProductSkeleton() {
  return (
    <SurfaceCard>
      <Stack gap="md">
        <Loader color="grape" size="sm" />
        <Text c="rgba(255,255,255,0.58)">Loading product...</Text>
      </Stack>
    </SurfaceCard>
  );
}

export function EmptyProducts() {
  return (
    <SurfaceCard>
      <Text fw={600}>EmptyProducts</Text>
      <Text c="rgba(255,255,255,0.58)">No products matched the current filters.</Text>
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
  return (
    <Group justify="center">
      <Button radius="xl" variant="default" color="dark">
        Pagination / InfiniteScroll
      </Button>
    </Group>
  );
}

export function PriceRangeFilter() {
  return <Select label="PriceRangeFilter" placeholder="Any" data={['Any', '$0-$50', '$50-$100', '$100+']} radius="md" />;
}

export function SizeFilter() {
  return <Select label="SizeFilter" placeholder="Any" data={['Any', 'XS', 'S', 'M', 'L', 'XL']} radius="md" />;
}

export function ColorFilter() {
  return <Select label="ColorFilter" placeholder="Any" data={['Any', 'Black', 'Silver', 'Plum']} radius="md" />;
}

export function CategoryFilter({ categories }: { categories: Category[] }) {
  return <Select label="CategoryFilter" placeholder="All categories" data={categories.map((category) => category.name)} radius="md" />;
}

export function BrandFilter() {
  return <Select label="BrandFilter" placeholder="All brands" data={['Tourmaline Coven', 'In-house', 'Guest label']} radius="md" />;
}

export function AvailabilityFilter() {
  return <Select label="AvailabilityFilter" placeholder="All" data={['All', 'In stock', 'Limited']} radius="md" />;
}

export function FilterSheet({ categories }: { categories: Category[] }) {
  return (
    <SurfaceCard>
      <Stack gap="md">
        <SectionEyebrow>FilterSheet</SectionEyebrow>
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
