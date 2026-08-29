"use client";

import { Box, Button, Image, Paper, Text } from "@mantine/core";
import { MotionBox } from "@/components/storefront/ui/motion-box";

import { ArrowLeft, ArrowRight, Cloud, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/storefront/locale-provider";
import {
  Container,
  ProductGrid,
  SectionHeading,
} from "@/components/storefront/storefront-sections";
import { formatCurrency, getPrimaryPrice } from "@/lib/commerce-utils";
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
  const quickPicks = products.slice(0, 4);
  const refills = products
    .filter((product) => product.categorySlug !== "meals")
    .slice(0, 8);
  const featured = products.filter((product) => product.isFeatured).slice(0, 4);
  const bestSellers = featured.length ? featured : products.slice(0, 4);

  return (
    <Box
      component="div"
      className="overflow-x-clip bg-[var(--background)] pb-16 md:pb-24"
    >
      <Hero slides={heroSlides} />

      {flashSale ? <PromoRibbon flashSale={flashSale} /> : null}

      {categories.length ? (
        <PopularCategories categories={categories.slice(0, 4)} />
      ) : null}

      {quickPicks.length ? (
        <Container className="py-20 md:py-32">
          <Box component="section">
            <SectionHeading
              eyebrow={t("FEATURED GEAR")}
              title={t("Your next vape, sorted.")}
              description={t(
                "Original devices, e-liquids, pods, coils, and accessories delivered across Amman and Jordan.",
              )}
              action={
                <Link
                  href="/shop"
                  className="!text-black inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold"
                >
                  {t("VIEW SHOP")}
                  {isRtl ? (
                    <ArrowLeft className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Link>
              }
            />
            <ProductGrid products={quickPicks} />
          </Box>
        </Container>
      ) : null}

      {refills.length ? (
        <Container className="bg-[var(--background-secondary)] py-20 md:my-4 md:py-28">
          <Box component="section">
            <SectionHeading
              eyebrow={t("FLAVORS & E-LIQUIDS")}
              title={t("Find a flavor you will come back to")}
              description={t(
                "Browse fruit, mint, dessert, tobacco, and icy blends for your everyday setup.",
              )}
            />
            <FlavorRail products={refills} />
          </Box>
        </Container>
      ) : null}

      {bestSellers.length ? (
        <Container className="py-20 md:py-32">
          <Box component="section">
            <SectionHeading
              eyebrow={t("POPULAR IN JORDAN")}
              title={t("What people are buying")}
              description={t(
                "Reliable gear and flavors our customers keep coming back for.",
              )}
            />
            <RankingRail products={bestSellers} />
          </Box>
        </Container>
      ) : null}

      <WhyVapor />

      {!products.length ? <HomeEmptyState /> : null}
    </Box>
  );
}

function Hero({ slides }: { slides: HeroSlide[] }) {
  const { t, dir } = useLocale();
  const slide = slides[0];
  const imageUrl = dir === "rtl" ? slide?.imageArUrl : slide?.imageEnUrl;
  const [imageRatio, setImageRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      return;
    }
    const image = new window.Image();
    image.onload = () => {
      if (image.naturalWidth && image.naturalHeight) {
        setImageRatio(image.naturalWidth / image.naturalHeight);
      }
    };
    image.src = imageUrl;
  }, [imageUrl]);
  const title = slide
    ? dir === "rtl"
      ? slide.titleAr || slide.title
      : slide.title
    : t("Your go-to vape shop in Jordan.");
  const description = slide
    ? dir === "rtl"
      ? slide.descriptionAr || slide.description
      : slide.description
    : t(
        "Shop trusted vape devices, e-liquids, pods, coils, and accessories with delivery across Amman and Jordan.",
      );

  return (
    <Box
      component="section"
      className={`hero-backdrop relative isolate w-full min-w-0 min-h-[560px] overflow-hidden bg-[#0b0c0c] text-[#f4f1e8] md:min-h-[720px] ${slide ? "has-slide" : ""}`}
      style={
        slide?.imageEnUrl || slide?.imageArUrl
          ? {
              backgroundImage: `linear-gradient(90deg, rgba(11,12,12,.9), rgba(11,12,12,.35)), url(${imageUrl})`,
              backgroundRepeat: "no-repeat",
              aspectRatio: imageRatio ? `${imageRatio}` : undefined,
            }
          : undefined
      }
    >
      <Box
        component="div"
        className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
      />
      <Box
        component="div"
        className="mx-auto grid min-w-0 max-w-[1440px] grid-cols-1 items-center gap-8 px-5 py-16 sm:px-6 sm:py-20 md:grid-cols-[1.05fr_.95fr] md:gap-10 md:px-12 md:py-28"
      >
        <MotionBox
          initial={{ opacity: 0, x: dir === "rtl" ? 30 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className={`relative z-10 max-w-2xl ${slide ? "hero-slide-content" : ""}`}
        >
          {!slide ? (
            <Box
              component="div"
              className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-white"
            >
              <Cloud className="h-4 w-4" /> {t("PUFF JO / VAPE SHOP IN JORDAN")}
            </Box>
          ) : null}
          {title ? (
            <Box
              component="h1"
              className="max-w-full text-4xl font-black leading-[0.96] tracking-[-0.05em] sm:text-5xl md:max-w-xl md:text-6xl lg:text-8xl md:tracking-[-0.06em]"
            >
              {title}
            </Box>
          ) : null}
          {description ? (
            <Box
              component="p"
              className="mt-6 max-w-lg text-base leading-7 text-[#b7c0b9] md:text-lg"
            >
              {description}
            </Box>
          ) : null}
          {!slide ? (
            <Box component="div" className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="!text-black inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.12em] transition hover:bg-neutral-200"
              >
                {t("SHOP VAPE GEAR")}
                {dir === "rtl" ? (
                  <ArrowLeft className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Link>
              <Box
                component="span"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-[#b7c0b9]"
              >
                <Zap className="h-4 w-4 text-white" /> {t("18+ ONLY")}
              </Box>
            </Box>
          ) : null}
        </MotionBox>
        {!slide ? (
          <Box
            component="div"
            className="relative flex min-h-[310px] items-center justify-center md:min-h-[430px]"
          >
            <Box
              component="div"
              className="absolute h-64 w-64 rounded-full border border-white/25 md:h-96 md:w-96"
            />
            <Box
              component="div"
              className="absolute h-48 w-48 rounded-full border border-white/10 md:h-72 md:w-72"
            />
            <Box
              component="div"
              className="relative flex h-64 w-44 -rotate-6 flex-col justify-between rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-[#27352d] via-[#101513] to-[#070908] p-5 shadow-[0_35px_90px_rgba(0,0,0,.5)] md:h-80 md:w-56"
            >
              <Box
                component="div"
                className="flex items-center justify-between text-[10px] font-bold tracking-[0.18em] text-white"
              >
                <Box component="span">PUFF/JOR</Box>
                <Box component="span">01</Box>
              </Box>
              <Box component="div">
                <Box
                  component="div"
                  className="text-7xl font-black tracking-[-.12em] text-[#f4f1e8]"
                >
                  V
                </Box>
                <Box
                  component="div"
                  className="mt-2 text-[9px] uppercase tracking-[.3em] text-[#b7c0b9]"
                >
                  {t("Vape essentials")}
                </Box>
              </Box>
              <Box
                component="div"
                className="h-1.5 w-full rounded-full bg-white"
              />
            </Box>
            <Box
              component="div"
              className="absolute bottom-4 right-2 rotate-12 rounded-2xl border border-white/15 bg-[#171b1a] px-4 py-3 text-xs font-bold uppercase tracking-[.15em] text-[#b7c0b9] shadow-xl md:right-10"
            >
              <Box component="span" className="text-white">
                {t("Ready for pickup")}
              </Box>
              <Box component="br" />
              {t("in Jordan")}
            </Box>
          </Box>
        ) : null}
      </Box>

      {/* SCROLL INDICATOR */}
      <Box
        component="div"
        className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 md:block"
      >
        <Box
          component="div"
          className="flex h-10 w-6 justify-center rounded-full border border-white/40 pt-2"
        >
          <MotionBox
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
        </Box>
      </Box>
    </Box>
  );
}

function PopularCategories({ categories }: { categories: StoreCategory[] }) {
  const { t, localize, dir } = useLocale();
  const isRtl = dir === "rtl";

  return (
    <Container className="py-12 md:py-16">
      <Box component="section">
        <Box
          component="div"
          className="mb-7 flex items-end justify-between gap-4"
        >
          <Box component="div">
            <Box
              component="div"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]"
            >
              {t("SHOP BY CATEGORY")}
            </Box>
            <Box
              component="h2"
              className="mt-2 max-w-full text-3xl font-bold leading-tight text-[var(--text)] md:text-5xl"
            >
              {t("Find what fits your setup")}
            </Box>
          </Box>
          <Link
            href="/shop"
            className="hidden text-sm font-semibold text-[var(--accent)] md:block"
          >
            {t("VIEW SHOP")}
          </Link>
        </Box>
        <Box
          component="div"
          className="grid auto-rows-[150px] grid-cols-2 gap-2.5 sm:auto-rows-[180px] lg:auto-rows-[190px] lg:grid-cols-4 lg:gap-3"
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className={`group relative min-w-0 overflow-hidden rounded-[4px] border border-white/10 bg-[var(--card)] transition duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:border-white/25 ${categories.indexOf(category) === 0 ? "col-span-2 row-span-2" : categories.indexOf(category) === 1 ? "row-span-1" : categories.indexOf(category) === 2 ? "row-span-1" : "col-span-2 md:col-span-2"}`}
            >
              <Box component="div" className="absolute inset-0 bg-[#171717]">
                <Image
                  src={
                    category.image?.trim() ||
                    "/products/puff-jo-product-default.png"
                  }
                  alt={localize(category.name, category.nameAr)}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      "/products/puff-jo-product-default.png";
                  }}
                  className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
                />
              </Box>
              <Box
                component="div"
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-colors duration-300 group-hover:from-black/80"
              />
              <Box
                component="div"
                className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 pb-4 pt-16 md:px-6 md:pb-6"
              >
                <Box component="div">
                  <Box
                    component="div"
                    className="text-lg font-bold leading-5 text-white transition-transform duration-300 group-hover:translate-x-[2px] md:text-2xl"
                  >
                    {localize(category.name, category.nameAr)}
                  </Box>
                  <Box
                    component="p"
                    className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/65 md:max-w-[300px] md:text-sm"
                  >
                    {localize(category.description, category.descriptionAr)}
                  </Box>
                </Box>
                {isRtl ? (
                  <ArrowLeft className="h-5 w-5 shrink-0 text-white transition-transform duration-300 group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="h-5 w-5 shrink-0 text-white transition-transform duration-300 group-hover:translate-x-1" />
                )}
              </Box>
            </Link>
          ))}
        </Box>
      </Box>
    </Container>
  );
}

