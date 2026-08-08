'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '@/components/storefront/locale-provider';
import { FlashSale, StoreCategory, StoreProduct } from '@/lib/commerce-types';
import {
  Container,
  ProductGrid,
  SectionHeading,
} from '@/components/storefront/storefront-sections';

export function StorefrontHome({
  categories,
  products,
  flashSale,
}: {
  categories: StoreCategory[];
  products: StoreProduct[];
  flashSale: FlashSale | null;
}) {
  const { t } = useLocale();
  const heroProduct = products.find((product) => product.isFeatured && product.images[0]?.url) ?? products.find((product) => product.images[0]?.url) ?? null;
  const newDrop = products.slice(0, 4);
  const nails = products.filter((product) => product.categorySlug === 'nails').slice(0, 4);
  const featured = products.filter((product) => product.isFeatured).slice(0, 4);
  const collectionCategories = categories.filter((category) => category.image).slice(0, 3);
  const bestSellers = featured.length ? featured : products.slice(0, 4);

  return (
    <div className="space-y-10 pb-16 md:space-y-16 md:pb-24">
      <Hero product={heroProduct} />

      {flashSale ? <PromoRibbon flashSale={flashSale} /> : null}

      {collectionCategories.length ? <CollectionTriptych categories={collectionCategories} /> : null}

      {newDrop.length ? (
        <Container>
          <section>
            <SectionHeading
              eyebrow="NEW ARRIVALS"
              title="THE NEW DROP"
              description="Limited pieces. Once they&apos;re gone, they&apos;re gone."
              action={
                <Link href="/shop?sort=newest" className="text-sm tracking-[0.2em] text-[var(--text-secondary)]">
                  {t('EXPLORE ALL')}
                </Link>
              }
            />
            <ProductGrid products={newDrop} />
          </section>
        </Container>
      ) : null}

      {heroProduct ? <FeaturedStory product={heroProduct} /> : null}

      {nails.length ? (
        <Container>
          <section>
            <SectionHeading
              eyebrow="NAILS"
              title="NAILS FOR BAD DECISIONS."
              description="Small details. Dangerous energy."
            />
            <div className="scrollbar-hidden -mx-4 flex gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
              {nails.map((product) => (
                <div key={product.id} className="min-w-[68vw] md:min-w-0">
                  <ProductGrid products={[product]} />
                </div>
              ))}
            </div>
          </section>
        </Container>
      ) : null}

      {bestSellers.length ? (
        <Container>
          <section>
            <SectionHeading
              eyebrow="BEST SELLERS"
              title="SHE&apos;S OBSESSED."
              description="The pieces everyone keeps coming back for."
            />
            <ProductGrid products={bestSellers} />
          </section>
        </Container>
      ) : null}

      {!products.length ? <HomeEmptyState /> : null}
    </div>
  );
}

