'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Flame, MapPin, Star, Timer } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useLocale } from '@/components/storefront/locale-provider';
import {
  Container,
  ProductGrid,
  SectionHeading,
} from '@/components/storefront/storefront-sections';
import { FlashSale, HeroSlide, StoreCategory, StoreProduct } from '@/lib/commerce-types';

export function StorefrontHome({
  categories,
  products,
  flashSale,
  heroSlides,
}: {
  categories: StoreCategory[];
  products: StoreProduct[];
  flashSale: FlashSale | null;
  heroSlides: HeroSlide[];
}) {
  const { t } = useLocale();
  const heroProduct =
    products.find((product) => product.isFeatured && product.images[0]?.url) ??
    products.find((product) => product.images[0]?.url) ??
    null;
  const quickPicks = products.slice(0, 4);
  const meals = products.filter((product) => product.categorySlug === 'meals').slice(0, 4);
  const featured = products.filter((product) => product.isFeatured).slice(0, 4);
  const bestSellers = featured.length ? featured : products.slice(0, 4);

  return (
    <div className="bg-[var(--background)] pb-16 md:pb-24">
      <Hero product={heroProduct} slides={heroSlides} previewProducts={quickPicks.slice(0, 3)} />

      {flashSale ? <PromoRibbon flashSale={flashSale} /> : null}

      {categories.length ? <PopularCategories categories={categories.slice(0, 4)} /> : null}

      {quickPicks.length ? (
        <Container className="py-12 md:py-16">
          <section>
            <SectionHeading
              eyebrow="SPECIAL DISHES"
              title="Our most loved meals"
              description="Fresh wraps, arabi boxes, sides, and sauces arranged for quick ordering."
              action={
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                >
                  {t('VIEW MENU')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            <ProductGrid products={quickPicks} />
          </section>
        </Container>
      ) : null}

      <FeatureBand />

      {meals.length ? (
        <Container className="py-12 md:py-16">
          <section>
            <SectionHeading
              eyebrow="FULL MEALS"
              title="Boxes, bowls, and platters"
              description="Complete orders with fries, dips, pickles, drinks, and enough sauce."
            />
            <ProductGrid products={meals} />
          </section>
        </Container>
      ) : null}

      {bestSellers.length ? (
        <Container className="py-12 md:py-16">
          <section>
            <SectionHeading
              eyebrow="POPULAR MENU"
              title="Order again favorites"
              description="The items customers keep coming back for."
            />
            <ProductGrid products={bestSellers} />
          </section>
        </Container>
      ) : null}

      <WhySaj />

      {!products.length ? <HomeEmptyState /> : null}
    </div>
  );
}

function Hero({
  product,
  slides,
  previewProducts,
}: {
  product: StoreProduct | null;
  slides: HeroSlide[];
  previewProducts: StoreProduct[];
}) {
  const { t, localize, locale } = useLocale();
  const slide = slides[0] ?? null;
  const slideImage = slide ? (locale === 'ar' ? slide.imageArUrl : slide.imageEnUrl) : '';
  const imageUrl =
    slideImage ||
    product?.images[0]?.url ||
    'https://images.unsplash.com/photo-1662116765994-1e4200c43589?auto=format&fit=crop&w=1400&q=80';
  const title = slide
    ? localize(slide.title, slide.titleAr)
    : t('We provide the best shawerma for you');
  const description = slide?.description
    ? localize(slide.description, slide.descriptionAr)
    : t(
        'Fresh saj wraps, arabi meals, crispy fries, and garlic sauce delivered hot from your nearest branch.'
      );

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[#fffefe] text-[#181211]">
      <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,#c7202f_1px,transparent_0)] [background-size:28px_28px]" />
      <Container className="relative grid min-h-[calc(100vh-88px)] items-center gap-10 py-10 md:grid-cols-[0.95fr_1.05fr] md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c7202f]/15 bg-[#fff0f1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#c7202f]">
            <Flame className="h-4 w-4" />
            {t('WORLD BEST SHAWERMA')}
          </div>
          <h1 className="mt-6 text-5xl font-bold leading-[0.95] tracking-normal text-[#181211] md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#5d504d] md:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={slide?.buttonUrl || '/shop'}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#c7202f] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-[0_18px_36px_rgba(199,32,47,0.22)]"
            >
              {slide ? localize(slide.buttonText, slide.buttonTextAr) : t('ORDER NOW')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-12 items-center rounded-full border border-[#181211]/12 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#181211]"
            >
              {t('ABOUT US')}
            </Link>
          </div>
          <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">
            <HeroStat value="20+" label="Branches" />
            <HeroStat value="4.9" label="Rating" />
            <HeroStat value="15m" label="Pickup prep" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.1 }}
          className="relative min-h-[460px]"
        >
          <div className="absolute left-1/2 top-1/2 h-[78vw] max-h-[580px] w-[78vw] max-w-[580px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff0f1]" />
          <div className="absolute right-0 top-7 rounded-full bg-[#c7202f] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(199,32,47,0.24)]">
            {t('Hot & fresh')}
          </div>
          <img
            src={imageUrl}
            alt={product ? localize(product.name, product.nameAr) : 'Shawerma 3a Saj meal'}
            className="relative mx-auto aspect-square w-full max-w-[540px] rounded-full border-[18px] border-white object-cover shadow-[0_28px_70px_rgba(24,18,17,0.18)]"
          />
          {previewProducts.length ? (
            <div className="absolute bottom-0 left-0 right-0 mx-auto grid max-w-xl gap-3 rounded-lg border border-[#181211]/10 bg-white/95 p-3 shadow-[0_20px_50px_rgba(24,18,17,0.14)] backdrop-blur md:grid-cols-3">
              {previewProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.slug}`}
                  className="flex items-center gap-3 rounded-lg bg-[#f8f4f1] p-2"
                >
                  <img
                    src={item.images[0]?.url}
                    alt={localize(item.name, item.nameAr)}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <span className="line-clamp-2 text-xs font-semibold text-[#181211]">
                    {localize(item.name, item.nameAr)}
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
        </motion.div>
      </Container>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  const { t } = useLocale();

  return (
    <div className="rounded-lg border border-[#181211]/10 bg-white p-4 shadow-[0_14px_34px_rgba(24,18,17,0.08)]">
      <div className="text-2xl font-bold text-[#c7202f]">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[#5d504d]">{t(label)}</div>
    </div>
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
              {t('BEST CATEGORY')}
            </div>
            <h2 className="mt-2 text-3xl font-bold text-[var(--text)] md:text-5xl">
              {t('Choose your craving')}
            </h2>
          </div>
          <Link href="/shop" className="hidden text-sm font-semibold text-[var(--accent)] md:block">
            {t('VIEW MENU')}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[0_20px_44px_rgba(0,0,0,0.08)]"
            >
              <img
                src={category.image}
                alt={localize(category.name, category.nameAr)}
                className="aspect-square w-full rounded-full object-cover"
              />
              <div className="mt-4 text-center text-lg font-bold text-[var(--text)]">
                {localize(category.name, category.nameAr)}
              </div>
              <p className="mt-2 line-clamp-2 text-center text-sm leading-6 text-[var(--text-secondary)]">
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
    <section className="bg-[#f8f4f1] py-12 md:py-16">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <img
            src="https://wowjordan.com/wp-content/uploads/2025/08/import-170-520x397.jpg"
            alt="Wrapped Shawerma 3a Saj sandwich"
            className="aspect-[4/3] w-full rounded-lg object-cover shadow-[0_24px_60px_rgba(24,18,17,0.14)]"
          />
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c7202f]">
              {t('OUR EXPERIENCE')}
            </div>
            <h2 className="mt-3 text-4xl font-bold leading-tight text-[#181211] md:text-6xl">
              {t('Fresh saj wraps made for delivery')}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#5d504d]">
              {t(
                'The flow is built around fast decisions: choose a category, pick your wrap or meal, add sauces and sides, then checkout for delivery or pickup.'
              )}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <FeatureItem icon={<Timer className="h-5 w-5" />} title="Fast prep" />
              <FeatureItem icon={<MapPin className="h-5 w-5" />} title="Jordan branches" />
              <FeatureItem icon={<Star className="h-5 w-5" />} title="Top rated" />
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
    <div className="rounded-lg border border-[#181211]/10 bg-white p-4 text-[#181211]">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0f1] text-[#c7202f]">
        {icon}
      </div>
      <div className="text-sm font-bold uppercase tracking-[0.12em]">{t(title)}</div>
    </div>
  );
}

function WhySaj() {
  const { t } = useLocale();
  const reasons = [
    {
      title: 'Authentic saj',
      body: 'Thin bread, hot shawerma, garlic, pickles, and sauces in the center of the experience.',
    },
    {
      title: 'Easy ordering',
      body: 'Menu categories, favorites, cart, saved addresses, and checkout stay clear and quick.',
    },
    {
      title: 'Delivery ready',
      body: 'The interface is focused on branch pickup, delivery timing, and full meal orders.',
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
    <section className="bg-[#c7202f] px-4 py-5 text-white md:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            {flashSale.title}
          </div>
          <div className="mt-1 text-3xl font-bold">{flashSale.discountLabel}</div>
        </div>
        <Link
          href={flashSale.ctaUrl || '/shop?sale=true'}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#c7202f]"
        >
          {flashSale.ctaText || t('ORDER THE DEAL')}
          <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
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
        <div className="text-4xl font-bold">{t('NO LIVE MENU CONTENT YET.')}</div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {t(
            'Publish categories, images, and active menu items in the database to populate the storefront home.'
          )}
        </p>
      </div>
    </Container>
  );
}
