import { ActionIcon, Badge, Button, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import { Product } from '@/lib/storefront-types';
import { ProductCard } from '../catalog/CatalogComponents';
import { SectionEyebrow, SurfaceCard } from '../shared/SharedComponents';

export function ProductImageSlider() {
  return (
    <Paper radius="xl" p="md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Text c="rgba(255,255,255,0.58)">ProductImageSlider</Text>
    </Paper>
  );
}

export function ProductImageGallery() {
  return (
    <Stack gap="md">
      <SectionEyebrow>ProductImageGallery</SectionEyebrow>
      <ProductImageSlider />
      <SimpleGrid cols={3} spacing="sm">
        {['Primary', 'Detail', 'Texture'].map((label) => (
          <Paper key={label} radius="xl" p="lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Text size="sm">{label}</Text>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

export function ProductTitle({ product }: { product: Product }) {
  return <Text fw={700} size="2rem">{product.name}</Text>;
}

export function ProductPrice({ product }: { product: Product }) {
  return <Text fw={700} size="1.8rem" c="#dfcfff">${product.price}</Text>;
}

export function DiscountBadge() {
  return <Badge color="grape" variant="light" radius="xl">DiscountBadge</Badge>;
}

export function FavoriteButton() {
  return <Button radius="xl" variant="default" color="dark">FavoriteButton</Button>;
}

export function ProductDescription({ product }: { product: Product }) {
  return <Text c="rgba(255,255,255,0.72)" style={{ lineHeight: 1.8 }}>{product.description}</Text>;
}

export function ColorSelector({ product }: { product: Product }) {
  return <Badge color="gray" variant="outline" radius="xl">ColorSelector: {product.color}</Badge>;
}

export function SizeSelector({ product }: { product: Product }) {
  return <Badge color="gray" variant="outline" radius="xl">SizeSelector: {product.sizeRange}</Badge>;
}

export function VariantSelector() {
  return <Badge color="gray" variant="outline" radius="xl">VariantSelector</Badge>;
}

export function QuantitySelector() {
  return (
    <Group gap="sm">
      <Button radius="xl" variant="default" color="dark">-</Button>
      <Badge radius="xl" size="lg">1</Badge>
      <Button radius="xl" variant="default" color="dark">+</Button>
    </Group>
  );
}

export function StockStatus({ product }: { product: Product }) {
  return <Badge color={product.status === 'limited' ? 'red' : 'grape'} variant="light" radius="xl">StockStatus: {product.status}</Badge>;
}

export function AddToCartButton() {
  return <Button radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>AddToCartButton</Button>;
}

export function BuyNowButton() {
  return (
    <Link href="/checkout" style={{ textDecoration: 'none' }}>
      <Button component="span" radius="xl" variant="default" color="dark">BuyNowButton</Button>
    </Link>
  );
}

export function ReviewCard({ author, rating, body }: { author: string; rating: number; body: string }) {
  return (
    <SurfaceCard>
      <Text fw={600}>{author} • {rating}/5</Text>
      <Text size="sm" c="rgba(255,255,255,0.58)">{body}</Text>
    </SurfaceCard>
  );
}

export function ProductReviews() {
  return (
    <Stack gap="sm">
      <SectionEyebrow>ProductReviews</SectionEyebrow>
      <ReviewCard author="Lina" rating={5} body="Structured beautifully and feels premium in hand." />
      <ReviewCard author="Maya" rating={4} body="Heavy, dark, and exactly on-brand." />
    </Stack>
  );
}

export function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <Stack gap="md">
      <SectionEyebrow>RelatedProducts</SectionEyebrow>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

export function ShareButton() {
  return <ActionIcon size={42} radius="xl" variant="light" color="grape">↗</ActionIcon>;
}

export function ProductDetailsScreen({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  return (
    <Stack gap="lg">
      <SectionEyebrow>ProductDetailsScreen</SectionEyebrow>
      <ProductImageGallery />
      <SurfaceCard>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <ProductTitle product={product} />
            <ShareButton />
          </Group>
          <ProductPrice product={product} />
          <DiscountBadge />
          <FavoriteButton />
          <ColorSelector product={product} />
          <SizeSelector product={product} />
          <VariantSelector />
          <QuantitySelector />
          <StockStatus product={product} />
          <ProductDescription product={product} />
          <Group>
            <AddToCartButton />
            <BuyNowButton />
          </Group>
        </Stack>
      </SurfaceCard>
      <ProductReviews />
      <RelatedProducts products={relatedProducts} />
    </Stack>
  );
}
