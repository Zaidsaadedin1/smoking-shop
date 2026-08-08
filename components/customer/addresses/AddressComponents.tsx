import { Button, Stack, Switch, Text, TextInput } from '@mantine/core';
import { Address } from '@/lib/storefront-types';
import { SurfaceCard } from '../shared/SharedComponents';

export function AddressCard({ address }: { address: Address }) {
  return (
    <SurfaceCard>
      <Text fw={600}>{address.label}</Text>
      <Text c="rgba(255,255,255,0.72)">{address.fullName} • {address.phone}</Text>
      <Text size="sm" c="rgba(255,255,255,0.58)">{address.city}, {address.area}</Text>
    </SurfaceCard>
  );
}

export function AddressForm({ buttonLabel }: { buttonLabel: string }) {
  return (
    <SurfaceCard>
      <Stack gap="md">
        <TextInput label="Label" placeholder="Home, Studio" radius="md" />
        <CitySelector />
        <AreaSelector />
        <TextInput label="Phone" placeholder="+962..." radius="md" />
        <DefaultAddressSwitch />
        <Button radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
          {buttonLabel}
        </Button>
      </Stack>
    </SurfaceCard>
  );
}

export function CitySelector() {
  return <TextInput label="CitySelector" placeholder="Amman" radius="md" />;
}

export function AreaSelector() {
  return <TextInput label="AreaSelector" placeholder="Abdoun" radius="md" />;
}

export function DefaultAddressSwitch() {
  return <Switch label="DefaultAddressSwitch" defaultChecked />;
}
