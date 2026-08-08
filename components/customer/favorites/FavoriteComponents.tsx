import { Stack, Text } from '@mantine/core';
import { Product } from '@/lib/storefront-types';
import { ProductCard } from '../catalog/CatalogComponents';
import { SurfaceCard } from '../shared/SharedComponents';

export function FavoriteProductCard({ product }: { product: Product }) {
  return <ProductCard product={product} />;
}

export function RemoveFavoriteButton() {
  return (
    <SurfaceCard>
      <Text fw={600}>RemoveFavoriteButton</Text>
    </SurfaceCard>
  );
}

export function EmptyFavorites() {
  return (
    <SurfaceCard>
      <Text fw={600}>EmptyFavorites</Text>
      <Text c="rgba(255,255,255,0.58)">No saved products yet.</Text>
    </SurfaceCard>
  );
}

export function FavoritesScreenSection({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <EmptyFavorites />;
  }

  return (
    <Stack gap="lg">
      {products.map((product) => (
        <FavoriteProductCard key={product.id} product={product} />
      ))}
      <RemoveFavoriteButton />
    </Stack>
  );
}
