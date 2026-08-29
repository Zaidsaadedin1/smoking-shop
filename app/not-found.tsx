'use client';

import { Box } from '@mantine/core';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import { useLocale } from '@/components/storefront/locale-provider';

export default function NotFound() {
  const { t, dir } = useLocale();

  return (
    <Box
      component="main"
      className="tc-not-found relative isolate min-h-screen overflow-hidden"
      dir={dir}
    >
      <Box
        component="div"
        className="tc-not-found__beam tc-not-found__beam--one"
        aria-hidden="true"
      />
      <Box
        component="div"
        className="tc-not-found__beam tc-not-found__beam--two"
        aria-hidden="true"
      />
      <Box
        component="div"
        className="noise-overlay absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      <Box
        component="section"
        className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-12"
      >
        <Box component="div" className="tc-not-found__content flex flex-col justify-center gap-7">
          <Box component="div" className="tc-not-found__badge">
            <Box component="span">{t('PUFF JO / ERROR')}</Box>
          </Box>

          <Box component="div" className="space-y-5">
            <Box component="p" className="tc-not-found__code">
              404
            </Box>
            <Box component="div" className="space-y-3">
              <Box
                component="h1"
                className="max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl"
              >
                {t('Looks like this page disappeared.')}
              </Box>
              <Box
                component="p"
                className="max-w-xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg"
              >
                {t("The page you're looking for doesn't exist or may have been moved.")}
              </Box>
            </Box>
          </Box>

          <Box component="div" className="flex flex-wrap gap-3">
            <Link href="/shop" className="tc-not-found__button tc-not-found__button--primary">
              <ShoppingBag size={18} aria-hidden="true" />
              {t('BACK TO SHOP')}
            </Link>
            <Link href="/" className="tc-not-found__button tc-not-found__button--secondary">
              <Home size={18} aria-hidden="true" />
              {t('GO HOME')}
            </Link>
          </Box>
          <Link href="/contact-us" className="tc-not-found__helper">
            {t('Need help? Contact us')}{' '}
            {dir === 'rtl' ? (
              <ArrowLeft size={15} aria-hidden="true" />
            ) : (
              <ArrowRight size={15} aria-hidden="true" />
            )}
          </Link>
        </Box>

        <Box component="div" className="tc-not-found__visual" aria-hidden="true">
          <Box component="div" className="tc-not-found__glass-panel">
            <Box component="div" className="tc-not-found__panel-meta">
              <Box component="span">{t('PUFF JO')}</Box>
              <Box component="span">{t('ROUTE / 404')}</Box>
            </Box>
            <Box component="div" className="tc-not-found__package">
              <Box component="div" className="tc-not-found__package-top">
                {t('UNAVAILABLE DROP')}
              </Box>
              <Box component="div" className="tc-not-found__package-mark">
                ?
              </Box>
              <Box component="div" className="tc-not-found__package-bottom">
                {t('NOT FOUND / TRY AGAIN')}
              </Box>
            </Box>
            <Box component="div" className="tc-not-found__panel-line" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