function FlavorRail({ products }: { products: StoreProduct[] }) {
  const { t, localize } = useLocale();
  const [filter, setFilter] = useState("ALL");

  const filters = ["ALL", "FRUITY", "ICE", "DESSERT", "TOBACCO", "BEVERAGE"];

  const visible =
    filter === "ALL"
      ? products
      : products.filter((product) => {
          const haystack =
            `${product.name} ${product.nameAr || ""} ${product.shortDescription} ${product.tags.join(" ")}`.toLowerCase();

          return haystack.includes(filter.toLowerCase());
        });

  return (
    <Box>
      {/* Filters */}
      <Box
        component="div"
        className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
      >
        {filters.map((item) => {
          const active = filter === item;

          return (
            <Box
              component="button"
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`h-8 shrink-0 rounded-md border px-3 text-[11px] font-semibold transition ${
                active
                  ? "border-[var(--text)] bg-[var(--text)] text-[var(--background)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text)]"
              }`}
            >
              {t(item)}
            </Box>
          );
        })}
      </Box>

      {/* Products */}
      {visible.length ? (
        <Box
          component="div"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {visible.map((product) => {
            const productName = localize(product.name, product.nameAr);
            const brandName = localize(product.brand, product.brandAr);

            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] transition hover:border-[var(--text-secondary)]"
              >
                {/* Image */}
                <Box
                  component="div"
                  className="relative flex aspect-square items-center justify-center bg-[var(--background-secondary)]"
                >
                  <Image
                    src={
                      product.images[0]?.url?.trim() ||
                      "/products/puff-jo-product-default.png"
                    }
                    alt={productName}
                    className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
                  />
                </Box>

                {/* Details */}
                <Box component="div" className="p-3">
                  {brandName ? (
                    <Box
                      component="div"
                      className="mb-1 truncate text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]"
                    >
                      {brandName}
                    </Box>
                  ) : null}

                  <Box
                    component="div"
                    className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 text-[var(--text)]"
                  >
                    {productName}
                  </Box>

                  <Box
                    component="div"
                    className="mt-2 text-sm font-bold text-[var(--text)]"
                  >
                    {formatCurrency(getPrimaryPrice(product))}
                  </Box>
                </Box>
              </Link>
            );
          })}
        </Box>
      ) : (
        <Paper withBorder radius="md" p="xl" className="text-center">
          <Text fw={600} size="sm">
            {t("No products found")}
          </Text>

          <Text mt={4} size="xs" c="dimmed">
            {t("Try another flavor filter.")}
          </Text>

          <Button
            mt="md"
            size="xs"
            variant="default"
            onClick={() => setFilter("ALL")}
          >
            {t("Show all")}
          </Button>
        </Paper>
      )}
    </Box>
  );
}

