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
            <Text fw={800} size="lg" tt="uppercase" style={{ color: '#181211', letterSpacing: 2 }}>
              {t('Admin panel')}
            </Text>
            <Text size="xs" tt="uppercase" style={{ color: '#80716d', letterSpacing: 3 }}>
              {t('Restaurant operations')}
            </Text>
          </Stack>
        ) : null}
        <ActionIcon variant="subtle" color="red" onClick={() => setCollapsed((value) => !value)}>
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
                  border: '1px solid rgba(24,18,17,0.10)',
                  background: active === link.label ? '#c7202f' : 'transparent',
                  color: active === link.label ? '#ffffff' : '#181211',
                  fontWeight: 700,
                  letterSpacing: 1.2,
                },
              }}
            >
              {isCompact ? link.label.charAt(0) : t(link.label)}
            </Button>
          </Link>
        ))}
      </Stack>

      <Paper
        radius={0}
        p="sm"
        mt="xl"
        style={{
          background: '#fffefe',
          border: '1px solid rgba(24,18,17,0.10)',
        }}
      >
        <Group wrap="nowrap" align="center">
          <Avatar
            radius={0}
            color={isDark ? 'dark' : 'gray'}
            styles={{
              root: {
                background: '#fff0f1',
                color: '#c7202f',
              },
            }}
          >
            {session.fullName.slice(0, 1).toUpperCase()}
          </Avatar>
          {!isCompact ? (
            <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
              <Text fw={700} c="#181211" truncate>
                {session.fullName}
              </Text>
              <Text size="xs" c="#80716d" truncate>
                {session.email}
              </Text>
              <Text size="xs" tt="uppercase" c="#c7202f" fw={700}>
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
        background: '#f8f4f1',
        color: '#181211',
      }}
    >
      <Box p={{ base: 'sm', sm: 'lg' }}>
        <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
          <div>
            <Text fw={800} size="sm" tt="uppercase" style={{ color: '#181211', letterSpacing: 2 }}>
              {t('Admin panel')}
            </Text>
            <Text size="xs" tt="uppercase" style={{ color: '#80716d', letterSpacing: 2.6 }}>
              {t('Restaurant operations')}
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
          position="left"
          size="84%"
          title={t('Admin navigation')}
          hiddenFrom="lg"
          styles={{
            content: {
              background: '#fffefe',
              color: '#181211',
            },
            header: {
              background: '#fffefe',
              borderBottom: '1px solid rgba(24,18,17,0.10)',
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
              background: '#fffefe',
              border: '1px solid rgba(24,18,17,0.10)',
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
                background: '#fffefe',
                border: '1px solid rgba(24,18,17,0.10)',
                borderRadius: 8,
                boxShadow: '0 24px 80px rgba(24, 18, 17, 0.08)',
              }}
            >
              <Group justify="space-between" align="start" wrap="wrap" gap="md">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text size="xs" tt="uppercase" c="var(--muted)" style={{ letterSpacing: 2.6 }}>
                    {t('Restaurant control room')}
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
                  <Text mt="sm" c="#5d504d">
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
        <Box
          aria-busy="true"
          aria-live="polite"
          role="status"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'grid',
            placeItems: 'center',
            background: isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(3px)',
          }}
        >
          <Stack
            align="center"
            gap="sm"
            p="lg"
            style={{
              minWidth: 240,
              background: '#fffefe',
              border: '1px solid rgba(199,32,47,0.16)',
              borderRadius: 16,
              boxShadow: '0 24px 64px rgba(24,18,17,0.24)',
            }}
          >
            <div className="tc-api-overlay__mark" aria-hidden="true">
              <span className="tc-api-overlay__steam tc-api-overlay__steam--left" />
              <span className="tc-api-overlay__steam tc-api-overlay__steam--center" />
              <span className="tc-api-overlay__steam tc-api-overlay__steam--right" />
              <img src="/shawerma-3a-saj-logo.jpg" alt="" className="tc-api-overlay__logo" />
            </div>
            <Text size="xs" tt="uppercase" fw={800} c="#c7202f" style={{ letterSpacing: 2 }}>
              {t('Kitchen control')}
            </Text>
            <Text size="sm" fw={800} tt="uppercase" c="#181211" style={{ letterSpacing: 1.4 }}>
              {t('Syncing admin updates')}
            </Text>
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}
