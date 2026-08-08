import { Grid, SimpleGrid, Stack, Text } from '@mantine/core';
import { AdminShell } from '@/components/customer/AdminShell';
import { SurfaceCard } from '@/components/customer/shared/SharedComponents';
import { adminMetrics } from '@/lib/customer-app-data';
import { categories as fallbackCategories, orders as fallbackOrders, products as fallbackProducts } from '@/lib/storefront-data';
import { Category, Order, Product } from '@/lib/storefront-types';

export function AdminDashboardScreen({
  categories = fallbackCategories,
  orders = fallbackOrders,
  products = fallbackProducts,
}: {
  categories?: Category[];
  orders?: Order[];
  products?: Product[];
}) {
  const metrics = [
    { ...adminMetrics[0], value: String(products.length) },
    { ...adminMetrics[1], value: String(orders.length) },
    adminMetrics[2],
    adminMetrics[3],
  ];

  return (
    <AdminShell title="Operations dashboard" subtitle="Admin is split from the customer app and has its own navigation, metrics, and management screens." active="Dashboard">
      <SimpleGrid cols={{ base: 1, md: 4 }} spacing="lg">
        {metrics.map((metric) => (
          <SurfaceCard key={metric.label}>
            <Text size="xs" tt="uppercase" c="rgba(255,255,255,0.5)" style={{ letterSpacing: 2 }}>
              {metric.label}
            </Text>
            <Text fw={700} size="2.3rem" mt={6}>
              {metric.value}
            </Text>
            <Text c="rgba(255,255,255,0.62)">{metric.detail}</Text>
          </SurfaceCard>
        ))}
      </SimpleGrid>
    </AdminShell>
  );
}

export function AdminProductsScreen({ products = fallbackProducts }: { products?: Product[] }) {
  return (
    <AdminShell title="Product management" subtitle="Admin products reflect the catalog side of the schema with category assignments and statuses." active="Products">
      <Stack gap="sm">
        {products.map((product) => (
          <SurfaceCard key={product.id}>
            <Text fw={700}>{product.name}</Text>
            <Text size="sm" c="rgba(255,255,255,0.58)">
              {product.status} • {product.categorySlug} • ${product.price}
            </Text>
          </SurfaceCard>
        ))}
      </Stack>
    </AdminShell>
  );
}

export function AdminOrdersScreen({ orders = fallbackOrders }: { orders?: Order[] }) {
  return (
    <AdminShell title="Order management" subtitle="Admin orders surface the operational order pipeline independently from the customer order history." active="Orders">
      <Stack gap="sm">
        {orders.map((order) => (
          <SurfaceCard key={order.id}>
            <Text fw={700}>{order.number}</Text>
            <Text size="sm" c="rgba(255,255,255,0.58)">
              {order.status} • {order.items} items • ${order.total}
            </Text>
          </SurfaceCard>
        ))}
      </Stack>
    </AdminShell>
  );
}

export function AdminCustomersScreen({
  categories = fallbackCategories,
}: {
  categories?: Category[];
}) {
  return (
    <AdminShell title="Customer management" subtitle="Profiles, addresses, and customer account coverage live here." active="Customers">
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <SurfaceCard>
            <Text fw={700} size="1.7rem" mb="lg">
              Customer groups
            </Text>
            <Text c="rgba(255,255,255,0.72)">Customers, admins, and super admins align with the user role schema.</Text>
          </SurfaceCard>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <SurfaceCard>
            <Text fw={700} size="1.7rem" mb="lg">
              Category coverage
            </Text>
            <Text c="rgba(255,255,255,0.72)">{categories.length} active categories mapped into the storefront.</Text>
          </SurfaceCard>
        </Grid.Col>
      </Grid>
    </AdminShell>
  );
}

export function AdminSettingsScreen() {
  return (
    <AdminShell title="Admin settings" subtitle="Admin-wide brand, shipping, payment, and operational settings belong in their own screen." active="Settings">
      <Stack gap="sm">
        {['Brand settings', 'Shipping settings', 'Payment settings', 'Notification settings'].map((item) => (
          <SurfaceCard key={item}>
            <Text fw={600}>{item}</Text>
          </SurfaceCard>
        ))}
      </Stack>
    </AdminShell>
  );
}
