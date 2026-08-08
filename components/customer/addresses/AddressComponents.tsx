'use client';

import { Button, Stack, Switch, Text, TextInput } from '@mantine/core';
import { useLocale } from '@/components/storefront/locale-provider';
import { Address } from '@/lib/storefront-types';
import { SurfaceCard } from '../shared/SharedComponents';

export function AddressCard({ address }: { address: Address }) {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Text fw={600}>{t(address.label)}</Text>
      <Text c="rgba(255,255,255,0.72)">{address.fullName} • {address.phone}</Text>
      <Text size="sm" c="rgba(255,255,255,0.58)">{address.city}, {address.area}</Text>
    </SurfaceCard>
  );
}

export function AddressForm({ buttonLabel }: { buttonLabel: string }) {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Stack gap="md">
        <TextInput label={t('Label')} placeholder={t('Home, Studio')} radius="md" />
        <CitySelector />
        <AreaSelector />
        <TextInput label={t('Phone')} placeholder={t('+962...')} radius="md" />
        <DefaultAddressSwitch />
        <Button radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
          {t(buttonLabel)}
        </Button>
      </Stack>
    </SurfaceCard>
  );
}

export function CitySelector() {
  const { t } = useLocale();
  return <TextInput label={t('CitySelector')} placeholder={t('Amman')} radius="md" />;
}

export function AreaSelector() {
  const { t } = useLocale();
  return <TextInput label={t('AreaSelector')} placeholder={t('Abdoun')} radius="md" />;
}

export function DefaultAddressSwitch() {
  const { t } = useLocale();
  return <Switch label={t('DefaultAddressSwitch')} defaultChecked />;
}
