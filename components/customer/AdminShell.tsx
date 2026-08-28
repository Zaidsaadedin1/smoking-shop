'use client';

import {
  ActionIcon,
  Avatar,
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import { IconLayoutSidebarLeftCollapse, IconLogout } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useState, useTransition } from 'react';
import { LocaleSwitcher, useLocale } from '@/components/storefront/locale-provider';
import { ThemeSwitcher, useThemeMode } from '@/components/storefront/theme-provider';
import { LoaderBars } from '@/components/ui/loaders-bars';

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
  const { t, dir } = useLocale();
  const { isDark } = useThemeMode();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpened, setMobileNavOpened] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [isNavigating, startNavigation] = useTransition();

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    let mounted = true;

    window.fetch = async (...args) => {
      if (mounted) {
        setRequestCount((count) => count + 1);
      }

      try {
        return await originalFetch(...args);
      } finally {
        if (mounted) {
          setRequestCount((count) => Math.max(0, count - 1));
        }
      }
    };

    return () => {
      mounted = false;
      window.fetch = originalFetch;
    };
  }, []);

  function handleNavigation(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    setMobileNavOpened(false);
    startNavigation(() => {
      if (pathname === href) {
        router.refresh();
        return;
      }

      router.push(href);
    });
  }

  const logoutForm = (
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
  );

  const navigationContent = (isCompact: boolean) => (
    <>
      <Group justify="space-between" mb="xl">
        {!isCompact ? (
          <Stack gap={2}>
            <Text
              fw={800}
              size="lg"
              tt="uppercase"
              style={{ color: 'var(--text)', letterSpacing: 2 }}
            >
              {t('Admin panel')}
            </Text>
            <Text size="xs" tt="uppercase" style={{ color: 'var(--muted)', letterSpacing: 3 }}>
              {t('Store operations')}
            </Text>
          </Stack>
        ) : null}
        <ActionIcon
          variant="subtle"
          color={isDark ? 'gray' : 'red'}
          onClick={() => setCollapsed((value) => !value)}
          style={{ color: 'var(--accent)' }}
        >
          <IconLayoutSidebarLeftCollapse size={18} />
        </ActionIcon>
      </Group>

      <Stack gap="xs">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{ textDecoration: 'none' }}
            onClick={(event) => handleNavigation(event, link.href)}
          >
            <Button
              component="span"
              fullWidth
              justify={isCompact ? 'center' : 'flex-start'}
              radius={0}
              variant={active === link.label ? 'filled' : 'subtle'}
              styles={{
                root: {
                  border: '1px solid var(--border)',
                  background: active === link.label ? 'var(--accent)' : 'transparent',
                  color: active === link.label ? 'var(--background)' : 'var(--text)',
                  fontWeight: 700,
                  letterSpacing: 1.2,
                },
              }}
            >
              {isCompact ? t(link.label).charAt(0) : t(link.label)}
            </Button>
          </Link>
        ))}
      </Stack>

      <Paper
        radius={0}
        p="sm"
        mt="xl"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <Group wrap="nowrap" align="center">
          <Avatar
            radius={0}
            color={isDark ? 'dark' : 'gray'}
            styles={{
              root: {
                background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                color: 'var(--accent)',
              },
            }}
          >
            {session.fullName.slice(0, 1).toUpperCase()}
          </Avatar>
          {!isCompact ? (
            <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
              <Text fw={700} c="var(--text)" truncate>
                {session.fullName}
              </Text>
              <Text size="xs" c="var(--muted)" truncate>
                {session.email}
              </Text>
              <Text size="xs" tt="uppercase" c="var(--accent)" fw={700}>
                {t(session.role)}
              </Text>
            </Stack>
          ) : null}
        </Group>
      </Paper>
    </>
  );

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        color: 'var(--text)',
      }}
    >
      <Box p={{ base: 'sm', sm: 'lg' }}>
        <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
          <div>
            <Text
              fw={800}
              size="sm"
              tt="uppercase"
              style={{ color: 'var(--text)', letterSpacing: 2 }}
            >
              {t('Admin panel')}
            </Text>
            <Text size="xs" tt="uppercase" style={{ color: 'var(--muted)', letterSpacing: 2.6 }}>
              {t('Store operations')}
            </Text>
          </div>
          <Burger
            opened={mobileNavOpened}
            onClick={() => setMobileNavOpened((value) => !value)}
            aria-label={t('Toggle navigation')}
          />
        </div>

        <Drawer
          opened={mobileNavOpened}
          onClose={() => setMobileNavOpened(false)}
          position={dir === 'rtl' ? 'right' : 'left'}
          size="84%"
          title={t('Admin navigation')}
          hiddenFrom="lg"
          styles={{
            content: {
              background: 'var(--background)',
              color: 'var(--text)',
            },
            header: {
              background: 'var(--background)',
              borderBottom: '1px solid var(--border)',
            },
            title: {
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 700,
            },
          }}
        >
          <Stack gap="md">
            {navigationContent(false)}
            <Divider color="var(--border)" />
            <Group justify="space-between" align="center">
              <LocaleSwitcher />
              <ThemeSwitcher />
            </Group>
            {logoutForm}
          </Stack>
        </Drawer>

        <div
          className="flex flex-col items-start gap-5 lg:grid"
          style={{ gridTemplateColumns: collapsed ? '92px 1fr' : '280px 1fr' }}
        >
          <Paper
            visibleFrom="lg"
            radius={0}
            p="md"
            style={{
              position: 'sticky',
              top: 16,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              boxShadow: '0 24px 80px rgba(24, 18, 17, 0.08)',
            }}
          >
            {navigationContent(collapsed)}
          </Paper>

          <Stack gap="lg" style={{ width: '100%', minWidth: 0 }}>
            <Paper
              radius={0}
              p={{ base: 'md', sm: 'lg' }}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                boxShadow: '0 24px 80px rgba(24, 18, 17, 0.08)',
              }}
            >
              <Group justify="space-between" align="start" wrap="wrap" gap="md">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text size="xs" tt="uppercase" c="var(--muted)" style={{ letterSpacing: 2.6 }}>
                    {t('PUFF Jordan control room')}
                  </Text>
                  <Text
                    fw={800}
                    size="clamp(2rem, 5vw, 2.6rem)"
                    mt={6}
                    tt="uppercase"
                    style={{ lineHeight: 1, letterSpacing: 1.2 }}
                  >
                    {t(title)}
                  </Text>
                  <Text mt="sm" c="var(--text-secondary)">
                    {t(subtitle)}
                  </Text>
                </div>

                <Group gap="xs" wrap="wrap">
                  <LocaleSwitcher />
                  <ThemeSwitcher />
                  {logoutForm}
                </Group>
              </Group>
            </Paper>

            {children}
          </Stack>
        </div>
      </Box>
      {requestCount > 0 || isNavigating ? (
        <div
          aria-busy="true"
          role="status"
          aria-label="Loading"
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/95 text-foreground backdrop-blur-sm"
        >
          <LoaderBars barWidth={6} barHeight={46} gap={6} count={5} />
        </div>
      ) : null}
    </Box>
  );
}
