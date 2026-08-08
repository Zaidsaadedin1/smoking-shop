import { Button, Group, Stack, Switch, Text, TextInput } from '@mantine/core';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { OrderListWithData, SurfaceCard } from '@/components/customer/UiPieces';
import { orders as fallbackOrders } from '@/lib/storefront-data';
import { Order } from '@/lib/storefront-types';

export function OrdersScreen({ orders = fallbackOrders }: { orders?: Order[] }) {
  return (
    <CustomerShell title="Orders" subtitle="Orders are separated into their own listing view with status tabs and order cards." badge="Orders">
      <OrderListWithData orders={orders} />
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
        <SurfaceCard>
          <Text fw={700} size="1.7rem" mb="lg">
            Status timeline
          </Text>
          <Text c="rgba(255,255,255,0.72)">Current status: {order.status.replaceAll('_', ' ')}</Text>
        </SurfaceCard>
        <SurfaceCard>
          <Text fw={700} size="1.7rem" mb="lg">
            Product items
          </Text>
          <Text c="rgba(255,255,255,0.72)">Order product item list goes here.</Text>
        </SurfaceCard>
      </Stack>
    </CustomerShell>
  );
}

export function ProfileScreen() {
  return (
    <CustomerShell title="Profile" subtitle="Profile becomes a dedicated customer hub with orders, favorites, addresses, and settings." activeTab="Profile" badge="Profile">
      <Stack gap="sm">
        {['My Orders', 'My Favorites', 'My Addresses', 'Notifications', 'Settings', 'Contact Us', 'Privacy Policy', 'Terms & Conditions', 'Logout'].map((item) => (
          <SurfaceCard key={item}>
            <Text fw={600}>{item}</Text>
          </SurfaceCard>
        ))}
      </Stack>
    </CustomerShell>
  );
}

export function AddAddressScreen() {
  return (
    <CustomerShell title="Add address" subtitle="Address creation is separated from address listing and checkout." badge="Address form">
      <SurfaceCard>
        <Stack gap="md">
          <TextInput label="Label" placeholder="Home, Studio" radius="md" />
          <TextInput label="City" placeholder="Amman" radius="md" />
          <TextInput label="Area" placeholder="Abdoun" radius="md" />
          <TextInput label="Phone" placeholder="+962..." radius="md" />
          <Switch label="Default address" />
          <Button radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
            Save address
          </Button>
        </Stack>
      </SurfaceCard>
    </CustomerShell>
  );
}

export function EditAddressScreen({ id }: { id: string }) {
  return (
    <CustomerShell title={`Edit address ${id}`} subtitle="Existing addresses can be edited from their own dynamic route." badge="Address form">
      <SurfaceCard>
        <Stack gap="md">
          <TextInput label="Label" placeholder="Home, Studio" radius="md" defaultValue="Coven House" />
          <TextInput label="City" placeholder="Amman" radius="md" defaultValue="Amman" />
          <TextInput label="Area" placeholder="Abdoun" radius="md" defaultValue="Abdoun" />
          <TextInput label="Phone" placeholder="+962..." radius="md" defaultValue="+962 7 9000 1234" />
          <Switch label="Default address" defaultChecked />
          <Button radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
            Update address
          </Button>
        </Stack>
      </SurfaceCard>
    </CustomerShell>
  );
}

export function SettingsScreen() {
  return (
    <CustomerShell title="Settings" subtitle="Customer settings stay separate from profile overview." badge="Settings">
      <Stack gap="sm">
        {['Push notifications', 'Marketing emails', 'Dark appearance', 'Language preference'].map((item) => (
          <SurfaceCard key={item}>
            <Group justify="space-between">
              <Text>{item}</Text>
              <Switch defaultChecked />
            </Group>
          </SurfaceCard>
        ))}
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
        {['Discover categories', 'Save favorites', 'Track orders', 'Manage addresses'].map((item) => (
          <SurfaceCard key={item}>
            <Text fw={600}>{item}</Text>
          </SurfaceCard>
        ))}
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
