import { Grid, Stack } from '@mantine/core';
import { ReactNode } from 'react';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { addresses as fallbackAddresses } from '@/lib/storefront-data';
import { Address } from '@/lib/storefront-types';
import {
  AddressSelector,
  CheckoutProgress,
  OrderReview,
  OrderSuccess,
  PaymentMethod,
  PlaceOrderButton,
  ShippingAddress,
} from '@/components/customer/checkout/CheckoutComponents';
import { CartHeader, CartItem, CartSummary, EmptyCart } from '@/components/customer/cart/CartComponents';
import { products as fallbackProducts } from '@/lib/storefront-data';

function CheckoutFrame({
  title,
  subtitle,
  step,
  children,
}: {
  title: string;
  subtitle: string;
  step: string;
  children: ReactNode;
}) {
  return (
    <CustomerShell title={title} subtitle={subtitle} activeTab="Cart" badge={step}>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 7 }}>{children}</Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <CheckoutProgress step={Number(step.charAt(5)) || 1} />
          <div style={{ marginTop: 16 }}>
            <OrderReview products={fallbackProducts.slice(0, 2)} />
          </div>
        </Grid.Col>
      </Grid>
    </CustomerShell>
  );
}

export function CheckoutIndexScreen({ addresses = fallbackAddresses }: { addresses?: Address[] }) {
  return (
    <CheckoutFrame title="Checkout" subtitle="The checkout flow is separated into address, payment, review, and success." step="Step 1 of 4">
      <ShippingAddress addresses={addresses} />
    </CheckoutFrame>
  );
}

export function CheckoutAddressScreen({ addresses = fallbackAddresses }: { addresses?: Address[] }) {
  return (
    <CheckoutFrame title="Choose address" subtitle="Step two isolates address selection and creation." step="Step 2 of 4">
      <AddressSelector addresses={addresses} />
    </CheckoutFrame>
  );
}

export function CheckoutPaymentScreen() {
  return (
    <CheckoutFrame title="Payment method" subtitle="Card, COD, and wallet methods have their own stage." step="Step 3 of 4">
      <PaymentMethod />
    </CheckoutFrame>
  );
}

export function CheckoutSuccessScreen() {
  return (
    <CheckoutFrame title="Order success" subtitle="The final step confirms placement and links to orders." step="Step 4 of 4">
      <OrderSuccess />
    </CheckoutFrame>
  );
}

export function CartScreen() {
  const items = ['Nocturne Veil Dress', 'Coven Smoke Candle'];

  return (
    <CustomerShell title="Cart" subtitle="Cart stays separate from checkout and shows summary, quantity control, and coupon entry surfaces." activeTab="Cart" badge="Cart">
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="sm">
            <CartHeader />
            {items.length === 0 ? <EmptyCart /> : items.map((item) => <CartItem key={item} name={item} />)}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <CartSummary />
          <div style={{ marginTop: 16 }}>
            <PlaceOrderButton />
          </div>
        </Grid.Col>
      </Grid>
    </CustomerShell>
  );
}
