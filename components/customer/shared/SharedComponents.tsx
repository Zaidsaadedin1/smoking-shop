import { Badge, Button, Group, Paper, Progress, Stack, Switch, Text, TextInput } from '@mantine/core';
import Link from 'next/link';
import { ReactNode } from 'react';
import { mainTabs } from '@/lib/customer-app-data';

export function SurfaceCard({ children }: { children: ReactNode }) {
  return (
    <Paper
      radius="xl"
      p="xl"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}
    >
      {children}
    </Paper>
  );
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <Text size="xs" tt="uppercase" c="rgba(255,255,255,0.5)" style={{ letterSpacing: 2 }}>
      {children}
    </Text>
  );
}

export function SearchBar({ placeholder = 'Search products, collections, brands' }: { placeholder?: string }) {
  return <TextInput placeholder={placeholder} radius="xl" />;
}

export function SearchInput() {
  return <SearchBar placeholder="Search by product, category, or brand" />;
}

export function BottomTabBar({ activeTab }: { activeTab?: string }) {
  return (
    <Paper
      radius="xl"
      p="sm"
      mt={24}
      style={{
        position: 'sticky',
        bottom: 16,
        background: 'rgba(8,5,14,0.88)',
        border: '1px solid rgba(255,255,255,0.08)',
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
              {tab.label}
            </Button>
          </Link>
        ))}
      </Group>
    </Paper>
  );
}

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Stack gap={4} mb="lg">
      <Text fw={700} size="2rem">
        {title}
      </Text>
      <Text c="rgba(255,255,255,0.68)">{subtitle}</Text>
    </Stack>
  );
}

export function EmailInput() {
  return <TextInput label="Email" placeholder="name@example.com" radius="md" />;
}

export function PhoneInput() {
  return <TextInput label="Phone" placeholder="+962..." radius="md" />;
}

export function PasswordField() {
  return <TextInput label="Password" placeholder="Enter your password" radius="md" type="password" />;
}

export function PasswordStrength({ value = 72 }: { value?: number }) {
  return (
    <Stack gap={6}>
      <Text size="sm" c="rgba(255,255,255,0.58)">
        Password strength
      </Text>
      <Progress value={value} color="grape" radius="xl" />
    </Stack>
  );
}

export function SocialLoginButton({ label, asSpan = false }: { label: string; asSpan?: boolean }) {
  return (
    <Button component={asSpan ? 'span' : 'button'} radius="xl" variant="default" color="dark">
      {label}
    </Button>
  );
}

export function AuthSubmitButton({ label }: { label: string }) {
  return (
    <Button radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
      {label}
    </Button>
  );
}

export function SettingToggle({ label, checked = true }: { label: string; checked?: boolean }) {
  return (
    <SurfaceCard>
      <Group justify="space-between">
        <Text>{label}</Text>
        <Switch defaultChecked={checked} />
      </Group>
    </SurfaceCard>
  );
}

export function StatusPill({ label }: { label: string }) {
  return (
    <Badge color="grape" variant="light" radius="xl">
      {label}
    </Badge>
  );
}
