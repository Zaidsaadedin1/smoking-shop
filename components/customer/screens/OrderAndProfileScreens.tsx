import { Stack, Text } from '@mantine/core';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { orders as fallbackOrders } from '@/lib/storefront-data';
import { Order } from '@/lib/storefront-types';
import { AddressForm } from '@/components/customer/addresses/AddressComponents';
import {
  CancelOrderButton,
  OrderCard,
  OrderDetailsHeader,
  OrderNumber,
  OrderPriceSummary,
  OrderProductItem,
  OrderStatusTabs,
  OrderStatusTimeline,
  PaymentDetails,
  ReorderButton,
  ShippingAddressCard,
  TrackingInfo,
} from '@/components/customer/orders/OrderComponents';
import { ProfileHeader, ProfileInfo, ProfileMenuItem } from '@/components/customer/profile/ProfileComponents';
import { SectionEyebrow, SettingToggle, SurfaceCard } from '@/components/customer/shared/SharedComponents';

export function OrdersScreen({ orders = fallbackOrders }: { orders?: Order[] }) {
  return (
    <CustomerShell title="Orders" subtitle="Orders are separated into their own listing view with status tabs and order cards." badge="Orders">
      <Stack gap="lg">
        <OrderStatusTabs />
        {orders.length === 0 ? (
          <SurfaceCard>
            <Text fw={600}>EmptyOrders</Text>
          </SurfaceCard>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </Stack>
    </CustomerShell>
  );
}

export function OrderDetailScreen({
  id,
  orders = fallbackOrders,
}: {
  id: string;
  orders?: Order[];
}) {
  const order = orders.find((item) => item.id === id || item.number === id) ?? orders[0];

  return (
    <CustomerShell title={order.number} subtitle="Order details, timeline, shipping, and payment are grouped into a focused route." badge="Order detail">
      <Stack gap="lg">
        <OrderDetailsHeader />
        <OrderNumber number={order.number} />
        <OrderStatusTimeline status={order.status} />
        <OrderProductItem />
        <ShippingAddressCard />
        <PaymentDetails />
        <OrderPriceSummary order={order} />
        <TrackingInfo />
        <div style={{ display: 'flex', gap: 12 }}>
          <CancelOrderButton />
          <ReorderButton />
        </div>
      </Stack>
    </CustomerShell>
  );
}

export function ProfileScreen() {
  return (
    <CustomerShell title="ProfileScreen" subtitle="Profile becomes a dedicated customer hub with orders, favorites, addresses, and settings." activeTab="Profile" badge="Profile">
      <Stack gap="sm">
        <ProfileHeader />
        <ProfileInfo />
        {['My Orders', 'My Favorites', 'My Addresses', 'Notifications', 'Settings', 'Contact Us', 'Privacy Policy', 'Terms & Conditions', 'Logout'].map((item) => (
          <ProfileMenuItem key={item} label={item} />
        ))}
      </Stack>
    </CustomerShell>
  );
}

export function AddAddressScreen() {
  return (
    <CustomerShell title="AddAddressScreen" subtitle="Address creation is separated from address listing and checkout." badge="Address form">
      <AddressForm buttonLabel="Save address" />
    </CustomerShell>
  );
}

export function EditAddressScreen({ id }: { id: string }) {
  return (
    <CustomerShell title={`EditAddressScreen ${id}`} subtitle="Existing addresses can be edited from their own dynamic route." badge="Address form">
      <AddressForm buttonLabel="Update address" />
    </CustomerShell>
  );
}

export function SettingsScreen() {
  return (
    <CustomerShell title="Settings" subtitle="Customer settings stay separate from profile overview." badge="Settings">
      <Stack gap="sm">
        {['Push notifications', 'Marketing emails', 'Dark appearance', 'Language preference'].map((item) => <SettingToggle key={item} label={item} />)}
      </Stack>
    </CustomerShell>
  );
}

export function SplashScreen() {
  return (
    <CustomerShell title="Tourmaline Coven" subtitle="A dedicated splash route starts the customer app before onboarding or authentication." badge="Splash">
      <SurfaceCard>
        <Text fw={700} size="2rem" mb="md">
          Enter the coven
        </Text>
        <Text c="rgba(255,255,255,0.72)">Start with onboarding, login, or continue into the storefront.</Text>
      </SurfaceCard>
    </CustomerShell>
  );
}

export function OnboardingScreen() {
  return (
    <CustomerShell title="Onboarding" subtitle="Onboarding introduces the product language, order flow, and profile system before entry." badge="Onboarding">
      <Stack gap="sm">
        <SectionEyebrow>Onboarding steps</SectionEyebrow>
        {['Discover categories', 'Save favorites', 'Track orders', 'Manage addresses'].map((item) => <ProfileMenuItem key={item} label={item} />)}
      </Stack>
    </CustomerShell>
  );
}

export function AboutScreen() {
  return (
    <CustomerShell title="About" subtitle="Brand story and positioning live in a separate informational page." badge="About">
      <SurfaceCard>
        <Text c="rgba(255,255,255,0.72)">Tourmaline Coven is framed as a dark luxury label with gothic styling and ritual atmosphere.</Text>
      </SurfaceCard>
    </CustomerShell>
  );
}

export function PrivacyPolicyScreen() {
  return (
    <CustomerShell title="Privacy policy" subtitle="Privacy content is split into its own route for clarity." badge="Legal">
      <SurfaceCard>
        <Text c="rgba(255,255,255,0.72)">Privacy policy placeholder content for profile, addresses, and order data handling.</Text>
      </SurfaceCard>
    </CustomerShell>
  );
}

export function TermsScreen() {
  return (
    <CustomerShell title="Terms and conditions" subtitle="Terms are kept in a separate legal page." badge="Legal">
      <SurfaceCard>
        <Text c="rgba(255,255,255,0.72)">Terms placeholder content for ordering, payment, shipping, and returns.</Text>
      </SurfaceCard>
    </CustomerShell>
  );
}
