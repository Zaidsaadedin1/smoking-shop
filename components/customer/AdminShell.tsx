'use client';

import { ActionIcon, Avatar, Box, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconLayoutSidebarLeftCollapse, IconLogout } from '@tabler/icons-react';
import Link from 'next/link';
import { PropsWithChildren, useState } from 'react';
import { LocaleSwitcher, useLocale } from '@/components/storefront/locale-provider';
import { ThemeSwitcher, useThemeMode } from '@/components/storefront/theme-provider';

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
  session: {
    fullName: string;
    email: string;
    role: 'admin' | 'super_admin';
  };
}>;

export function AdminShell({ children, title, subtitle, active, session }: AdminShellProps) {
  const { t } = useLocale();
  const { isDark } = useThemeMode();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'var(--admin-background)',
        color: 'var(--text)',
      }}
    >
      <Box p="lg">
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: collapsed ? '92px 1fr' : '280px 1fr',
            gap: 20,
            alignItems: 'start',
          }}
        >
          <Paper
            radius={0}
            p="md"
            style={{
              position: 'sticky',
              top: 16,
              background: isDark ? 'rgba(12,12,12,0.92)' : 'rgba(255,250,247,0.88)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(24px)',
              boxShadow: isDark ? 'none' : '0 24px 80px rgba(50, 26, 24, 0.08)',
            }}
          >
            <Group justify="space-between" mb="xl">
              {!collapsed ? (
                <Stack gap={2}>
                  <Text fw={800} size="lg" tt="uppercase" style={{ letterSpacing: 2 }}>
                    {t('Admin panel')}
                  </Text>
                  <Text size="xs" c="var(--muted)" tt="uppercase" style={{ letterSpacing: 3 }}>
                    {t('Dark operations')}
                  </Text>
                </Stack>
              ) : null}
                  <ActionIcon variant="subtle" color={isDark ? 'gray' : 'dark'} onClick={() => setCollapsed((value) => !value)}>
                    <IconLayoutSidebarLeftCollapse size={18} />
                  </ActionIcon>
            </Group>

            <Stack gap="xs">
              {adminLinks.map((link) => (
                <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                  <Button
                    component="span"
                    fullWidth
                    justify={collapsed ? 'center' : 'flex-start'}
                    radius={0}
                    variant={active === link.label ? 'filled' : 'subtle'}
                    styles={{
                      root: {
                        border: '1px solid var(--border)',
                        background: active === link.label ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(23,23,23,0.08)') : 'transparent',
                        color: 'var(--text)',
                        letterSpacing: 1.5,
                      },
                    }}
                  >
                    {collapsed ? link.label.charAt(0) : t(link.label)}
                  </Button>
                </Link>
              ))}
            </Stack>

            <Paper
              radius={0}
              p="sm"
              mt="xl"
              style={{
                background: isDark ? 'rgba(22,22,22,0.92)' : 'rgba(255,255,255,0.86)',
                border: '1px solid var(--border)',
              }}
            >
              <Group wrap="nowrap" align="center">
                <Avatar
                  radius={0}
                  color={isDark ? 'dark' : 'gray'}
                  styles={{
                    root: {
                      background: isDark ? '#171717' : '#ece3de',
                      color: isDark ? '#f4f4f4' : '#171717',
                    },
                  }}
                >
                  {session.fullName.slice(0, 1).toUpperCase()}
                </Avatar>
                {!collapsed ? (
                  <Stack gap={0} style={{ flex: 1 }}>
                    <Text fw={600}>{session.fullName}</Text>
                    <Text size="xs" c="var(--muted)">
                      {session.email}
                    </Text>
                    <Text size="xs" tt="uppercase" c="var(--muted)">
                      {session.role}
                    </Text>
                  </Stack>
                ) : null}
              </Group>
            </Paper>
          </Paper>

          <Stack gap="lg">
            <Paper
              radius={0}
              p="lg"
              style={{
                background: isDark ? 'rgba(12,12,12,0.92)' : 'rgba(255,250,247,0.88)',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(24px)',
                boxShadow: isDark ? 'none' : '0 24px 80px rgba(50, 26, 24, 0.08)',
              }}
            >
              <Group justify="space-between" align="start">
                <div>
                  <Text size="xs" tt="uppercase" c="var(--muted)" style={{ letterSpacing: 2.6 }}>
                    {t('Operations dashboard')}
                  </Text>
                  <Text fw={800} size="2.6rem" mt={6} tt="uppercase" style={{ lineHeight: 1, letterSpacing: 1.2 }}>
                    {t(title)}
                  </Text>
                  <Text mt="sm" c="var(--text-secondary)">
                    {t(subtitle)}
                  </Text>
                </div>

                <Group gap="xs">
                  <LocaleSwitcher />
                  <ThemeSwitcher />
                  <form
                    action="/api/admin/logout"
                    method="post"
                    onSubmit={(event) => {
                      event.preventDefault();
                      fetch('/api/admin/logout', { method: 'POST' }).then(() => {
                        window.location.href = '/admin/login';
                      });
                    }}
                  >
                    <Button type="submit" leftSection={<IconLogout size={16} />} variant="default" radius={0}>
                      {t('Logout')}
                    </Button>
                  </form>
                </Group>
              </Group>
            </Paper>

            {children}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
