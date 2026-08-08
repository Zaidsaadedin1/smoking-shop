'use client';

import { ActionIcon, Box, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconHeart, IconMenu2, IconShoppingBag } from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LocaleSwitcher, useLocale } from '@/components/storefront/locale-provider';
import { ThemeSwitcher, useThemeMode } from '@/components/storefront/theme-provider';
import { mainTabs } from '@/lib/customer-app-data';

export function StoreHeader({
  activeTab,
  homeStyle = false,
}: {
  activeTab?: string;
  homeStyle?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLocale();
  const { isDark } = useThemeMode();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Paper
      radius="xl"
      p="sm"
      mb={homeStyle ? 18 : 28}
      style={{
        position: 'sticky',
        top: 12,
        zIndex: 20,
        background:
          scrolled || !homeStyle
            ? isDark ? 'rgba(8,8,8,0.82)' : 'rgba(255,255,255,0.86)'
            : isDark ? 'linear-gradient(180deg, rgba(8,8,8,0.28), rgba(8,8,8,0.1))' : 'linear-gradient(180deg, rgba(255,255,255,0.62), rgba(255,255,255,0.24))',
        border: scrolled
          ? '1px solid var(--surface-border)'
          : '1px solid var(--border)',
        backdropFilter: 'blur(16px)',
        transition: 'background 220ms ease, transform 220ms ease, border 220ms ease',
        transform: scrolled ? 'scale(0.995)' : 'scale(1)',
      }}
    >
      <Group justify="space-between" align="center" gap="sm">
        <Group gap="xs">
          <ActionIcon
            size={40}
            radius="xl"
            variant="subtle"
            color="gray"
            style={{ transform: scrolled ? 'scale(0.92)' : 'scale(1)', transition: 'transform 220ms ease' }}
          >
            <IconMenu2 size={18} />
          </ActionIcon>
          <Group gap={6} visibleFrom="sm">
            {mainTabs.slice(0, 2).map((tab) => (
              <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none' }}>
                <Button
                  component="span"
                  radius="xl"
                  variant={activeTab === tab.label ? 'gradient' : 'subtle'}
                  gradient={{ from: '#25111f', to: '#5a2447', deg: 135 }}
                  color="gray"
                  size="compact-md"
                >
                  {t(tab.label)}
                </Button>
              </Link>
            ))}
          </Group>
        </Group>

        <Stack gap={0} align="center" style={{ transform: scrolled ? 'scale(0.94)' : 'scale(1)', transition: 'transform 220ms ease' }}>
          <Text
            tt="uppercase"
            fw={700}
            size="xs"
            c="var(--text-secondary)"
            style={{ letterSpacing: 5 }}
          >
            {t('Tourmaline')}
          </Text>
          <Text
            size="1.25rem"
            style={{
              fontFamily:
                '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif',
              letterSpacing: 2,
            }}
          >
            {t('Coven')}
          </Text>
        </Stack>

        <Group gap="xs">
          <ThemeSwitcher />
          <LocaleSwitcher />
          <Link href="/favorites" style={{ textDecoration: 'none' }}>
            <ActionIcon
              component="span"
              size={40}
              radius="xl"
              variant="subtle"
              color="gray"
              style={{ transform: scrolled ? 'scale(0.92)' : 'scale(1)', transition: 'transform 220ms ease' }}
            >
              <IconHeart size={18} />
            </ActionIcon>
          </Link>
          <Link href="/cart" style={{ textDecoration: 'none' }}>
            <ActionIcon
              component="span"
              size={40}
              radius="xl"
              variant="subtle"
              color="gray"
              style={{ transform: scrolled ? 'scale(0.92)' : 'scale(1)', transition: 'transform 220ms ease' }}
            >
              <IconShoppingBag size={18} />
            </ActionIcon>
          </Link>
        </Group>
      </Group>
    </Paper>
  );
}

export function StoreFooter() {
  const { t } = useLocale();

  return (
    <Paper
      radius="28px"
      p="xl"
      mt={48}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface-border)',
      }}
    >
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <Stack gap={6}>
            <Text
              style={{
                fontFamily:
                  '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif',
                fontSize: '1.9rem',
                letterSpacing: 1,
              }}
            >
              {t('Tourmaline Coven')}
            </Text>
            <Text c="var(--text-secondary)" maw={420}>
              {t('Dark feminine fashion, gothic jewelry, and ritual-inspired pieces built as a premium storefront.')}
            </Text>
          </Stack>

          <Group gap="xs" visibleFrom="sm">
            {[
              { label: 'Shop', href: '/products' },
              { label: 'Orders', href: '/orders' },
              { label: 'Contact', href: '/contact-us' },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <Button component="span" radius="xl" variant="subtle" color="gray">
                  {t(link.label)}
                </Button>
              </Link>
            ))}
          </Group>
        </Group>

        <Group justify="space-between" align="center" gap="md">
          <Group gap="sm" wrap="wrap">
            {['Secure checkout', 'Worldwide aesthetic', 'Limited drops'].map((item) => (
              <Text key={item} size="sm" c="var(--text-secondary)">
                {t(item)}
              </Text>
            ))}
          </Group>
          <Text size="sm" c="var(--muted)">
            © 2026 Tourmaline Coven
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}
