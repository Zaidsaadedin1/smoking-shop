'use client';

import { Badge, Button, Group, Paper, Progress, Stack, Switch, Text, TextInput } from '@mantine/core';
import Link from 'next/link';
import { ReactNode } from 'react';
import { mainTabs } from '@/lib/customer-app-data';
import { useLocale } from '@/components/storefront/locale-provider';

export function SurfaceCard({ children }: { children: ReactNode }) {
  return (
    <Paper
      radius="xl"
      p="xl"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface-border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        color: 'var(--text)',
      }}
    >
      {children}
    </Paper>
  );
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <Text size="xs" tt="uppercase" c="var(--muted)" style={{ letterSpacing: 2 }}>
      {children}
    </Text>
  );
}

export function SearchBar({ placeholder = 'Search products, collections, brands' }: { placeholder?: string }) {
  const { t } = useLocale();
  return <TextInput placeholder={t(placeholder)} radius="xl" />;
}

export function SearchInput() {
  return <SearchBar placeholder="Search by product, category, or brand" />;
}

export function BottomTabBar({ activeTab }: { activeTab?: string }) {
  const { t } = useLocale();

  return (
    <Paper
      radius="xl"
      p="sm"
      mt={24}
      style={{
        position: 'sticky',
        bottom: 16,
        background: 'var(--surface-strong)',
        border: '1px solid var(--surface-border)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <Group grow>
        {mainTabs.map((tab) => (
          <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none' }}>
            <Button
              component="span"
              fullWidth
              radius="xl"
              size="compact-md"
              variant={activeTab === tab.label ? 'gradient' : 'subtle'}
              gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}
              color="gray"
            >
              {t(tab.label)}
            </Button>
          </Link>
        ))}
      </Group>
    </Paper>
  );
}

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { t } = useLocale();

  return (
    <Stack gap={4} mb="lg">
      <Text fw={700} size="2rem">
        {t(title)}
      </Text>
      <Text c="var(--text-secondary)">{t(subtitle)}</Text>
    </Stack>
  );
}

export function EmailInput() {
  const { t } = useLocale();
  return <TextInput label={t('Email')} placeholder={t('name@example.com')} radius="md" />;
}

export function PhoneInput() {
  const { t } = useLocale();
  return <TextInput label={t('Phone')} placeholder={t('+962...')} radius="md" />;
}

export function PasswordField() {
  const { t } = useLocale();
  return <TextInput label={t('Password')} placeholder={t('Enter your password')} radius="md" type="password" />;
}

export function PasswordStrength({ value = 72 }: { value?: number }) {
  const { t } = useLocale();
  return (
    <Stack gap={6}>
      <Text size="sm" c="var(--text-secondary)">
        {t('Password strength')}
      </Text>
      <Progress value={value} color="grape" radius="xl" />
    </Stack>
  );
}

export function SocialLoginButton({ label, asSpan = false }: { label: string; asSpan?: boolean }) {
  const { t } = useLocale();
  return (
    <Button component={asSpan ? 'span' : 'button'} radius="xl" variant="default" color="dark">
      {t(label)}
    </Button>
  );
}

export function AuthSubmitButton({ label }: { label: string }) {
  const { t } = useLocale();
  return (
    <Button radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
      {t(label)}
    </Button>
  );
}

export function SettingToggle({ label, checked = true }: { label: string; checked?: boolean }) {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Group justify="space-between">
        <Text>{t(label)}</Text>
        <Switch defaultChecked={checked} />
      </Group>
    </SurfaceCard>
  );
}

export function StatusPill({ label }: { label: string }) {
  const { t } = useLocale();
  return (
    <Badge color="grape" variant="light" radius="xl">
      {t(label)}
    </Badge>
  );
}
