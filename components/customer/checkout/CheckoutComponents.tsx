import { Badge, Button, Group, Progress, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Address, Product } from '@/lib/storefront-types';
import { CouponInput } from '../cart/CartComponents';
import { SectionEyebrow, SurfaceCard } from '../shared/SharedComponents';

export function CheckoutProgress({ step }: { step: number }) {
  return (
    <SurfaceCard>
      <Stack gap="sm">
        <SectionEyebrow>CheckoutProgress</SectionEyebrow>
        <Progress value={step * 25} color="grape" radius="xl" />
        <Text c="rgba(255,255,255,0.58)">Step {step} of 4</Text>
      </Stack>
    </SurfaceCard>
  );
}

export function CheckoutScreen({
  step,
  children,
}: {
  step: number;
  children: ReactNode;
}) {
  return (
    <Stack gap="lg">
      <CheckoutProgress step={step} />
      {children}
    </Stack>
  );
}

export function AddressCard({ address }: { address: Address }) {
  return (
    <SurfaceCard>
      <Group justify="space-between">
        <div>
          <Text fw={600}>{address.label}</Text>
          <Text c="rgba(255,255,255,0.72)">{address.fullName} • {address.phone}</Text>
          <Text size="sm" c="rgba(255,255,255,0.58)">{address.city}, {address.area}</Text>
        </div>
        {address.isDefault ? <Badge color="grape" variant="light" radius="xl">Default</Badge> : null}
      </Group>
    </SurfaceCard>
  );
}

export function AddressSelector({ addresses }: { addresses: Address[] }) {
  return (
    <Stack gap="sm">
      <SectionEyebrow>AddressSelector</SectionEyebrow>
      {addresses.map((address) => <AddressCard key={address.id} address={address} />)}
    </Stack>
  );
}

export function AddAddressButton() {
  return (
    <Link href="/address/add" style={{ textDecoration: 'none' }}>
      <Button component="span" radius="xl" variant="default" color="dark">AddAddressButton</Button>
    </Link>
  );
}

export function PaymentMethodCard({ title, selected = false }: { title: string; selected?: boolean }) {
  return (
    <SurfaceCard>
      <Group justify="space-between">
        <Text fw={600}>{title}</Text>
        <Badge color={selected ? 'grape' : 'gray'} variant={selected ? 'light' : 'outline'} radius="xl">
          {selected ? 'Selected' : 'Available'}
        </Badge>
      </Group>
    </SurfaceCard>
  );
}

export function CheckoutProductItem({ product }: { product: Product }) {
  return (
    <SurfaceCard>
      <Group justify="space-between">
        <div>
          <Text fw={600}>{product.name}</Text>
          <Text size="sm" c="rgba(255,255,255,0.58)">{product.color}</Text>
        </div>
        <Text>${product.price}</Text>
      </Group>
    </SurfaceCard>
  );
}

export function OrderSummary({ products }: { products: Product[] }) {
  const subtotal = products.reduce((sum, product) => sum + product.price, 0);
  const shipping = 12;

  return (
    <SurfaceCard>
      <Stack gap="md">
        <SectionEyebrow>OrderSummary</SectionEyebrow>
        {products.map((product) => <CheckoutProductItem key={product.id} product={product} />)}
        <CouponInput />
        <Group justify="space-between"><Text c="rgba(255,255,255,0.58)">Subtotal</Text><Text>${subtotal}</Text></Group>
        <Group justify="space-between"><Text c="rgba(255,255,255,0.58)">Shipping</Text><Text>${shipping}</Text></Group>
        <Group justify="space-between"><Text fw={700}>Total</Text><Text fw={700} c="#dfcfff">${subtotal + shipping}</Text></Group>
      </Stack>
    </SurfaceCard>
  );
}

export function PlaceOrderButton() {
  return <Button fullWidth radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>PlaceOrderButton</Button>;
}

export function ShippingAddress({ addresses }: { addresses: Address[] }) {
  return (
    <Stack gap="md">
      <AddressSelector addresses={addresses} />
      <AddAddressButton />
    </Stack>
  );
}

export function PaymentMethod() {
  return (
    <Stack gap="sm">
      <PaymentMethodCard title="Card" selected />
      <PaymentMethodCard title="Cash on delivery" />
      <PaymentMethodCard title="Apple Pay" />
    </Stack>
  );
}

export function OrderReview({ products }: { products: Product[] }) {
  return <OrderSummary products={products} />;
}

export function OrderSuccess() {
  return (
    <SurfaceCard>
      <Stack gap="md">
        <SectionEyebrow>OrderSuccess</SectionEyebrow>
        <Text fw={700} size="2rem">Order placed</Text>
        <Text c="rgba(255,255,255,0.72)">Your order was placed successfully.</Text>
        <Link href="/orders" style={{ textDecoration: 'none' }}>
          <Button component="span" radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
            View orders
          </Button>
        </Link>
      </Stack>
    </SurfaceCard>
  );
}
