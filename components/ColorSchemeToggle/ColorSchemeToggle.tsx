'use client';

import { Button, Group } from '@mantine/core';
import { useThemeMode } from '@/components/storefront/theme-provider';

export function ColorSchemeToggle() {
  const { setColorScheme } = useThemeMode();

  return (
    <Group justify="center" mt="xl">
      <Button onClick={() => setColorScheme('light')}>Light</Button>
      <Button onClick={() => setColorScheme('dark')}>Dark</Button>
    </Group>
  );
}
