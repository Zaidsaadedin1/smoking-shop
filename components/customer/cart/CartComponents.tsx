import { ActionIcon, Badge, Button, Group, Stack, Text, TextInput } from '@mantine/core';
import Link from 'next/link';
import { SectionEyebrow, SurfaceCard } from '../shared/SharedComponents';

export function CartHeader() {
  return (
    <Group justify="space-between">
      <div>
        <Text fw={700} size="2rem">CartHeader</Text>
        <Text c="rgba(255,255,255,0.58)">Your selected pieces</Text>
      </div>
      <Badge color="grape" variant="light" radius="xl">2 items</Badge>
    </Group>
  );
}

export function CartItemImage() {
  return <Badge radius="xl" size="lg">CartItemImage</Badge>;
}

export function CartItemInfo({ name }: { name: string }) {
  return (
    <Stack gap={4}>
      <Text fw={600}>{name}</Text>
      <Text size="sm" c="rgba(255,255,255,0.58)">CartItemInfo</Text>
    </Stack>
  );
}

export function CartQuantityControl() {
  return (
    <Group gap="xs">
      <ActionIcon radius="xl" variant="default" color="dark">-</ActionIcon>
      <Badge radius="xl">1</Badge>
      <ActionIcon radius="xl" variant="default" color="dark">+</ActionIcon>
    </Group>
  );
}

export function RemoveCartItem() {
  return <Button radius="xl" variant="subtle" color="red">RemoveCartItem</Button>;
}

export function CartItem({ name }: { name: string }) {
  return (
    <SurfaceCard>
      <Group justify="space-between" align="center">
        <Group>
          <CartItemImage />
          <CartItemInfo name={name} />
        </Group>
        <Group>
          <CartQuantityControl />
          <RemoveCartItem />
        </Group>
      </Group>
    </SurfaceCard>
  );
}

export function CouponInput() {
  return <TextInput label="CouponInput" placeholder="Enter promo code" radius="md" />;
}

export function SubtotalRow() {
  return <SummaryRow label="SubtotalRow" value="$204" />;
}

export function DiscountRow() {
  return <SummaryRow label="DiscountRow" value="-$18" />;
}

export function ShippingRow() {
  return <SummaryRow label="ShippingRow" value="$12" />;
}

export function TotalRow() {
  return <SummaryRow label="TotalRow" value="$198" highlight />;
}

function SummaryRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Group justify="space-between">
      <Text c={highlight ? '#ffffff' : 'rgba(255,255,255,0.58)'} fw={highlight ? 700 : 400}>
        {label}
      </Text>
      <Text c={highlight ? '#dfcfff' : '#ffffff'} fw={highlight ? 700 : 400}>
        {value}
      </Text>
    </Group>
  );
}

export function CartSummary() {
  return (
    <SurfaceCard>
      <Stack gap="md">
        <SectionEyebrow>CartSummary</SectionEyebrow>
        <CouponInput />
        <SubtotalRow />
        <DiscountRow />
        <ShippingRow />
        <TotalRow />
        <CheckoutButton />
      </Stack>
    </SurfaceCard>
  );
}

export function CheckoutButton() {
  return (
    <Link href="/checkout" style={{ textDecoration: 'none' }}>
      <Button component="span" fullWidth radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
        CheckoutButton
      </Button>
    </Link>
  );
}

export function EmptyCart() {
  return (
    <SurfaceCard>
      <Text fw={600}>EmptyCart</Text>
      <Text c="rgba(255,255,255,0.58)">Your cart is currently empty.</Text>
    </SurfaceCard>
  );
}
