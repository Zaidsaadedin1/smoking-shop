'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Cloud, MapPin, Star, Timer, Zap } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useLocale } from '@/components/storefront/locale-provider';
import {
  Container,
  ProductGrid,
  SectionHeading,
} from '@/components/storefront/storefront-sections';
import { FlashSale, StoreCategory, StoreProduct } from '@/lib/commerce-types';

export function StorefrontHome({
  categories,
  products,
  flashSale,
}: {
  categories: StoreCategory[];
  products: StoreProduct[];
  flashSale: FlashSale | null;
}) {
  const { t, dir } = useLocale();
  const isRtl = dir === 'rtl';
  const quickPicks = products.slice(0, 4);
  const refills = products.filter((product) => product.categorySlug !== 'meals').slice(0, 4);
  const featured = products.filter((product) => product.isFeatured).slice(0, 4);
  const bestSellers = featured.length ? featured : products.slice(0, 4);

  return (
    <div className="bg-[var(--background)] pb-16 md:pb-24">
      <Hero />

      {flashSale ? <PromoRibbon flashSale={flashSale} /> : null}

      {categories.length ? <PopularCategories categories={categories.slice(0, 4)} /> : null}

      {quickPicks.length ? (
        <Container className="py-12 md:py-16">
          <section>
            <SectionHeading
              eyebrow={t('FEATURED GEAR')}
              title={t('Your next vape, sorted.')}
              description={t(
                'Original devices, e-liquids, pods, coils, and accessories delivered across Amman and Jordan.'
              )}
              action={
                <Link
                  href="/shop"
                  className="!text-black inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold"
                >
                  {t('VIEW SHOP')}
                  {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </Link>
              }
            />
            <ProductGrid products={quickPicks} />
          </section>
        </Container>
      ) : null}

      <FeatureBand />

      {refills.length ? (
        <Container className="py-12 md:py-16">
          <section>
            <SectionHeading
              eyebrow={t('FLAVORS & E-LIQUIDS')}
              title={t('Find a flavor you will come back to')}
              description={t(
                'Browse fruit, mint, dessert, tobacco, and icy blends for your everyday setup.'
              )}
            />
            <ProductGrid products={refills} />
          </section>
        </Container>
      ) : null}

      {bestSellers.length ? (
        <Container className="py-12 md:py-16">
          <section>
            <SectionHeading
              eyebrow={t('POPULAR IN JORDAN')}
              title={t('What people are buying')}
              description={t('Reliable gear and flavors our customers keep coming back for.')}
            />
            <ProductGrid products={bestSellers} />
          </section>
        </Container>
      ) : null}

      <WhyVapor />

      {!products.length ? <HomeEmptyState /> : null}
    </div>
  );
}

function Hero() {
  const { t, dir } = useLocale();
  const title = t('Your go-to vape shop in Jordan.');
  const description = t(
    'Shop trusted vape devices, e-liquids, pods, coils, and accessories with delivery across Amman and Jordan.'
  );

  return (
    <section className="relative isolate overflow-hidden bg-[#0b0c0c] text-[#f4f1e8]">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-20 md:grid-cols-[1.05fr_.95fr] md:px-12 md:py-28">
        <motion.div
          initial={{ opacity: 0, x: dir === 'rtl' ? 30 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-2xl"
        >
          <div className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-white">
            <Cloud className="h-4 w-4" /> {t('PUFF JO / VAPE SHOP IN JORDAN')}
          </div>
          <h1 className="max-w-xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-8xl">
            {title}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#b7c0b9] md:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="!text-black inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.12em] transition hover:bg-neutral-200"
            >
              {t('SHOP VAPE GEAR')}
              {dir === 'rtl' ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-[#b7c0b9]">
              <Zap className="h-4 w-4 text-white" /> {t('18+ ONLY')}
            </span>
          </div>
        </motion.div>
        <div className="relative flex min-h-[310px] items-center justify-center md:min-h-[430px]">
          <div className="absolute h-64 w-64 rounded-full border border-white/25 md:h-96 md:w-96" />
          <div className="absolute h-48 w-48 rounded-full border border-white/10 md:h-72 md:w-72" />
          <div className="relative flex h-64 w-44 -rotate-6 flex-col justify-between rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-[#27352d] via-[#101513] to-[#070908] p-5 shadow-[0_35px_90px_rgba(0,0,0,.5)] md:h-80 md:w-56">
            <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.18em] text-white">
              <span>PUFF/JOR</span>
              <span>01</span>
            </div>
            <div>
              <div className="text-7xl font-black tracking-[-.12em] text-[#f4f1e8]">V</div>
              <div className="mt-2 text-[9px] uppercase tracking-[.3em] text-[#b7c0b9]">
                {t('Vape essentials')}
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white" />
          </div>
          <div className="absolute bottom-4 right-2 rotate-12 rounded-2xl border border-white/15 bg-[#171b1a] px-4 py-3 text-xs font-bold uppercase tracking-[.15em] text-[#b7c0b9] shadow-xl md:right-10">
            <span className="text-white">{t('Ready for pickup')}</span>
            <br />
            {t('in Jordan')}
          </div>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 md:block">
        <div className="flex h-10 w-6 justify-center rounded-full border border-white/40 pt-2">
          <motion.div
            animate={{
              y: [0, 10, 0],
              opacity: [1, 0.3, 1],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
            }}
            className="h-1.5 w-1.5 rounded-full bg-white"
          />
        </div>
      </div>
    </section>
  );
}

function PopularCategories({ categories }: { categories: StoreCategory[] }) {
  const { t, localize } = useLocale();

  return (
    <Container className="py-12 md:py-16">
      <section>
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              {t('SHOP BY CATEGORY')}
            </div>
            <h2 className="mt-2 text-3xl font-bold text-[var(--text)] md:text-5xl">
              {t('Find what fits your setup')}
            </h2>
          </div>
          <Link href="/shop" className="hidden text-sm font-semibold text-[var(--accent)] md:block">
            {t('VIEW SHOP')}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-2.5 shadow-[0_14px_35px_rgba(0,0,0,.14)] transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[0_22px_50px_rgba(0,0,0,.22)] md:p-4"
            >
              <div className="aspect-square w-full overflow-hidden rounded-[17px] border border-white/8 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.12),transparent_35%),#171717] md:rounded-[18px]">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={localize(category.name, category.nameAr)}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : null}
              </div>

              <div className="mt-2 text-center text-sm font-bold leading-5 text-[var(--text)] md:mt-4 md:text-lg">
                {localize(category.name, category.nameAr)}
              </div>

              <p className="mt-1 hidden text-center text-xs leading-5 text-[var(--text-secondary)] md:mt-2 md:line-clamp-2 md:block md:text-sm">
                {localize(category.description, category.descriptionAr)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}

function FeatureBand() {
  const { t } = useLocale();

  return (
    <section className="bg-[var(--background-secondary)] py-12 md:py-16">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[28px] bg-[#0b0c0c] shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
            <div className="absolute -left-10 top-8 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
            <div className="relative h-48 w-32 rounded-[2rem] border border-white/15 bg-gradient-to-br from-[#344438] to-[#101512] p-4 text-[#f4f1e8] shadow-2xl md:h-60 md:w-40">
              <div className="text-[9px] font-bold tracking-[.2em] text-white">PUFF JORDAN</div>
              <div className="mt-10 text-6xl font-black tracking-[-.14em]">V</div>
              <div className="absolute bottom-4 left-4 right-4 h-1 rounded-full bg-white" />
            </div>
            <div className="absolute bottom-7 right-8 rounded-full border border-white/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-white">
              {t('Trusted gear in Jordan')}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              {t('PUFF JO STANDARD')}
            </div>
            <h2 className="mt-3 text-4xl font-bold leading-tight text-[var(--text)] md:text-6xl">
              {t('Everything for your vape setup')}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
              {t(
                'Shop trusted devices, fresh e-liquids, pods, coils, and accessories with straightforward delivery across Jordan.'
              )}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <FeatureItem icon={<Timer className="h-5 w-5" />} title={t('Fast dispatch')} />
              <FeatureItem icon={<MapPin className="h-5 w-5" />} title={t('Curated gear')} />
              <FeatureItem icon={<Star className="h-5 w-5" />} title={t('Trusted quality')} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FeatureItem({ icon, title }: { icon: ReactNode; title: string }) {
  const { t } = useLocale();

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--text)] shadow-[0_14px_34px_rgba(0,0,0,0.12)]">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--accent)_12%,var(--background))] text-[var(--accent)]">
        {icon}
      </div>
      <div className="text-sm font-bold uppercase tracking-[0.12em]">{t(title)}</div>
    </div>
  );
}

function WhyVapor() {
  const { t } = useLocale();
  const reasons = [
    {
      title: 'Reliable devices',
      body: 'Dependable vape devices and accessories for your daily setup, whether you are starting fresh or upgrading.',
    },
    {
      title: 'Flavors for every mood',
      body: 'Choose from fruit, mint, dessert, tobacco, and icy blends stocked for different tastes.',
    },
    {
      title: 'Delivery across Jordan',
      body: 'Order online, confirm your address, and get your everyday vape essentials delivered to your door.',
    },
  ];

  return (
    <Container className="py-12 md:py-16">
      <section className="grid gap-4 md:grid-cols-3">
        {reasons.map((reason) => (
          <div
            key={reason.title}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6"
          >
            <div className="mb-4 h-1.5 w-12 rounded-full bg-[var(--accent)]" />
            <h3 className="text-2xl font-bold text-[var(--text)]">{t(reason.title)}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{t(reason.body)}</p>
          </div>
        ))}
      </section>
    </Container>
  );
}

function PromoRibbon({ flashSale }: { flashSale: FlashSale }) {
  const { t, dir } = useLocale();

  return (
    <section className="bg-white px-4 py-5 text-black md:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">
            {t(flashSale.title)}
          </div>
          <div className="mt-1 text-3xl font-bold">{t(flashSale.discountLabel)}</div>
        </div>
        <Link
          href={flashSale.ctaUrl || '/shop?sale=true'}
          className="!text-white inline-flex w-fit items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em]"
        >
          {flashSale.ctaText ? t(flashSale.ctaText) : t('ORDER THE DEAL')}
          {dir === 'rtl' ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </Link>
      </div>
    </section>
  );
}

function HomeEmptyState() {
  const { t } = useLocale();

  return (
    <Container className="py-12">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-10 text-center">
        <div className="text-4xl font-bold">{t('NO LIVE PRODUCTS YET.')}</div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {t(
            'We are updating the shelves. Check back soon for devices, flavors, pods, coils, and accessories.'
          )}
        </p>
      </div>
    </Container>
  );
}
