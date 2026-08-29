'use client';

import { Box, Button, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useLocale } from '@/components/storefront/locale-provider';
import { StorePageContainer, StorePageHeader } from '@/components/storefront/ui/store-layout';

export function DashboardPage({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <StorePageContainer>
      <StorePageHeader title={title} description={description} action={action} />
      {children}
    </StorePageContainer>
  );
}

export function DashboardBackButton({
  href = '/account',
  label = 'BACK TO ACCOUNT',
}: {
  href?: string;
  label?: string;
}) {
  const { t } = useLocale();
  return (
    <Button
      component={Link}
      href={href}
      variant="default"
      radius="xl"
      leftSection={<ArrowLeft size={16} />}
    >
      {t(label)}
    </Button>
  );
}

export function DashboardPrimaryButton({ href, label }: { href: string; label: string }) {
  const { t, dir } = useLocale();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  return (
    <Button
      component={Link}
      href={href}
      radius="xl"
      color="dark"
      rightSection={<Arrow size={16} />}
    >
      {t(label)}
    </Button>
  );
}

export function DashboardPanel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Paper radius="xl" p={{ base: 'md', sm: 'lg' }} withBorder shadow="xs">
      {title ? (
        <Text mb="md" size="xs" c="dimmed" fw={700} tt="uppercase" lts="0.16em">
          {title}
        </Text>
      ) : null}
      {children}
    </Paper>
  );
}

export function DashboardDetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Group
      justify="space-between"
      align="flex-start"
      gap="md"
      py="sm"
      wrap="nowrap"
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={600} ta="end" style={{ overflowWrap: 'anywhere' }}>
        {value}
      </Text>
    </Group>
  );
}

export function DashboardMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <Paper radius="xl" p={{ base: 'sm', sm: 'lg' }} withBorder shadow="xs" style={{ minWidth: 0 }}>
      <Group justify="space-between" gap={6} wrap="nowrap">
        <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts="0.08em" lineClamp={1}>
          {label}
        </Text>
        <ThemeIcon visibleFrom="sm" variant="light" color="dark" radius="xl">
          {icon}
        </ThemeIcon>
      </Group>
      <Title order={2} mt={{ base: 6, sm: 'md' }} fz={{ base: 24, sm: 30 }}>
        {value}
      </Title>
    </Paper>
  );
}

export function DashboardLinkCard({
  href,
  title,
  body,
  icon,
}: {
  href: string;
  title: string;
  body: string;
  icon: ReactNode;
}) {
  const { dir } = useLocale();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  return (
    <Paper
      component={Link}
      href={href}
      radius="xl"
      p="lg"
      withBorder
      shadow="xs"
      style={{ display: 'block', color: 'inherit', textDecoration: 'none', height: '100%' }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Title order={3} fz="lg">
          {title}
        </Title>
        <ThemeIcon variant="light" color="dark" radius="xl" size="lg">
          {icon}
        </ThemeIcon>
      </Group>
      <Text mt="md" size="sm" c="dimmed" lh={1.7}>
        {body}
      </Text>
      <Box mt="md">
        <Arrow size={17} />
      </Box>
    </Paper>
  );
}

export function DashboardEmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <Paper radius="xl" p={{ base: 32, sm: 48 }} withBorder ta="center">
      <Stack align="center" gap="md">
        <Title order={2}>{title}</Title>
        <Text size="sm" c="dimmed" maw={560}>
          {body}
        </Text>
        <DashboardPrimaryButton href={actionHref} label={actionLabel} />
      </Stack>
    </Paper>
  );
}