function RankingRail({ products }: { products: StoreProduct[] }) {
  const { t, localize, dir } = useLocale();
  return (
    <Box
      component="div"
      className="grid min-w-0 gap-0 border-t border-[var(--border)] lg:grid-cols-3"
    >
      {products.slice(0, 3).map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.slug}`}
          className="group relative flex min-w-0 min-h-[220px] items-center gap-2 overflow-hidden border-b border-[var(--border)] py-4 lg:min-h-[350px] lg:gap-3 lg:border-b-0 lg:border-r lg:px-5 lg:first:pl-0 lg:last:border-r-0"
        >
          <Box
            component="div"
            className="relative h-32 w-28 shrink-0 sm:h-36 sm:w-32 lg:h-56 lg:w-48"
          >
            <Image
              src={
                product.images[0]?.url?.trim() ||
                "/products/puff-jo-product-default.png"
              }
              alt={localize(product.name, product.nameAr)}
              className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.045]"
            />
          </Box>
          <Box component="div" className="relative min-w-0">
            <Box
              component="div"
              className="text-[9px] font-bold uppercase tracking-[.22em] text-[var(--accent)]"
            >
              {t("POPULAR")}
            </Box>
            <Box
              component="h3"
              className="mt-3 text-xl font-bold leading-tight"
            >
              {localize(product.name, product.nameAr)}
            </Box>
            <Box
              component="p"
              className="mt-2 line-clamp-2 text-sm text-[var(--text-secondary)]"
            >
              {localize(product.shortDescription, product.shortDescriptionAr)}
            </Box>
            <Box component="div" className="mt-5 text-sm font-bold">
              {formatCurrency(getPrimaryPrice(product))}{" "}
              <Box
                component="span"
                className="ml-1 inline-block transition-transform group-hover:translate-x-1"
              >
                {dir === "rtl" ? "←" : "→"}
              </Box>
            </Box>
          </Box>
        </Link>
      ))}
    </Box>
  );
}

function WhyVapor() {
  const { t } = useLocale();
  const reasons = [
    {
      title: "Reliable devices",
      body: "Dependable vape devices and accessories for your daily setup, whether you are starting fresh or upgrading.",
    },
    {
      title: "Flavors for every mood",
      body: "Choose from fruit, mint, dessert, tobacco, and icy blends stocked for different tastes.",
    },
    {
      title: "Delivery across Jordan",
      body: "Order online, confirm your address, and get your everyday vape essentials delivered to your door.",
    },
  ];

  return (
    <Container className="py-20 md:py-32">
      <Box
        component="section"
        className="border-y border-[var(--border)] py-10 md:py-14"
      >
        <Box
          component="div"
          className="mb-10 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]"
        >
          {t("WHY PUFF JO")}
        </Box>
        <Box component="div" className="grid gap-8 md:grid-cols-3 md:gap-10">
          {reasons.map((reason) => (
            <Box
              component="div"
              key={reason.title}
              className="relative border-l border-[var(--border)] pl-5 first:border-l-0 first:pl-0 md:pl-7"
            >
              <Box
                component="h3"
                className="text-2xl font-bold text-[var(--text)]"
              >
                {t(reason.title)}
              </Box>
              <Box
                component="p"
                className="mt-3 text-sm leading-7 text-[var(--text-secondary)]"
              >
                {t(reason.body)}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
}

function PromoRibbon({ flashSale }: { flashSale: FlashSale }) {
  const { t, dir } = useLocale();

  return (
    <Box component="section" className="bg-white px-4 py-5 text-black md:px-8">
      <Box
        component="div"
        className="mx-auto flex max-w-[1440px] flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <Box component="div">
          <Box
            component="div"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60"
          >
            {t(flashSale.title)}
          </Box>
          <Box component="div" className="mt-1 text-3xl font-bold">
            {t(flashSale.discountLabel)}
          </Box>
        </Box>
        <Link
          href={flashSale.ctaUrl || "/shop?sale=true"}
          className="!text-white inline-flex w-fit items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em]"
        >
          {flashSale.ctaText ? t(flashSale.ctaText) : t("ORDER THE DEAL")}
          {dir === "rtl" ? (
            <ArrowLeft className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </Link>
      </Box>
    </Box>
  );
}

function HomeEmptyState() {
  const { t, dir } = useLocale();

  return (
    <Container className="py-16 md:py-28">
      <Box
        component="div"
        className="relative isolate min-h-[430px] overflow-hidden rounded-[4px] border border-[var(--border)] bg-[var(--background-secondary)] px-6 py-14 md:px-16 md:py-20"
      >
        <Box
          component="div"
          className="absolute -right-20 -top-24 -z-10 text-[19rem] font-black leading-none tracking-[-.16em] text-[var(--text)]/[.035]"
        >
          00
        </Box>
        <Box
          component="div"
          className="absolute bottom-0 left-0 -z-10 h-px w-2/3 bg-[var(--border)]"
        />
        <Box component="div" className="max-w-2xl">
          <Box
            component="div"
            className="mb-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent)]"
          >
            <Box component="span" className="h-px w-10 bg-[var(--accent)]" />
            {t("PUFF JO / THE COLLECTION")}
          </Box>
          <Box
            component="h2"
            className="max-w-xl text-4xl font-black uppercase leading-[.95] tracking-[-.05em] md:text-7xl"
          >
            {t("NO LIVE PRODUCTS YET.")}
          </Box>
          <Box
            component="p"
            className="mt-6 max-w-lg text-sm leading-7 text-[var(--text-secondary)] md:text-base"
          >
            {t(
              "We are updating the shelves. Check back soon for devices, flavors, pods, coils, and accessories.",
            )}
          </Box>
          <Link
            href="/shop"
            className="mt-8 inline-flex min-h-11 items-center gap-3 rounded-full bg-[var(--text)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--background)] transition hover:gap-4"
          >
            {t("BROWSE THE SHOP")}
            {dir === "rtl" ? (
              <ArrowLeft className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
