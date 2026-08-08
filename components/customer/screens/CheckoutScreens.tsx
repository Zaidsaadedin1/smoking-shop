import { Badge, Button, Grid, Stack, Text, TextInput } from '@mantine/core';
import { ReactNode } from 'react';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { AddressListWithData, SummaryRows, SurfaceCard } from '@/components/customer/UiPieces';
import { addresses as fallbackAddresses } from '@/lib/storefront-data';
import { Address } from '@/lib/storefront-types';

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
          <SurfaceCard>
            <Text fw={700} size="1.5rem" mb="lg">
              Order summary
            </Text>
            <SummaryRows />
          </SurfaceCard>
        </Grid.Col>
      </Grid>
    </CustomerShell>
  );
}

export function CheckoutIndexScreen({ addresses = fallbackAddresses }: { addresses?: Address[] }) {
  return (
    <CheckoutFrame title="Checkout" subtitle="The checkout flow is separated into address, payment, review, and success." step="Step 1 of 4">
      <SurfaceCard>
        <Badge color="grape" variant="light" radius="xl" mb="lg">
          Shipping address
        </Badge>
        <AddressListWithData addresses={addresses} />
      </SurfaceCard>
    </CheckoutFrame>
  );
}

export function CheckoutAddressScreen({ addresses = fallbackAddresses }: { addresses?: Address[] }) {
  return (
    <CheckoutFrame title="Choose address" subtitle="Step two isolates address selection and creation." step="Step 2 of 4">
      <SurfaceCard>
        <AddressListWithData addresses={addresses} />
      </SurfaceCard>
    </CheckoutFrame>
  );
}

export function CheckoutPaymentScreen() {
  return (
    <CheckoutFrame title="Payment method" subtitle="Card, COD, and wallet methods have their own stage." step="Step 3 of 4">
      <Stack gap="sm">
        {['Card', 'Cash on delivery', 'Apple Pay'].map((method, index) => (
          <SurfaceCard key={method}>
            <Text fw={700}>{method}</Text>
            <Text size="sm" c="rgba(255,255,255,0.58)">
              {index === 0 ? 'Selected method' : 'Available method'}
            </Text>
          </SurfaceCard>
        ))}
      </Stack>
    </CheckoutFrame>
  );
}

export function CheckoutSuccessScreen() {
  return (
    <CheckoutFrame title="Order success" subtitle="The final step confirms placement and links to orders." step="Step 4 of 4">
      <SurfaceCard>
        <Text fw={700} size="2rem" mb="md">
          Order placed
        </Text>
        <Text c="rgba(255,255,255,0.72)" mb="lg">
          Your order has been placed successfully and the timeline will update from orders.
        </Text>
        <Button radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
          View orders
        </Button>
      </SurfaceCard>
    </CheckoutFrame>
  );
}

export function CartScreen() {
  return (
    <CustomerShell title="Cart" subtitle="Cart stays separate from checkout and shows summary, quantity control, and coupon entry surfaces." activeTab="Cart" badge="Cart">
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="sm">
            {['Nocturne Veil Dress', 'Coven Smoke Candle'].map((item) => (
              <SurfaceCard key={item}>
                <Text fw={700}>{item}</Text>
                <Text size="sm" c="rgba(255,255,255,0.58)">
                  Quantity control, remove action, and image slot.
                </Text>
              </SurfaceCard>
            ))}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <SurfaceCard>
            <TextInput label="Coupon" placeholder="Enter promo code" radius="md" mb="lg" />
            <SummaryRows />
          </SurfaceCard>
        </Grid.Col>
      </Grid>
    </CustomerShell>
  );
}
