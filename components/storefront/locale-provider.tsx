'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Locale, localeLabelMap, translateText } from '@/lib/i18n';

type LocaleContextValue = {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
  t: (text: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const stored = window.localStorage.getItem('tourmaline-coven-locale');
    if (stored === 'en' || stored === 'ar') {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    window.localStorage.setItem('tourmaline-coven-locale', locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir: locale === 'ar' ? 'rtl' : 'ltr',
      setLocale: setLocaleState,
      t: (text) => translateText(text, locale),
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

  return (
    <div className="inline-flex overflow-hidden rounded-full border border-white/10 bg-black/20">
      {(['en', 'ar'] as Locale[]).map((entry) => (
        <button
          key={entry}
          type="button"
          onClick={() => setLocale(entry)}
          className={`px-3 py-2 text-[11px] tracking-[0.2em] transition ${
            locale === entry ? 'bg-white text-black' : 'text-[var(--text-secondary)]'
          }`}
        >
          {localeLabelMap[entry]}
        </button>
      ))}
    </div>
  );
}
