'use client';

import { Box } from '@mantine/core';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Languages } from 'lucide-react';
import { Locale, translateText } from '@/lib/i18n';
import { useThemeMode } from '@/components/storefront/theme-provider';

type LocaleContextValue = {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
  t: (text: string) => string;
  localize: (english?: string | null, arabic?: string | null) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  function applyLocale(nextLocale: Locale) {
    setLocaleState(nextLocale);
    window.localStorage.setItem('tourmaline-coven-locale', nextLocale);
  }

  useEffect(() => {
    const stored = window.localStorage.getItem('tourmaline-coven-locale');
    if (stored === 'en' || stored === 'ar') {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (
        event.key === 'tourmaline-coven-locale' &&
        (event.newValue === 'en' || event.newValue === 'ar')
      ) {
        setLocaleState(event.newValue);
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir: locale === 'ar' ? 'rtl' : 'ltr',
      setLocale: applyLocale,
      t: (text) => translateText(text, locale),
      localize: (english, arabic) => {
        if (locale === 'ar') {
          return arabic?.trim() || english?.trim() || '';
        }

        return english?.trim() || arabic?.trim() || '';
      },
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);

  if (!value) {
    throw new Error('useLocale must be used within LocaleProvider');
  }

  return value;
}

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();
  const { isDark } = useThemeMode();

  return (
    <Box
      component="button"
      type="button"
      onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-[0_10px_26px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5"
      style={{
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.16)',
        background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
        color: isDark ? '#ffffff' : '#111111',
      }}
      aria-label={`${t('Change language')}. ${t('Current language')}: ${locale === 'ar' ? 'العربية' : 'English'}`}
      title={`${t('Change language')} (${locale === 'en' ? 'العربية' : 'English'})`}
    >
      <Languages className="h-4 w-4" />
    </Box>
  );
}
