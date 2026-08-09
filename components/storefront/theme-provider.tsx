'use client';

import { ActionIcon, MantineProvider } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { theme } from '@/theme';

type ThemeScheme = 'light' | 'dark';

type ThemeModeContextValue = {
  colorScheme: ThemeScheme;
  isDark: boolean;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ThemeScheme) => void;
};

const THEME_STORAGE_KEY = 'tourmaline-coven-color-scheme';

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

function readInitialColorScheme(): ThemeScheme {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ThemeScheme>('dark');

  useEffect(() => {
    setColorSchemeState(readInitialColorScheme());
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = colorScheme;
    document.documentElement.style.colorScheme = colorScheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, colorScheme);
  }, [colorScheme]);

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      colorScheme,
      isDark: colorScheme === 'dark',
      toggleColorScheme: () =>
        setColorSchemeState((current) => (current === 'dark' ? 'light' : 'dark')),
      setColorScheme: setColorSchemeState,
    }),
    [colorScheme]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <MantineProvider theme={theme} forceColorScheme={colorScheme}>
        {children}
      </MantineProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const value = useContext(ThemeModeContext);

  if (!value) {
    throw new Error('useThemeMode must be used within AppThemeProvider');
  }

  return value;
}

export function ThemeSwitcher() {
  const { colorScheme, toggleColorScheme, isDark } = useThemeMode();

  return (
    <ActionIcon
      variant="default"
      color={isDark ? 'gray' : 'dark'}
      radius="xl"
      size={40}
      onClick={toggleColorScheme}
      aria-label={colorScheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      styles={{
        root: {
          border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(23,23,23,0.10)',
          background: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(255,255,255,0.72)',
          color: isDark ? '#f4f4f4' : '#171717',
        },
      }}
    >
      {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
    </ActionIcon>
  );
}
