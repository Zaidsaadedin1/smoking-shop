import { Badge, Button, Group, Stack, Text } from '@mantine/core';
import { Order } from '@/lib/storefront-types';
import { SectionEyebrow, SurfaceCard } from '../shared/SharedComponents';

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge color="grape" variant="light" radius="xl">
      {status.replaceAll('_', ' ')}
    </Badge>
  );
}

export function OrderStatusTabs() {
  return (
    <Group gap="sm" wrap="wrap">
      {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
        <Badge key={status} variant="outline" color="grape" radius="xl">
          {status}
        </Badge>
      ))}
    </Group>
  );
}

export function OrderCard({ order }: { order: Order }) {
  return (
    <SurfaceCard>
      <Group justify="space-between">
        <div>
          <Text fw={700}>{order.number}</Text>
          <Text size="sm" c="rgba(255,255,255,0.58)">{order.createdAt} • {order.items} items</Text>
        </div>
        <div style={{ textAlign: 'right' }}>
          <OrderStatusBadge status={order.status} />
          <Text fw={700} mt={8}>${order.total}</Text>
        </div>
      </Group>
    </SurfaceCard>
  );
}

export function EmptyOrders() {
  return (
    <SurfaceCard>
      <Text fw={600}>EmptyOrders</Text>
      <Text c="rgba(255,255,255,0.58)">No orders found for this account.</Text>
    </SurfaceCard>
  );
}

export function OrderDetailsHeader() {
  return <SectionEyebrow>OrderDetailsHeader</SectionEyebrow>;
}

export function OrderNumber({ number }: { number: string }) {
  return <Text fw={700} size="1.8rem">{number}</Text>;
}

export function OrderStatusTimeline({ status }: { status: string }) {
  return (
    <SurfaceCard>
      <Text fw={600}>OrderStatusTimeline</Text>
      <Text c="rgba(255,255,255,0.58)">Current stage: {status.replaceAll('_', ' ')}</Text>
    </SurfaceCard>
  );
}

export function OrderProductItem() {
  return (
    <SurfaceCard>
      <Text fw={600}>OrderProductItem</Text>
      <Text size="sm" c="rgba(255,255,255,0.58)">Product snapshot, quantity, and line total.</Text>
    </SurfaceCard>
  );
}

export function ShippingAddressCard() {
  return (
    <SurfaceCard>
      <Text fw={600}>ShippingAddressCard</Text>
      <Text size="sm" c="rgba(255,255,255,0.58)">Shipping snapshot from order JSONB.</Text>
    </SurfaceCard>
  );
}

export function PaymentDetails() {
  return (
    <SurfaceCard>
      <Text fw={600}>PaymentDetails</Text>
      <Text size="sm" c="rgba(255,255,255,0.58)">Payment status, method, and billing details.</Text>
    </SurfaceCard>
  );
}

export function OrderPriceSummary({ order }: { order: Order }) {
  return (
    <SurfaceCard>
      <Text fw={600}>OrderPriceSummary</Text>
      <Group justify="space-between" mt="md">
        <Text c="rgba(255,255,255,0.58)">Total</Text>
        <Text fw={700} c="#dfcfff">${order.total}</Text>
      </Group>
    </SurfaceCard>
  );
}

export function TrackingInfo() {
  return (
    <SurfaceCard>
      <Text fw={600}>TrackingInfo</Text>
      <Text size="sm" c="rgba(255,255,255,0.58)">Tracking number and carrier details.</Text>
    </SurfaceCard>
  );
}

export function CancelOrderButton() {
  return <Button radius="xl" variant="subtle" color="red">CancelOrderButton</Button>;
}

export function ReorderButton() {
  return <Button radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>ReorderButton</Button>;
}
