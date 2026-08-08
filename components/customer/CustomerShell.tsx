 'use client';

import {
  Badge,
  Box,
  Container,
  Stack,
  Text,
} from '@mantine/core';
import { PropsWithChildren } from 'react';
import { BottomTabBar } from '@/components/customer/shared/SharedComponents';
import { StoreFooter, StoreHeader } from '@/components/customer/shared/CustomerChrome';
import { useLocale } from '@/components/storefront/locale-provider';
import { useThemeMode } from '@/components/storefront/theme-provider';

type CustomerShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  activeTab?: string;
  badge?: string;
  homeStyle?: boolean;
  hideIntro?: boolean;
}>;

export function CustomerShell({
  children,
  title,
  subtitle,
  activeTab,
  badge,
  homeStyle = false,
  hideIntro = false,
}: CustomerShellProps) {
  const { t } = useLocale();
  useThemeMode();

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'var(--shell-background-legacy)',
        color: 'var(--text)',
      }}
    >
      <Box
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: 'var(--shell-overlay)',
        }}
      />

      <Container size="lg" px="md" py={24} style={{ position: 'relative', zIndex: 1 }}>
        <StoreHeader activeTab={activeTab} homeStyle={homeStyle} />

        {hideIntro ? null : (
          <Stack gap="sm" mb={28}>
            {badge ? (
              <Badge
                variant="gradient"
                gradient={{ from: '#3d1629', to: '#6b2b49', deg: 135 }}
                radius="xl"
                size="lg"
                w="fit-content"
              >
                {t(badge)}
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
              {t(title)}
            </Text>
            <Text size="lg" maw={760} c="var(--text-secondary)" style={{ lineHeight: 1.8 }}>
              {t(subtitle)}
            </Text>
          </Stack>
        )}

        {children}
        <StoreFooter />
        <BottomTabBar activeTab={activeTab} />
      </Container>
    </Box>
  );
}
