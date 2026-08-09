'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Locale, localeLabelMap, translateText } from '@/lib/i18n';
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
      if (event.key === 'tourmaline-coven-locale' && (event.newValue === 'en' || event.newValue === 'ar')) {
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
  const { locale, setLocale } = useLocale();
  const { isDark } = useThemeMode();

  return (
    <div
      className="inline-flex overflow-hidden rounded-full border"
      style={{
        borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(23,23,23,0.10)',
        background: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(255,255,255,0.72)',
      }}
    >
      {(['en', 'ar'] as Locale[]).map((entry) => (
        <button
          key={entry}
          type="button"
          onClick={() => setLocale(entry)}
          className="px-3 py-2 text-[11px] tracking-[0.2em] transition"
          style={{
            background: locale === entry ? (isDark ? '#f4f4f4' : '#171717') : 'transparent',
            color:
              locale === entry
                ? isDark
                  ? '#111112'
                  : '#fffaf7'
                : isDark
                  ? 'var(--text-secondary)'
                  : 'rgba(23,23,23,0.62)',
          }}
        >
          {localeLabelMap[entry]}
        </button>
      ))}
    </div>
  );
}
