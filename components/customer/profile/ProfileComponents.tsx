import { Avatar, Group, Stack, Text } from '@mantine/core';
import { SurfaceCard } from '../shared/SharedComponents';

export function ProfileHeader() {
  return (
    <Group justify="space-between">
      <div>
        <Text fw={700} size="2rem">ProfileHeader</Text>
        <Text c="rgba(255,255,255,0.58)">Customer profile hub</Text>
      </div>
      <ProfileAvatar />
    </Group>
  );
}

export function ProfileAvatar() {
  return <Avatar radius="xl" size={56}>TC</Avatar>;
}

export function ProfileInfo() {
  return (
    <SurfaceCard>
      <Stack gap={4}>
        <Text fw={700}>ProfileInfo</Text>
        <Text c="rgba(255,255,255,0.58)">Lina Haddad • lina@example.com • +962...</Text>
      </Stack>
    </SurfaceCard>
  );
}

export function ProfileMenuItem({ label }: { label: string }) {
  return (
    <SurfaceCard>
      <Text fw={600}>{label}</Text>
    </SurfaceCard>
  );
}
