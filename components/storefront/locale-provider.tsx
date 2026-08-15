'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Languages } from 'lucide-react';
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
  const entries: { value: Locale; label: string; shortLabel: string }[] = [
    { value: 'en', label: 'English', shortLabel: localeLabelMap.en },
    { value: 'ar', label: 'العربية', shortLabel: localeLabelMap.ar },
  ];

  return (
    <div
      className="inline-flex h-10 items-center gap-1 rounded-full border p-1 shadow-[0_10px_26px_rgba(199,32,47,0.10)]"
      style={{
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(199,32,47,0.16)',
        background: isDark ? 'rgba(255,255,255,0.06)' : '#fff8f2',
      }}
      aria-label="Change language"
    >
      <span
        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full sm:inline-flex"
        style={{
          color: isDark ? '#fffaf7' : '#c7202f',
          background: isDark ? 'rgba(199,32,47,0.22)' : 'rgba(199,32,47,0.10)',
        }}
        aria-hidden="true"
      >
        <Languages className="h-4 w-4" />
      </span>

      {entries.map((entry) => (
        <button
          key={entry.value}
          type="button"
          onClick={() => setLocale(entry.value)}
          aria-pressed={locale === entry.value}
          className="inline-flex h-8 min-w-9 items-center justify-center rounded-full px-3 text-[12px] font-bold transition md:min-w-[4.65rem]"
          style={{
            background: locale === entry.value ? '#c7202f' : 'transparent',
            color:
              locale === entry.value
                ? '#fffaf7'
                : isDark
                  ? 'rgba(255,250,247,0.70)'
                  : '#5f514b',
            boxShadow: locale === entry.value ? '0 8px 18px rgba(199,32,47,0.24)' : 'none',
          }}
        >
          <span className="md:hidden">{entry.shortLabel}</span>
          <span className="hidden md:inline">{entry.label}</span>
        </button>
      ))}
    </div>
  );
}
