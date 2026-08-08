'use client';

import { Avatar, Group, Stack, Text } from '@mantine/core';
import { useLocale } from '@/components/storefront/locale-provider';
import { SurfaceCard } from '../shared/SharedComponents';

export function ProfileHeader() {
  const { t } = useLocale();
  return (
    <Group justify="space-between">
      <div>
        <Text fw={700} size="2rem">{t('ProfileHeader')}</Text>
        <Text c="rgba(255,255,255,0.58)">{t('Customer profile hub')}</Text>
      </div>
      <ProfileAvatar />
    </Group>
  );
}

export function ProfileAvatar() {
  return <Avatar radius="xl" size={56}>TC</Avatar>;
}

export function ProfileInfo() {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Stack gap={4}>
        <Text fw={700}>{t('ProfileInfo')}</Text>
        <Text c="rgba(255,255,255,0.58)">Lina Haddad • lina@example.com • +962...</Text>
      </Stack>
    </SurfaceCard>
  );
}

export function ProfileMenuItem({ label }: { label: string }) {
  const { t } = useLocale();
  return (
    <SurfaceCard>
      <Text fw={600}>{t(label)}</Text>
    </SurfaceCard>
  );
}
