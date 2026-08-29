'use client';

import { Alert, Grid, Group, Paper, Radio, Stack, Text, Title } from '@mantine/core';
import { Dispatch, SetStateAction } from 'react';
import {
  StoreNativeSelect,
  StoreTextarea,
  StoreTextInput,
} from '@/components/storefront/ui/store-form-controls';

export type CheckoutFormState = {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  area: string;
  street: string;
  building: string;
  notes: string;
  paymentMethod: string;
};

type Option = { value: string; label: string };

export function CheckoutDetailsPanel({
  form,
  setForm,
  countryOptions,
  cityOptions,
  hasConfiguredDelivery,
  deliveryFee,
  t,
}: {
  form: CheckoutFormState;
  setForm: Dispatch<SetStateAction<CheckoutFormState>>;
  countryOptions: Option[];
  cityOptions: Option[];
  hasConfiguredDelivery: boolean;
  deliveryFee: string;
  t: (text: string) => string;
}) {
  const fields: Array<{ label: string; key: keyof CheckoutFormState }> = [
    { label: 'Full Name', key: 'fullName' },
    { label: 'Phone', key: 'phone' },
    { label: 'Area', key: 'area' },
    { label: 'Street', key: 'street' },
    { label: 'Building', key: 'building' },
  ];

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Text size="xs" c="dimmed" style={{ letterSpacing: '0.22em' }}>
          02
        </Text>
        <Title order={2} tt="uppercase" size="h3">
          {t('DELIVERY ADDRESS')}
        </Title>
        <Text size="sm" c="dimmed">
          {t('Where should we deliver your order?')}
        </Text>
      </Stack>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <StoreNativeSelect
            label={t('Country')}
            value={form.country}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                country: event.target.value,
                city: '',
              }))
            }
            data={[{ label: t('Select a country'), value: '' }, ...countryOptions]}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <StoreNativeSelect
            label={t('City')}
            value={form.city}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            data={[{ label: t('Select a city'), value: '' }, ...cityOptions]}
          />
        </Grid.Col>
        {fields.map((field) => (
          <Grid.Col key={field.key} span={{ base: 12, md: field.key === 'street' ? 12 : 6 }}>
            <StoreTextInput
              label={t(field.label)}
              value={form[field.key]}
              onChange={(event) =>
                setForm((current) => ({ ...current, [field.key]: event.target.value }))
              }
            />
          </Grid.Col>
        ))}
      </Grid>

      {form.city && hasConfiguredDelivery ? (
        <Alert color="green">
          {t('Delivery available')} · {t('Estimated fee')}: {deliveryFee}
        </Alert>
      ) : null}

      <Stack gap="md">
        <Stack gap="xs">
          <Text size="xs" c="dimmed" style={{ letterSpacing: '0.22em' }}>
            03
          </Text>
          <Title order={2} tt="uppercase" size="h3">
            {t('PAYMENT')}
          </Title>
          <Text size="sm" c="dimmed">
            {t('Choose how you would like to pay.')}
          </Text>
        </Stack>
        <Paper
          component="button"
          type="button"
          withBorder
          radius="md"
          p="md"
          onClick={() => setForm((current) => ({ ...current, paymentMethod: 'cash_on_delivery' }))}
          style={{ width: '100%', textAlign: 'start', cursor: 'pointer' }}
        >
          <Group justify="space-between" wrap="nowrap">
            <Group wrap="nowrap">
              <Radio checked={form.paymentMethod === 'cash_on_delivery'} readOnly />
              <Stack gap={2}>
                <Text size="sm" fw={600}>
                  {t('Cash on Delivery')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('Pay when your order arrives')}
                </Text>
              </Stack>
            </Group>
            <Text>{form.paymentMethod === 'cash_on_delivery' ? '✓' : ''}</Text>
          </Group>
        </Paper>
      </Stack>

      <StoreTextarea
        id="checkout-notes"
        label={t('Delivery instructions (optional)')}
        value={form.notes}
        onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
        placeholder={t('Add delivery instructions or a note for your order')}
      />
    </Stack>
  );
}
