import { Box, Button, Container, Group, Paper, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

const adminLinks = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Customers', href: '/admin/customers' },
  { label: 'Settings', href: '/admin/settings' },
];

type AdminShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  active: string;
}>;

export function AdminShell({ children, title, subtitle, active }: AdminShellProps) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, rgba(123, 63, 228, 0.22), transparent 28%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08), transparent 18%), linear-gradient(180deg, #09060d 0%, #110917 46%, #050308 100%)',
        color: '#ffffff',
      }}
    >
      <Container size="xl" px="lg" py={28}>
        <Paper
          radius="xl"
          p="md"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Group justify="space-between">
            <Stack gap={2}>
              <Text tt="uppercase" fw={700} size="xs" c="night.1" style={{ letterSpacing: 3 }}>
                Tourmaline Coven
              </Text>
              <Text size="sm" c="rgba(255,255,255,0.65)">
                Admin panel
              </Text>
            </Stack>
            <Group gap="xs">
              {adminLinks.map((link) => (
                <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                  <Button
                    component="span"
                    radius="xl"
                    variant={active === link.label ? 'gradient' : 'subtle'}
                    gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}
                    color="gray"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </Group>
          </Group>
        </Paper>

        <Stack gap="sm" mt={40} mb={28}>
          <Text
            component="h1"
            style={{
              margin: 0,
              fontFamily:
                '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif',
              fontSize: 'clamp(2.4rem, 5vw, 4.6rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Text>
          <Text size="lg" maw={800} c="rgba(255,255,255,0.72)" style={{ lineHeight: 1.8 }}>
            {subtitle}
          </Text>
        </Stack>

        {children}
      </Container>
    </Box>
  );
}
