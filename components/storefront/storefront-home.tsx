'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale } from '@/components/storefront/locale-provider';
import { FlashSale, StoreCategory, StoreProduct } from '@/lib/commerce-types';
import {
  CategoryMoodCard,
  Container,
  EditorialBanner,
  NewsletterSection,
  ProductGrid,
  SectionHeading,
  SocialGallery,
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
  const newDrop = products.slice(0, 4);
  const nails = products.filter((product) => product.categorySlug === 'nails').slice(0, 4);
  const featured = products.filter((product) => product.isFeatured).slice(0, 4);

  return (
    <div className="space-y-10 pb-16 md:space-y-16 md:pb-24">
      <Hero />

      {flashSale ? <PromoRibbon flashSale={flashSale} /> : null}

      <CollectionTriptych categories={categories} />

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

      <Container>
        <EditorialBanner />
      </Container>

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

      <Container>
        <section>
          <SectionHeading
            eyebrow="BEST SELLERS"
            title="SHE&apos;S OBSESSED."
            description="The pieces everyone keeps coming back for."
          />
          <ProductGrid products={featured.length ? featured : products.slice(0, 4)} />
        </section>
      </Container>

      <Container>
        <section>
          <SectionHeading eyebrow="SOCIAL" title="FOLLOW THE COVEN" />
          <SocialGallery />
        </section>
      </Container>

      <Container>
        <NewsletterSection />
      </Container>
    </div>
  );
}

function Hero() {
  const { t } = useLocale();

  return (
    <section className="relative min-h-[78vh] overflow-hidden border-b border-[var(--border)] md:min-h-[86vh]">
      <motion.img
        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=80"
        alt="Tourmaline Coven hero"
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
          <div className="text-[10px] tracking-[0.34em] text-white/72">{t('AMMAN AFTER DARK')}</div>
          <h1
            className="mt-6 font-display text-[3.6rem] uppercase leading-[0.86] tracking-[-0.04em] text-[#d5c3a4] md:text-[5.6rem]"
            style={{ textShadow: '0 10px 30px rgba(0,0,0,0.45)' }}
          >
            WHAT
            <br />
            DARKNESS
            <br />
            RETURNS
          </h1>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/shop" className="border border-white/30 bg-black/35 px-5 py-2 text-[11px] tracking-[0.28em] text-white backdrop-blur-sm">
              {t('SHOP THE DROP')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PromoRibbon({ flashSale }: { flashSale: FlashSale }) {
  const { t } = useLocale();

  return (
    <section className="border-y border-[var(--border)] bg-[radial-gradient(circle_at_center,rgba(91,23,36,0.55),rgba(22,10,14,0.95)_58%,#0a0a0a_100%)] px-4 py-5 md:px-8">
      <div className="mx-auto grid max-w-[1440px] items-center gap-4 md:grid-cols-3">
        <PromoPanel kicker="Spend €150 Get" headline="€30 OFF" />
        <div className="text-center">
          <div className="font-display text-5xl uppercase leading-[0.86] text-[#d4b4b4] md:text-6xl">SIN MOZE, SAVE MORE</div>
          <div className="mt-2 text-[10px] tracking-[0.28em] text-white/70">USE CODE: SINMOZE</div>
        </div>
        <PromoPanel kicker="Spend €200 Get" headline="€60 OFF" />
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
  const selected = categories.slice(0, 3);

  return (
    <section className="grid gap-px bg-[var(--border)] md:grid-cols-3">
      {selected.map((category, index) => (
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