function Hero({ product }: { product: StoreProduct | null }) {
  const { t } = useLocale();

  if (!product?.images[0]?.url) {
    return (
      <section className="relative min-h-[58vh] overflow-hidden border-b border-[var(--border)]">
        <div className="relative flex min-h-[58vh] items-end justify-center pb-14">
          <div className="max-w-[700px] px-6 text-center">
            <div className="text-[10px] tracking-[0.34em] text-[var(--text-secondary)]">{t('STORE')}</div>
            <h1 className="mt-6 font-display text-[3rem] uppercase leading-[0.86] tracking-[-0.04em] md:text-[4.6rem]">
              {t('YOUR CATALOG IS READY FOR ITS FIRST DROP.')}
            </h1>
            <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">
              {t('Add active products and categories in admin to populate the storefront home automatically.')}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/shop" className="border border-[var(--border)] bg-[var(--surface)] px-5 py-2 text-[11px] tracking-[0.28em]">
                {t('VIEW SHOP')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[78vh] overflow-hidden border-b border-[var(--border)] md:min-h-[86vh]">
      <motion.img
        src={product.images[0].url}
        alt={product.images[0].alt}
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="noise-overlay absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.18)_20%,rgba(0,0,0,0.66)_100%)]" />
      <div className="relative flex min-h-[78vh] items-end justify-center pb-14 md:min-h-[86vh] md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-[560px] px-6 text-center"
        >
          <div className="text-[10px] tracking-[0.34em] text-white/72">{product.brand}</div>
          <h1
            className="mt-6 font-display text-[3.6rem] uppercase leading-[0.86] tracking-[-0.04em] text-[#d5c3a4] md:text-[5.6rem]"
            style={{ textShadow: '0 10px 30px rgba(0,0,0,0.45)' }}
          >
            {t(product.name)}
          </h1>
          {product.shortDescription ? (
            <p className="mt-5 text-sm leading-7 text-white/78">{t(product.shortDescription)}</p>
          ) : null}
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href={`/product/${product.slug}`} className="border border-white/30 bg-black/35 px-5 py-2 text-[11px] tracking-[0.28em] text-white backdrop-blur-sm">
              {t('SHOP THIS PIECE')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PromoRibbon({ flashSale }: { flashSale: FlashSale }) {
  return (
    <section className="border-y border-[var(--border)] bg-[radial-gradient(circle_at_center,rgba(91,23,36,0.55),rgba(22,10,14,0.95)_58%,#0a0a0a_100%)] px-4 py-5 md:px-8">
      <div className="mx-auto grid max-w-[1440px] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <PromoPanel kicker={flashSale.title} headline={flashSale.discountLabel} />
        <div className="text-center">
          <div className="font-display text-5xl uppercase leading-[0.86] text-[#d4b4b4] md:text-6xl">{flashSale.title}</div>
          {flashSale.description ? (
            <div className="mt-2 text-[10px] tracking-[0.28em] text-white/70">{flashSale.description}</div>
          ) : null}
        </div>
        <div className="flex justify-center md:justify-end">
          <Link href={flashSale.ctaUrl || '/shop?sale=true'} className="border border-white/10 bg-black/14 px-6 py-5 text-center">
            <div className="text-[11px] tracking-[0.24em] text-white/68">{flashSale.ctaText || 'SHOP SALE'}</div>
            <div className="mt-2 inline-flex items-center gap-2 font-display text-4xl text-[#d5c3c3] md:text-5xl">
              {flashSale.discountLabel}
              <ArrowRight className="h-5 w-5" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

function PromoPanel({ kicker, headline }: { kicker: string; headline: string }) {
  return (
    <div className="border border-white/10 bg-black/14 px-6 py-5 text-center">
      <div className="text-[11px] tracking-[0.24em] text-white/68">{kicker}</div>
      <div className="mt-2 font-display text-6xl text-[#d5c3c3] md:text-7xl">{headline}</div>
    </div>
  );
}

function CollectionTriptych({ categories }: { categories: StoreCategory[] }) {
  return (
    <section className="grid gap-px bg-[var(--border)] md:grid-cols-3">
      {categories.map((category) => (
        <Link key={category.id} href={`/shop?category=${category.slug}`} className="group relative block overflow-hidden bg-black">
          <img
            src={category.image}
            alt={category.name}
            className="h-[440px] w-full object-cover transition duration-500 group-hover:scale-[1.03] md:h-[520px]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.22)_30%,rgba(0,0,0,0.7)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-center">
            <div className="text-[11px] tracking-[0.3em] text-white/60">{category.accent}</div>
            <div className="mt-2 text-xl font-medium uppercase tracking-[0.18em] text-white md:text-2xl">
              {category.name}
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}

function FeaturedStory({ product }: { product: StoreProduct }) {
  const { t } = useLocale();

  if (!product.images[1]?.url) {
    return null;
  }

  return (
    <Container>
      <section className="grid gap-0 overflow-hidden border border-[var(--border)] lg:grid-cols-[1.05fr_0.95fr]">
        <img src={product.images[1].url} alt={product.images[1].alt} className="h-full min-h-[360px] w-full object-cover md:min-h-[520px]" />
        <div className="flex items-end bg-[var(--card)] p-8 md:p-12">
          <div className="max-w-xl">
            <div className="text-xs tracking-[0.3em] text-[var(--muted)]">{product.brand}</div>
            <div className="mt-4 text-4xl font-semibold uppercase tracking-[0.18em] leading-none md:text-6xl">{t(product.name)}</div>
            {product.description ? (
              <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--text-secondary)]">
                {t(product.description)}
              </p>
            ) : null}
            <Link href={`/product/${product.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm tracking-[0.2em]">
              {t('DISCOVER THIS PRODUCT')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </Container>
  );
}

function HomeEmptyState() {
  const { t } = useLocale();

  return (
    <Container>
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-10 text-center">
        <div className="font-display text-4xl uppercase">{t('NO LIVE HOME CONTENT YET.')}</div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {t('Publish categories, images, and active products in the database to populate the storefront home.')}
        </p>
      </div>
    </Container>
  );
}
