import { Grid, Stack, Text } from '@mantine/core';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { favoriteProducts, notifications, reviews } from '@/lib/customer-app-data';
import { categories as fallbackCategories, products as fallbackProducts, addresses as fallbackAddresses } from '@/lib/storefront-data';
import { Address, Category, Product } from '@/lib/storefront-types';
import { AddressCard } from '@/components/customer/addresses/AddressComponents';
import {
  CategoryTabs,
  FilterButton,
  FilterSheet,
  PaginationControls,
  ProductCard,
  ProductGrid,
  ProductsHeader,
  SortButton,
} from '@/components/customer/catalog/CatalogComponents';
import { FavoritesScreenSection } from '@/components/customer/favorites/FavoriteComponents';
import {
  ProductDetailsScreen,
  ReviewCard,
} from '@/components/customer/product/ProductComponents';
import { SearchInput, SurfaceCard } from '@/components/customer/shared/SharedComponents';

export function SearchScreen({ products = fallbackProducts }: { products?: Product[] }) {
  return (
    <CustomerShell title="Search the catalog" subtitle="Search is its own route with a dedicated input and reusable product cards." badge="Search">
      <Stack gap="lg">
        <SurfaceCard>
          <SearchInput />
        </SurfaceCard>
        <ProductGrid products={products.slice(0, 4)} />
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
      <Stack gap="lg">
        <CategoryTabs categories={categories} />
        <ProductGrid products={products.slice(0, 4)} />
      </Stack>
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
        <ProductsHeader title="Products / Category Page" total={items.length} />
        <CategoryTabs categories={categories} />
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <FilterSheet categories={categories} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Grid gutter="md" mb="md">
              <Grid.Col span={6}><FilterButton /></Grid.Col>
              <Grid.Col span={6}><SortButton /></Grid.Col>
            </Grid>
            <ProductGrid products={items} />
            <PaginationControls />
          </Grid.Col>
        </Grid>
      </Stack>
    </CustomerShell>
  );
}

export function ProductsScreen({ products = fallbackProducts }: { products?: Product[] }) {
  return (
    <CustomerShell title="Products" subtitle="The product listing page carries the filter, sort, grid, and pagination surface." badge="Products">
      <Stack gap="lg">
        <ProductsHeader title="Products" total={products.length} />
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <FilterSheet categories={fallbackCategories} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Grid gutter="md" mb="md">
              <Grid.Col span={6}><FilterButton /></Grid.Col>
              <Grid.Col span={6}><SortButton /></Grid.Col>
            </Grid>
            <ProductGrid products={products} />
            <PaginationControls />
          </Grid.Col>
        </Grid>
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
      <ProductDetailsScreen product={product} relatedProducts={products.slice(0, 2)} />
    </CustomerShell>
  );
}

export function FavoritesScreen({ products = fallbackProducts }: { products?: Product[] }) {
  const items = products.slice(0, 2).length > 0 ? products.slice(0, 2) : favoriteProducts;

  return (
    <CustomerShell title="FavoritesScreen" subtitle="Favorites reuse the standard product card instead of introducing another product UI." activeTab="Favorites" badge="Favorites">
      <FavoritesScreenSection products={items} />
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
          <ReviewCard key={review.id} author={`${review.product} • ${review.author}`} rating={review.rating} body={review.body} />
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
    <CustomerShell title="AddressesScreen" subtitle="Saved addresses are isolated from checkout and profile." badge="Addresses">
      <Stack gap="sm">
        {addresses.map((address) => (
          <AddressCard key={address.id} address={address} />
        ))}
      </Stack>
    </CustomerShell>
  );
}
