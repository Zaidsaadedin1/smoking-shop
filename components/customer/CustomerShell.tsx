import {
  Badge,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import Link from 'next/link';
import { PropsWithChildren } from 'react';
import { BottomTabBar } from '@/components/customer/shared/SharedComponents';
import { mainTabs } from '@/lib/customer-app-data';

type CustomerShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  activeTab?: string;
  badge?: string;
}>;

export function CustomerShell({
  children,
  title,
  subtitle,
  activeTab,
  badge,
}: CustomerShellProps) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, rgba(123, 63, 228, 0.22), transparent 28%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08), transparent 18%), linear-gradient(180deg, #09060d 0%, #110917 46%, #050308 100%)',
        color: '#ffffff',
      }}
    >
      <Box
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 12% 18%, rgba(155, 100, 255, 0.12), transparent 20%), radial-gradient(circle at 88% 10%, rgba(255,255,255,0.05), transparent 13%), radial-gradient(circle at 50% 100%, rgba(64, 31, 102, 0.26), transparent 28%)',
        }}
      />

      <Container size="lg" px="md" py={24} style={{ position: 'relative', zIndex: 1 }}>
        <Paper
          radius="xl"
          p="md"
          mb={28}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <Group justify="space-between" gap="md">
            <Stack gap={2}>
              <Text tt="uppercase" fw={700} size="xs" c="night.1" style={{ letterSpacing: 3 }}>
                Tourmaline Coven
              </Text>
              <Text size="sm" c="rgba(255,255,255,0.65)">
                Customer app
              </Text>
            </Stack>

            <Group gap="xs">
              {mainTabs.map((tab) => (
                <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none' }}>
                  <Button
                    component="span"
                    radius="xl"
                    variant={activeTab === tab.label ? 'gradient' : 'subtle'}
                    gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}
                    color="gray"
                    size="compact-md"
                  >
                    {tab.label}
                  </Button>
                </Link>
              ))}
            </Group>
          </Group>
        </Paper>

        <Stack gap="sm" mb={28}>
          {badge ? (
            <Badge
              variant="gradient"
              gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}
              radius="xl"
              size="lg"
              w="fit-content"
            >
              {badge}
            </Badge>
          ) : null}
          <Text
            component="h1"
            style={{
              margin: 0,
              fontFamily:
                '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif',
              fontSize: 'clamp(2.2rem, 6vw, 4.8rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Text>
          <Text size="lg" maw={760} c="rgba(255,255,255,0.72)" style={{ lineHeight: 1.8 }}>
            {subtitle}
          </Text>
        </Stack>

        {children}
        <BottomTabBar activeTab={activeTab} />
      </Container>
    </Box>
  );
}
