'use client';

import Link from 'next/link';
import { ArrowRight, Home, ShoppingBag } from 'lucide-react';
import { useLocale } from '@/components/storefront/locale-provider';

export default function NotFound() {
  const { t, dir } = useLocale();

  return (
    <main className="tc-not-found relative isolate min-h-screen overflow-hidden" dir={dir}>
      <div className="tc-not-found__beam tc-not-found__beam--one" aria-hidden="true" />
      <div className="tc-not-found__beam tc-not-found__beam--two" aria-hidden="true" />
      <div className="noise-overlay absolute inset-0 pointer-events-none" aria-hidden="true" />

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-12">
        <div className="tc-not-found__content flex flex-col justify-center gap-7">
          <div className="tc-not-found__badge">
            <span>{t('PUFF JO / ERROR')}</span>
          </div>

          <div className="space-y-5">
            <p className="tc-not-found__code">404</p>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                {t('Looks like this page disappeared.')}
              </h1>
              <p className="max-w-xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                {t("The page you're looking for doesn't exist or may have been moved.")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className="tc-not-found__button tc-not-found__button--primary">
              <ShoppingBag size={18} aria-hidden="true" />
              {t('BACK TO SHOP')}
            </Link>
            <Link href="/" className="tc-not-found__button tc-not-found__button--secondary">
              <Home size={18} aria-hidden="true" />
              {t('GO HOME')}
            </Link>
          </div>
          <Link href="/contact-us" className="tc-not-found__helper">
            {t('Need help? Contact us')} <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="tc-not-found__visual" aria-hidden="true">
          <div className="tc-not-found__glass-panel">
            <div className="tc-not-found__panel-meta">
              <span>{t('PUFF JO')}</span>
              <span>{t('ROUTE / 404')}</span>
            </div>
            <div className="tc-not-found__package">
              <div className="tc-not-found__package-top">{t('UNAVAILABLE DROP')}</div>
              <div className="tc-not-found__package-mark">?</div>
              <div className="tc-not-found__package-bottom">{t('NOT FOUND / TRY AGAIN')}</div>
            </div>
            <div className="tc-not-found__panel-line" />
          </div>
        </div>
      </section>
    </main>
  );
}
