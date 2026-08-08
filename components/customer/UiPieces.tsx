import { Badge, Button, Group, Paper, Progress, SimpleGrid, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import { ReactNode } from 'react';
import { addresses as fallbackAddresses, categories as fallbackCategories, orders as fallbackOrders, products as fallbackProducts } from '@/lib/storefront-data';
import { Address, Category, Order, Product } from '@/lib/storefront-types';

export function SurfaceCard({ children }: { children: ReactNode }) {
  return (
    <Paper
      radius="xl"
      p="xl"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}
    >
      {children}
    </Paper>
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
            <Button
              component="span"
              radius="xl"
              variant="gradient"
              gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}
            >
              View
            </Button>
          </Link>
        </Group>
      </Stack>
    </SurfaceCard>
  );
}

export function ProductGridSection({
  title,
  items,
}: {
  title: string;
  items: Product[];
}) {
  return (
    <Stack gap="md">
      <Text size="xs" tt="uppercase" c="rgba(255,255,255,0.5)" style={{ letterSpacing: 2 }}>
        {title}
      </Text>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

export function CategoryList() {
  return <CategoryListWithData categories={fallbackCategories} products={fallbackProducts} />;
}

export function CategoryListWithData({
  categories = fallbackCategories,
  products = fallbackProducts,
}: {
  categories?: Category[];
  products?: Product[];
}) {
  return (
    <Stack gap="sm">
      {categories.map((category) => (
        <SurfaceCard key={category.id}>
          <Group justify="space-between">
            <div>
              <Text fw={700}>{category.name}</Text>
              <Text size="sm" c="rgba(255,255,255,0.6)">
                {category.description}
              </Text>
            </div>
            <Badge color="grape" variant="light" radius="xl">
              {products.filter((product) => product.categorySlug === category.slug).length}
            </Badge>
          </Group>
        </SurfaceCard>
      ))}
    </Stack>
  );
}

export function OrderList() {
  return <OrderListWithData orders={fallbackOrders} />;
}

export function OrderListWithData({
  orders = fallbackOrders,
}: {
  orders?: Order[];
}) {
  return (
    <Stack gap="sm">
      {orders.map((order) => (
        <SurfaceCard key={order.id}>
          <Group justify="space-between">
            <div>
              <Text fw={700}>{order.number}</Text>
              <Text size="sm" c="rgba(255,255,255,0.58)">
                {order.createdAt} • {order.items} items
              </Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Badge color="grape" variant="light" radius="xl" mb={8}>
                {order.status.replaceAll('_', ' ')}
              </Badge>
              <Text fw={700}>${order.total}</Text>
            </div>
          </Group>
        </SurfaceCard>
      ))}
    </Stack>
  );
}

export function AddressList() {
  return <AddressListWithData addresses={fallbackAddresses} />;
}

export function AddressListWithData({
  addresses = fallbackAddresses,
}: {
  addresses?: Address[];
}) {
  return (
    <Stack gap="sm">
      {addresses.map((address) => (
        <SurfaceCard key={address.id}>
          <Group justify="space-between">
            <div>
              <Text fw={700}>{address.label}</Text>
              <Text c="rgba(255,255,255,0.72)">
                {address.fullName} • {address.phone}
              </Text>
              <Text size="sm" c="rgba(255,255,255,0.58)">
                {address.city}, {address.area}
              </Text>
            </div>
            {address.isDefault ? (
              <Badge color="grape" variant="light" radius="xl">
                Default
              </Badge>
            ) : null}
          </Group>
        </SurfaceCard>
      ))}
    </Stack>
  );
}

export function SummaryRows() {
  const subtotal = 204;
  const shipping = 12;
  const total = subtotal + shipping;

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Text c="rgba(255,255,255,0.58)">Subtotal</Text>
        <Text>${subtotal}</Text>
      </Group>
      <Group justify="space-between">
        <Text c="rgba(255,255,255,0.58)">Shipping</Text>
        <Text>${shipping}</Text>
      </Group>
      <Group justify="space-between">
        <Text fw={700}>Total</Text>
        <Text fw={700} c="#dfcfff">
          ${total}
        </Text>
      </Group>
      <Progress value={72} color="grape" radius="xl" mt="md" />
    </Stack>
  );
}
