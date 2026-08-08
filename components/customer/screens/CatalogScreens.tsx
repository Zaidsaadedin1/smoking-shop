import { Badge, Button, Grid, Group, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import Link from 'next/link';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { AddressListWithData, CategoryListWithData, ProductCard, SurfaceCard } from '@/components/customer/UiPieces';
import { favoriteProducts, notifications, reviews } from '@/lib/customer-app-data';
import { categories as fallbackCategories, products as fallbackProducts, addresses as fallbackAddresses } from '@/lib/storefront-data';
import { Address, Category, Product } from '@/lib/storefront-types';

export function SearchScreen({ products = fallbackProducts }: { products?: Product[] }) {
  return (
    <CustomerShell title="Search the catalog" subtitle="Search is its own route with a dedicated input and reusable product cards." badge="Search">
      <Stack gap="lg">
        <SurfaceCard>
          <TextInput placeholder="Search products, collections, brands" radius="xl" />
        </SurfaceCard>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      </Stack>
    </CustomerShell>
  );
}

export function CategoriesScreen({
  categories = fallbackCategories,
  products = fallbackProducts,
}: {
  categories?: Category[];
  products?: Product[];
}) {
  return (
    <CustomerShell title="Categories" subtitle="Top-level category browsing is separated from product listing and search." activeTab="Categories" badge="Categories">
      <CategoryListWithData categories={categories} products={products} />
    </CustomerShell>
  );
}

export function CategoryDetailScreen({
  id,
  categories = fallbackCategories,
  products = fallbackProducts,
}: {
  id: string;
  categories?: Category[];
  products?: Product[];
}) {
  const category = categories.find((item) => item.id === id || item.slug === id) ?? categories[0];
  const items = products.filter((product) => product.categorySlug === category.slug);

  return (
    <CustomerShell title={category.name} subtitle={category.description} activeTab="Categories" badge="Category detail">
      <Stack gap="lg">
        <SurfaceCard>
          <Group gap="sm">
            <Badge color="grape" variant="light" radius="xl">
              Filter sheet
            </Badge>
            <Badge color="gray" variant="outline" radius="xl">
              Sort button
            </Badge>
          </Group>
          <Grid gutter="md" mt="md">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select label="Price range" placeholder="Any" data={['Any', '$0-$50', '$50-$100', '$100+']} radius="md" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select label="Size" placeholder="Any" data={['Any', 'XS', 'S', 'M', 'L', 'XL']} radius="md" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select label="Availability" placeholder="All" data={['All', 'In stock', 'Limited']} radius="md" />
            </Grid.Col>
          </Grid>
        </SurfaceCard>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      </Stack>
    </CustomerShell>
  );
}

export function ProductsScreen({ products = fallbackProducts }: { products?: Product[] }) {
  return (
    <CustomerShell title="Products" subtitle="The product listing page carries the filter, sort, grid, and pagination surface." badge="Products">
      <Stack gap="lg">
        <SurfaceCard>
          <Group justify="space-between">
            <Group gap="sm">
              <Badge color="grape" variant="light" radius="xl">
                Filter button
              </Badge>
              <Badge color="gray" variant="outline" radius="xl">
                Sort button
              </Badge>
            </Group>
            <Text c="rgba(255,255,255,0.58)">{products.length} pieces</Text>
          </Group>
        </SurfaceCard>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      </Stack>
    </CustomerShell>
  );
}

export function ProductDetailScreen({
  id,
  products = fallbackProducts,
}: {
  id: string;
  products?: Product[];
}) {
  const product = products.find((item) => item.id === id || item.slug === id) ?? products[0];

  return (
    <CustomerShell title={product.name} subtitle={product.description} badge="Product details">
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <SurfaceCard>
            <Stack gap="md">
              <Badge color="grape" variant="light" radius="xl" w="fit-content">
                Product image gallery
              </Badge>
              <Text fw={700} size="2rem">
                {product.name}
              </Text>
              <Text c="rgba(255,255,255,0.72)">Color selector: {product.color}</Text>
              <Text c="rgba(255,255,255,0.72)">Size selector: {product.sizeRange}</Text>
              <Text c="rgba(255,255,255,0.72)">Quantity selector and stock status can live here.</Text>
              <Group gap="md" mt="md">
                <Button radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
                  Add to cart
                </Button>
                <Link href="/checkout" style={{ textDecoration: 'none' }}>
                  <Button component="span" radius="xl" variant="default" color="dark">
                    Buy now
                  </Button>
                </Link>
              </Group>
            </Stack>
          </SurfaceCard>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="lg">
            <SurfaceCard>
              <Text fw={700} size="1.5rem" mb="md">
                Reviews
              </Text>
              <Stack gap="sm">
                {reviews.map((review) => (
                  <SurfaceCard key={review.id}>
                    <Text fw={600}>
                      {review.author} • {review.rating}/5
                    </Text>
                    <Text size="sm" c="rgba(255,255,255,0.58)">
                      {review.body}
                    </Text>
                  </SurfaceCard>
                ))}
              </Stack>
            </SurfaceCard>
            <SurfaceCard>
              <Text fw={700} size="1.5rem" mb="md">
                Related products
              </Text>
              <Stack gap="sm">
                {products.slice(0, 2).map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </Stack>
            </SurfaceCard>
          </Stack>
        </Grid.Col>
      </Grid>
    </CustomerShell>
  );
}

export function FavoritesScreen({ products = fallbackProducts }: { products?: Product[] }) {
  const items = products.slice(0, 2).length > 0 ? products.slice(0, 2) : favoriteProducts;

  return (
    <CustomerShell title="Favorites" subtitle="Favorites reuse the standard product card instead of introducing another product UI." activeTab="Favorites" badge="Favorites">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </SimpleGrid>
    </CustomerShell>
  );
}

export function NotificationsScreen() {
  return (
    <CustomerShell title="Notifications" subtitle="Customer updates, sale alerts, and order events have a dedicated route." badge="Notifications">
      <Stack gap="sm">
        {notifications.map((notification) => (
          <SurfaceCard key={notification}>
            <Text>{notification}</Text>
          </SurfaceCard>
        ))}
      </Stack>
    </CustomerShell>
  );
}

export function ReviewsScreen() {
  return (
    <CustomerShell title="Reviews" subtitle="Review management stays separate from product detail and order history." badge="Reviews">
      <Stack gap="sm">
        {reviews.map((review) => (
          <SurfaceCard key={review.id}>
            <Text fw={700}>{review.product}</Text>
            <Text size="sm" c="rgba(255,255,255,0.58)">
              {review.author} • {review.rating}/5
            </Text>
            <Text mt="sm">{review.body}</Text>
          </SurfaceCard>
        ))}
      </Stack>
    </CustomerShell>
  );
}

export function ContactScreen() {
  return (
    <CustomerShell title="Contact us" subtitle="Support and brand contact information live in their own page." badge="Support">
      <SurfaceCard>
        <Text fw={700} size="1.5rem" mb="md">
          Support
        </Text>
        <Text c="rgba(255,255,255,0.72)">Email: coven@tourmaline.example</Text>
        <Text c="rgba(255,255,255,0.72)">Phone: +962 7 9000 8888</Text>
      </SurfaceCard>
    </CustomerShell>
  );
}

export function AddressesScreen({ addresses = fallbackAddresses }: { addresses?: Address[] }) {
  return (
    <CustomerShell title="Addresses" subtitle="Saved addresses are isolated from checkout and profile." badge="Addresses">
      <AddressListWithData addresses={addresses} />
    </CustomerShell>
  );
}
