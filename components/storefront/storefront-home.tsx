"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  MapPin,
  Star,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { useLocale } from "@/components/storefront/locale-provider";
import {
  Container,
  ProductGrid,
  SectionHeading,
} from "@/components/storefront/storefront-sections";
import {
  FlashSale,
  HeroSlide,
  StoreCategory,
  StoreProduct,
} from "@/lib/commerce-types";

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
  const { t, dir } = useLocale();
  const isRtl = dir === "rtl";
  const heroProduct =
    products.find((product) => product.isFeatured && product.images[0]?.url) ??
    products.find((product) => product.images[0]?.url) ??
    null;
  const quickPicks = products.slice(0, 4);
  const meals = products
    .filter((product) => product.categorySlug === "meals")
    .slice(0, 4);
  const featured = products.filter((product) => product.isFeatured).slice(0, 4);
  const bestSellers = featured.length ? featured : products.slice(0, 4);

  return (
    <div className="bg-[var(--background)] pb-16 md:pb-24">
      <Hero
        product={heroProduct}
        slides={heroSlides}
        previewProducts={quickPicks.slice(0, 3)}
      />

      {flashSale ? <PromoRibbon flashSale={flashSale} /> : null}

      {categories.length ? (
        <PopularCategories categories={categories.slice(0, 4)} />
      ) : null}

      {quickPicks.length ? (
        <Container className="py-12 md:py-16">
          <section>
            <SectionHeading
              eyebrow={t("SPECIAL DISHES")}
              title={t("Our most loved meals")}
              description={t(
                "Fresh wraps, arabi boxes, sides, and sauces arranged for quick ordering.",
              )}
              action={
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                >
                  {t("VIEW MENU")}
                  {isRtl ? (
                    <ArrowLeft className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
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
              eyebrow={t("FULL MEALS")}
              title={t("Boxes, bowls, and platters")}
              description={t(
                "Complete orders with fries, dips, pickles, drinks, and enough sauce.",
              )}
            />
            <ProductGrid products={meals} />
          </section>
        </Container>
      ) : null}

      {bestSellers.length ? (
        <Container className="py-12 md:py-16">
          <section>
            <SectionHeading
              eyebrow={t("POPULAR MENU")}
              title={t("Order again favorites")}
              description={t("The items customers keep coming back for.")}
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
  const { t, localize, locale, dir } = useLocale();

  const slide = slides[0] ?? null;

  const slideImage = slide
    ? locale === "ar"
      ? slide.imageArUrl
      : slide.imageEnUrl
    : "";

  const imageUrl =
    slideImage ||
    product?.images[0]?.url ||
    "https://images.unsplash.com/photo-1662116765994-1e4200c43589?auto=format&fit=crop&w=2200&q=90";

  const title = slide
    ? localize(slide.title, slide.titleAr)
    : t("We provide the best shawerma for you");

  const description = slide?.description
    ? localize(slide.description, slide.descriptionAr)
    : t(
        "Fresh saj wraps, arabi meals, crispy fries, and garlic sauce delivered hot from your nearest branch.",
      );

  return (
    <section className="relative isolate w-full overflow-hidden bg-black">
      <motion.img
        key={imageUrl}
        src={imageUrl}
        alt={title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="block h-auto w-full object-contain object-center"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10 md:hidden" />

      <motion.div
        initial={{
          opacity: 0,
          x: dir === "rtl" ? 40 : -40,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.75,
          delay: 0.15,
        }}
        className="sr-only"
        aria-hidden="true"
      >
        {slide?.eyebrow ? localize(slide.eyebrow, slide.eyebrowAr) : ""}
        {title}
        {description}
      </motion.div>

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

function HeroStat({ value, label }: { value: string; label: string }) {
  const { t } = useLocale();

  return (
    <div className="rounded-lg border border-[#181211]/10 bg-white p-4 shadow-[0_14px_34px_rgba(24,18,17,0.08)]">
      <div className="text-2xl font-bold text-[#c7202f]">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[#5d504d]">
        {t(label)}
      </div>
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
              {t("BEST CATEGORY")}
            </div>
            <h2 className="mt-2 text-3xl font-bold text-[var(--text)] md:text-5xl">
              {t("Choose your craving")}
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden text-sm font-semibold text-[var(--accent)] md:block"
          >
            {t("VIEW MENU")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2.5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.08)] md:p-4 md:rounded-lg"
            >
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#fff8f2] md:rounded-full">
                <img
                  src={category.image}
                  alt={localize(category.name, category.nameAr)}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
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
          <img
            src="https://wowjordan.com/wp-content/uploads/2025/08/import-170-520x397.jpg"
            alt="Wrapped Shawerma 3a Saj sandwich"
            className="aspect-[4/3] w-full rounded-lg bg-[var(--background)] object-contain shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
          />
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              {t("OUR EXPERIENCE")}
            </div>
            <h2 className="mt-3 text-4xl font-bold leading-tight text-[var(--text)] md:text-6xl">
              {t("Fresh saj wraps made for delivery")}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
              {t(
                "The flow is built around fast decisions: choose a category, pick your wrap or meal, add sauces and sides, then checkout for delivery or pickup.",
              )}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <FeatureItem
                icon={<Timer className="h-5 w-5" />}
                title={t("Fast prep")}
              />
              <FeatureItem
                icon={<MapPin className="h-5 w-5" />}
                title={t("Jordan branches")}
              />
              <FeatureItem
                icon={<Star className="h-5 w-5" />}
                title={t("Top rated")}
              />
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
      <div className="text-sm font-bold uppercase tracking-[0.12em]">
        {t(title)}
      </div>
    </div>
  );
}

function WhySaj() {
  const { t } = useLocale();
  const reasons = [
    {
      title: "Authentic saj",
      body: "Thin bread, hot shawerma, garlic, pickles, and sauces in the center of the experience.",
    },
    {
      title: "Easy ordering",
      body: "Menu categories, favorites, cart, saved addresses, and checkout stay clear and quick.",
    },
    {
      title: "Delivery ready",
      body: "The interface is focused on branch pickup, delivery timing, and full meal orders.",
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
            <h3 className="text-2xl font-bold text-[var(--text)]">
              {t(reason.title)}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              {t(reason.body)}
            </p>
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
          <div className="mt-1 text-3xl font-bold">
            {flashSale.discountLabel}
          </div>
        </div>
        <Link
          href={flashSale.ctaUrl || "/shop?sale=true"}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#c7202f]"
        >
          {flashSale.ctaText || t("ORDER THE DEAL")}
          {dir === "rtl" ? (
            <ArrowLeft className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
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
        <div className="text-4xl font-bold">
          {t("NO LIVE MENU CONTENT YET.")}
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {t(
            "Publish categories, images, and active menu items in the database to populate the storefront home.",
          )}
        </p>
      </div>
    </Container>
  );
}
