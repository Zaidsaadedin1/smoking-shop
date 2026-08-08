'use client';

import { Badge, Button, Group, Stack, Text } from '@mantine/core';
import { useLocale } from '@/components/storefront/locale-provider';
import { Order } from '@/lib/storefront-types';
import { SectionEyebrow, SurfaceCard } from '../shared/SharedComponents';

export function OrderStatusBadge({ status }: { status: string }) {
  const { t } = useLocale();
  return (
    <Badge color="grape" variant="light" radius="xl">
      {t(status.replaceAll('_', ' '))}
    </Badge>
  );
}

export function OrderStatusTabs() {
  const { t } = useLocale();
  return (
    <Group gap="sm" wrap="wrap">
      {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
        <Badge key={status} variant="outline" color="grape" radius="xl">
          {t(status)}
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
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Text fw={600}>{t('EmptyOrders')}</Text>
      <Text c="rgba(255,255,255,0.58)">{t('No orders found for this account.')}</Text>
    </SurfaceCard>
  );
}

export function OrderDetailsHeader() {
  const { t } = useLocale();
  return <SectionEyebrow>{t('OrderDetailsHeader')}</SectionEyebrow>;
}

export function OrderNumber({ number }: { number: string }) {
  return <Text fw={700} size="1.8rem">{number}</Text>;
}

export function OrderStatusTimeline({ status }: { status: string }) {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Text fw={600}>{t('OrderStatusTimeline')}</Text>
      <Text c="rgba(255,255,255,0.58)">{t('Current stage:')} {t(status.replaceAll('_', ' '))}</Text>
    </SurfaceCard>
  );
}

export function OrderProductItem() {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Text fw={600}>{t('OrderProductItem')}</Text>
      <Text size="sm" c="rgba(255,255,255,0.58)">{t('Product snapshot, quantity, and line total.')}</Text>
    </SurfaceCard>
  );
}

export function ShippingAddressCard() {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Text fw={600}>{t('ShippingAddressCard')}</Text>
      <Text size="sm" c="rgba(255,255,255,0.58)">{t('Shipping snapshot from order JSONB.')}</Text>
    </SurfaceCard>
  );
}

export function PaymentDetails() {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Text fw={600}>{t('PaymentDetails')}</Text>
      <Text size="sm" c="rgba(255,255,255,0.58)">{t('Payment status, method, and billing details.')}</Text>
    </SurfaceCard>
  );
}

export function OrderPriceSummary({ order }: { order: Order }) {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Text fw={600}>{t('OrderPriceSummary')}</Text>
      <Group justify="space-between" mt="md">
        <Text c="rgba(255,255,255,0.58)">{t('Total')}</Text>
        <Text fw={700} c="#dfcfff">${order.total}</Text>
      </Group>
    </SurfaceCard>
  );
}

export function TrackingInfo() {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Text fw={600}>{t('TrackingInfo')}</Text>
      <Text size="sm" c="rgba(255,255,255,0.58)">{t('Tracking number and carrier details.')}</Text>
    </SurfaceCard>
  );
}

export function CancelOrderButton() {
  const { t } = useLocale();
  return <Button radius="xl" variant="subtle" color="red">{t('CancelOrderButton')}</Button>;
}

export function ReorderButton() {
  const { t } = useLocale();
  return <Button radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>{t('ReorderButton')}</Button>;
}
