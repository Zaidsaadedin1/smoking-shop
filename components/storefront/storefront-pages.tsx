"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Minus,
  Plus,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocale } from "@/components/storefront/locale-provider";
import {
  Container,
  NewsletterSection,
  ProductGrid,
  Rating,
  SectionHeading,
} from "@/components/storefront/storefront-sections";
import {
  DeliveryZone,
  FlashSale,
  StoreCategory,
  StoreProduct,
} from "@/lib/commerce-types";
import {
  calculateDiscount,
  calculateDiscountAmount,
  filterProducts,
  formatCurrency,
  getProductSizes,
} from "@/lib/commerce-utils";
import { calculateCouponDiscount } from "@/lib/coupon-utils";
import { resolveDeliveryFee } from "@/lib/delivery-zones";
import {
  CartLineSelection,
  getCartProducts,
  useCartStore,
} from "@/stores/use-cart-store";
import { useUiStore } from "@/stores/use-ui-store";

export function ShopPageView({
  products,
  categories,
  title = "MENU",
  description = "Fresh shawerma, saj rolls, complete meals, sides, and dips.",
  initialCategory,
  initialSort,
  initialSale = false,
  flashSale,
}: {
  products: StoreProduct[];
  categories: StoreCategory[];
  title?: string;
  description?: string;
  initialCategory?: string;
  initialSort?: "newest" | "price-asc" | "price-desc" | "featured";
  initialSale?: boolean;
  flashSale?: FlashSale | null;
}) {
  const { t, localize, dir } = useLocale();
  const [category, setCategory] = useState(initialCategory ?? "all");
  const [sort, setSort] = useState<
    "newest" | "price-asc" | "price-desc" | "featured"
  >(initialSort ?? "newest");

  const filtered = useMemo(
    () =>
      filterProducts(products, {
        category: category !== "all" ? category : undefined,
        sort,
        sale: initialSale || undefined,
      }),
    [category, initialSale, products, sort],
  );

  return (
    <div className="space-y-10 pb-16 md:space-y-16 md:pb-24">
      {flashSale ? <CatalogFlashSaleBanner flashSale={flashSale} /> : null}
      <CatalogHero title={title} description={description} />
      <div className="border-y border-[var(--border)] bg-[var(--card)]">
        <Container className="py-3">
          <div className="grid gap-2 md:grid-cols-6 xl:grid-cols-7">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`flex items-center justify-between border px-3 py-3 text-left text-[10px] uppercase tracking-[0.18em] ${
                category === "all"
                  ? "border-[var(--text)] bg-[var(--background)]"
                  : "border-[var(--border)]"
              }`}
            >
              <span>{t("ALL")}</span>
              <span className="text-[var(--muted)]">+</span>
            </button>
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.slug)}
                className={`flex items-center justify-between border px-3 py-3 text-left text-[10px] uppercase tracking-[0.18em] ${
                  category === item.slug
                    ? "border-[var(--text)] bg-[var(--background)]"
                    : "border-[var(--border)]"
                }`}
              >
                <span>{localize(item.name, item.nameAr)}</span>
                <span className="text-[var(--muted)]">+</span>
              </button>
            ))}
          </div>
        </Container>
      </div>
      <Container>
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] py-3 text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
          <div>
            {filtered.length} {t("ITEMS")}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="inline-flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t("FILTERS")}
            </button>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
              className="border-l border-[var(--border)] bg-transparent pl-3 text-[10px] uppercase tracking-[0.22em] outline-none"
            >
              <option value="newest">{t("Newest")}</option>
              <option value="price-asc">{t("Price Low to High")}</option>
              <option value="price-desc">{t("Price High to Low")}</option>
              <option value="featured">{t("Featured")}</option>
            </select>
          </div>
        </div>
        <ProductGrid products={filtered} />
      </Container>
      <Container>
        <NewsletterSection />
      </Container>
    </div>
  );
}

function CatalogFlashSaleBanner({ flashSale }: { flashSale: FlashSale }) {
  const { dir, t } = useLocale();

  return (
    <section className="border-y border-[var(--border)] bg-[linear-gradient(135deg,rgba(103,24,48,0.9),rgba(18,10,13,0.98))] px-4 py-5 md:px-8">
      <Container className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/62">
            {flashSale.title}
          </div>
          <div className="mt-2 font-display text-4xl uppercase leading-none text-[#e4c2c2] md:text-5xl">
            {flashSale.discountLabel}
          </div>
          {flashSale.description ? (
            <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-white/74">
              {flashSale.description}
            </div>
          ) : null}
        </div>

        <Link
          href={flashSale.ctaUrl || "/shop?sale=true"}
          className="inline-flex items-center gap-2 self-start border border-white/15 bg-black/20 px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-[#f3e7e7] md:self-center"
        >
          <span className="text-[#f0a6b6]">
            {flashSale.ctaText || t("Shop sale")}
          </span>
          {dir === "rtl" ? (
            <ArrowLeft className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </Link>
      </Container>
    </section>
  );
}

export function ProductPageView({
  product,
  relatedProducts,
  customer,
  initialIsFavorite,
  initialReviews,
}: {
  product: StoreProduct;
  relatedProducts: StoreProduct[];
  customer: { id: string; fullName: string } | null;
  initialIsFavorite: boolean;
  initialReviews: Array<{
    id: string;
    rating: number;
    title: string;
    comment: string;
    createdAt: string;
    authorName: string;
  }>;
}) {
  const { t, localize, dir } = useLocale();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useCartStore((state) => state.toggleFavorite);
  const openCart = useUiStore((state) => state.openCart);
  const pushToast = useUiStore((state) => state.pushToast);
  const sizes = getProductSizes(product);
  const optionGroups = product.optionGroups ?? [];
  const galleryImages = product.images.length
    ? product.images
    : [
        {
          id: "fallback-image",
          url: "/products/product-placeholder.svg",
          alt: product.name,
        },
      ];
  const [selectedSize, setSelectedSize] = useState(sizes[0]?.name ?? "");
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >(() =>
    Object.fromEntries(
      optionGroups.map((group) => [
        group.id,
        group.selectionType === "radio"
          ? [
              group.items.find(
                (item) =>
                  item.isDefault &&
                  (!item.trackInventory ||
                    item.stockQuantity > 0 ||
                    item.allowBackorder),
              )?.id ??
                group.items.find(
                  (item) =>
                    !item.trackInventory ||
                    item.stockQuantity > 0 ||
                    item.allowBackorder,
                )?.id ??
                "",
            ].filter(Boolean)
          : group.items
              .filter(
                (item) =>
                  item.isDefault &&
                  (!item.trackInventory ||
                    item.stockQuantity > 0 ||
                    item.allowBackorder),
              )
              .map((item) => item.id),
      ]),
    ),
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const selectedVariant =
    product.variants.find((variant) => variant.size === selectedSize) ??
    product.variants[0];

  const selectedOptionItems = optionGroups.flatMap((group) => {
    const ids = selectedOptions[group.id] ?? [];
    return group.items.filter((item) => ids.includes(item.id));
  });
  const cartSelections: CartLineSelection[] = optionGroups
    .map((group) => {
      const ids = selectedOptions[group.id] ?? [];
      const items = group.items
        .filter((item) => ids.includes(item.id))
        .map((item) => ({
          id: item.id,
          name: item.name,
          nameAr: item.nameAr,
          priceDelta: item.priceDelta,
        }));

      return {
        groupId: group.id,
        groupName: group.name,
        groupNameAr: group.nameAr,
        selectionType: group.selectionType,
        items,
      };
    })
    .filter((group) => group.items.length > 0);
  const optionsTotal = selectedOptionItems.reduce(
    (sum, item) => sum + item.priceDelta,
    0,
  );
  const displayPrice = selectedVariant.price + optionsTotal;
  const discount = calculateDiscount(
    selectedVariant.price,
    selectedVariant.compareAtPrice,
  );
  const maxQuantity = selectedVariant.allowBackorder
    ? 99
    : Math.max(1, selectedVariant.stockQuantity);
  const selectedOptionKey = optionGroups
    .map(
      (group) =>
        `${group.id}:${[...(selectedOptions[group.id] ?? [])].sort().join(",")}`,
    )
    .sort()
    .join("|");
  const cartLineId = [
    product.id,
    selectedVariant.id,
    selectedSize,
    selectedOptionKey,
  ]
    .filter(Boolean)
    .join("::");

  function handleBuyNow() {
    addItem(
      buildConfiguredProduct(),
      selectedVariant.id,
      Math.min(quantity, maxQuantity),
      cartLineId,
      cartSelections,
    );

    if (!customer) {
      router.push("/login?next=%2Fcheckout");
      return;
    }

    router.push("/checkout");
  }

  function buildConfiguredProduct() {
    if (optionsTotal <= 0) {
      return product;
    }

    return {
      ...product,
      variants: product.variants.map((variant) =>
        variant.id === selectedVariant.id
          ? { ...variant, price: displayPrice }
          : variant,
      ),
    };
  }

  function handleOptionChange(
    groupId: string,
    itemId: string,
    selectionType: "radio" | "checkbox",
  ) {
    const group = optionGroups.find((entry) => entry.id === groupId);
    const item = group?.items.find((entry) => entry.id === itemId);
    const itemAvailable = item
      ? !item.trackInventory || item.stockQuantity > 0 || item.allowBackorder
      : false;

    if (!itemAvailable) {
      return;
    }

    setSelectedOptions((current) => {
      if (selectionType === "radio") {
        return { ...current, [groupId]: [itemId] };
      }

      const currentIds = current[groupId] ?? [];
      const nextIds = currentIds.includes(itemId)
        ? currentIds.filter((id) => id !== itemId)
        : [...currentIds, itemId];

      return { ...current, [groupId]: nextIds };
    });
  }

  async function handleFavoriteToggle() {
    if (!customer) {
      pushToast({
        title: t("Sign in required"),
        description: t("Sign in to save menu items to your favorites."),
      });
      router.push("/login");
      return;
    }

    const nextFavorite = !isFavorite;
    const response = await fetch(
      nextFavorite
        ? "/api/favorites"
        : `/api/favorites?productId=${encodeURIComponent(product.id)}`,
      nextFavorite
        ? {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId: product.id }),
          }
        : { method: "DELETE" },
    );

    if (!response.ok) {
      pushToast({
        title: t("Something went wrong"),
        description: t("Try again in a moment."),
      });
      return;
    }

    setIsFavorite(nextFavorite);
    toggleFavorite(product.id);
    pushToast({
      title: nextFavorite
        ? t("SAVED TO FAVORITES")
        : t("REMOVED FROM FAVORITES"),
      description: localize(product.name, product.nameAr),
    });
  }

  async function handleReviewSubmit() {
    if (!customer) {
      pushToast({
        title: t("Sign in required"),
        description: t("Sign in to review products."),
      });
      router.push("/login");
      return;
    }

    if (!reviewComment.trim()) {
      pushToast({
        title: t("Review comment is required"),
        description: t("Write a short review before submitting."),
      });
      return;
    }

    setIsSubmittingReview(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to submit review");
      }

      setReviews((current) => [
        {
          id: crypto.randomUUID(),
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          createdAt: new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date()),
          authorName: customer.fullName,
        },
        ...current,
      ]);
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      pushToast({
        title: t("Review submitted"),
        description: t("Your review was submitted successfully."),
      });
    } catch (error) {
      pushToast({
        title: t("Something went wrong"),
        description:
          error instanceof Error
            ? t(error.message)
            : t("Try again in a moment."),
      });
    } finally {
      setIsSubmittingReview(false);
    }
  }

  return (
    <div className="bg-[var(--background)] pb-20 pt-8 text-[var(--text)] md:pb-24 md:pt-12">
      <Container>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 transition hover:text-[var(--accent)]"
          >
            {dir === "rtl" ? (
              <ArrowRight className="h-4 w-4" />
            ) : (
              <ArrowLeft className="h-4 w-4" />
            )}
            {t("BACK TO MENU")}
          </Link>
          <span>{localize(product.categorySlug, product.categorySlug)}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-start">
          <div className="grid gap-4 lg:grid-cols-[96px_minmax(0,1fr)] lg:items-start">
            <div className="order-2 flex gap-3 overflow-x-auto pb-2 lg:order-1 lg:grid lg:max-h-[720px] lg:auto-rows-max lg:overflow-visible lg:pb-0">
              {galleryImages.map((image, index) => {
                const isActive = index === selectedImageIndex;
                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`group relative shrink-0 overflow-hidden rounded-lg border bg-[var(--card)] p-1 transition ${
                      isActive
                        ? "border-[var(--accent)] shadow-[0_0_0_1px_var(--accent)]"
                        : "border-[var(--border)] hover:border-[var(--accent)]/40"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="h-24 w-24 rounded-md bg-[var(--background)] object-contain transition duration-500 group-hover:scale-[1.03] lg:h-24 lg:w-full lg:min-w-[96px]"
                    />
                  </button>
                );
              })}
            </div>

            <div className="order-1 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[0_24px_70px_rgba(24,18,17,0.12)] lg:order-2">
              <div className="relative bg-[var(--card)]">
                <img
                  src={
                    galleryImages[selectedImageIndex]?.url ??
                    galleryImages[0].url
                  }
                  alt={
                    galleryImages[selectedImageIndex]?.alt ??
                    galleryImages[0].alt
                  }
                  className="block h-auto w-full object-contain"
                />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_20px_60px_rgba(24,18,17,0.08)] md:p-7 lg:sticky lg:top-28 lg:h-fit">
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-full bg-[color:color-mix(in_srgb,var(--accent)_12%,transparent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                {localize(product.brand, product.brandAr)}
              </div>
              <button
                type="button"
                onClick={handleFavoriteToggle}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
                  isFavorite
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                />
              </button>
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-[var(--text)] md:text-6xl">
              {localize(product.name, product.nameAr)}
            </h1>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
              {localize(product.shortDescription, product.shortDescriptionAr)}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="text-4xl font-bold text-[var(--accent)]">
                {formatCurrency(displayPrice)}
              </div>
              {selectedVariant.compareAtPrice ? (
                <div className="text-lg text-[var(--muted)] line-through">
                  {formatCurrency(selectedVariant.compareAtPrice)}
                </div>
              ) : null}
              {discount > 0 ? (
                <div className="rounded-full bg-[var(--text)] px-3 py-1 text-xs font-semibold tracking-[0.14em] text-[var(--background)]">
                  {discount}% OFF
                </div>
              ) : null}
            </div>
            <div className="mt-4 flex items-center gap-4">
              <Rating
                rating={product.rating}
                reviewCount={product.reviewCount}
              />
              <div className="text-sm text-[var(--muted)]">
                {selectedVariant.stockQuantity > 0
                  ? selectedVariant.stockQuantity <= 2
                    ? `${t("ONLY")} ${selectedVariant.stockQuantity} ${t("LEFT")}`
                    : t("HOT NOW")
                  : t("SOLD OUT")}
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {t("SIZE")}
              </div>
              <div className="flex flex-wrap gap-3">
                {sizes.map((sizeOption) => {
                  const available = product.variants.some(
                    (variant) =>
                      variant.size === sizeOption.name &&
                      (variant.stockQuantity > 0 || variant.allowBackorder),
                  );

                  return (
                    <button
                      key={sizeOption.name}
                      type="button"
                      onClick={() => setSelectedSize(sizeOption.name)}
                      disabled={!available}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        selectedSize === sizeOption.name
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      {localize(sizeOption.name, sizeOption.nameAr)}
                    </button>
                  );
                })}
              </div>
            </div>

            {optionGroups.length ? (
              <div className="mt-7 space-y-5">
                {optionGroups.map((group) => (
                  <div key={group.id}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                          {localize(group.name, group.nameAr)}
                        </div>
                        {group.description || group.descriptionAr ? (
                          <div className="mt-1 text-xs text-[var(--text-secondary)]">
                            {localize(
                              group.description ?? "",
                              group.descriptionAr,
                            )}
                          </div>
                        ) : null}
                      </div>
                      <span className="rounded-full bg-[color:color-mix(in_srgb,var(--accent)_12%,transparent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                        {group.selectionType === "radio"
                          ? t("Choose one")
                          : t("Add-ons")}
                      </span>
                    </div>
                    <div className="grid gap-2">
                      {group.items.map((item) => {
                        const selected = (
                          selectedOptions[group.id] ?? []
                        ).includes(item.id);
                        const inputType =
                          group.selectionType === "radio"
                            ? "radio"
                            : "checkbox";
                        const available =
                          !item.trackInventory ||
                          item.stockQuantity > 0 ||
                          item.allowBackorder;

                        return (
                          <label
                            key={item.id}
                            className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                              selected
                                ? "border-[var(--accent)] bg-[color:color-mix(in_srgb,var(--accent)_10%,var(--background))] text-[var(--text)]"
                                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                            } ${available ? "cursor-pointer" : "cursor-not-allowed opacity-45"}`}
                          >
                            <span className="flex items-center gap-3">
                              <input
                                type={inputType}
                                name={`option-${group.id}`}
                                checked={selected}
                                disabled={!available}
                                onChange={() =>
                                  handleOptionChange(
                                    group.id,
                                    item.id,
                                    group.selectionType,
                                  )
                                }
                                className="h-4 w-4 accent-[#c7202f]"
                              />
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={localize(item.name, item.nameAr)}
                                  className="h-11 w-11 rounded-md bg-[#fff8f2] object-contain p-1"
                                />
                              ) : null}
                              <span>
                                <span className="block">
                                  {localize(item.name, item.nameAr)}
                                </span>
                                {item.trackInventory ? (
                                  <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                                    {available
                                      ? `${t("Stock")}: ${item.stockQuantity}`
                                      : t("SOLD OUT")}
                                  </span>
                                ) : null}
                              </span>
                            </span>
                            {item.priceDelta > 0 ? (
                              <span className="text-xs text-[var(--accent)]">
                                +{formatCurrency(item.priceDelta)}
                              </span>
                            ) : null}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-4 rounded-full border border-[var(--border)] bg-[var(--background-secondary)] px-4 py-3">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--card)] text-[var(--text)]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-6 text-center text-lg font-bold">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= maxQuantity}
                  onClick={() =>
                    setQuantity((value) => Math.min(maxQuantity, value + 1))
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--card)] text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm font-semibold text-[var(--text-secondary)]">
                {t("Choose quantity")}
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={
                  selectedVariant.stockQuantity <= 0 &&
                  !selectedVariant.allowBackorder
                }
                onClick={() => {
                  addItem(
                    buildConfiguredProduct(),
                    selectedVariant.id,
                    Math.min(quantity, maxQuantity),
                    cartLineId,
                    cartSelections,
                  );
                  openCart();
                  pushToast({
                    title: t("Added to your cart"),
                    description: `${localize(product.name, product.nameAr)} • ${localize(selectedVariant.size, selectedVariant.sizeAr)}`,
                  });
                }}
                className="rounded-full bg-[#c7202f] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_34px_rgba(199,32,47,0.22)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("AddToCartButton")}
              </button>
              <Link
                href="/checkout"
                onClick={(event) => {
                  event.preventDefault();
                  handleBuyNow();
                }}
                className="rounded-full border border-[var(--border)] px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {t("ORDER NOW")}
              </Link>
            </div>

            <div className="mt-8 space-y-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-5">
              <Accordion title="ITEM DETAILS" defaultOpen>
                {localize(product.description, product.descriptionAr)}
              </Accordion>
              <Accordion title="DELIVERY">
                {t(
                  "Delivery and pickup are available from Jordan branches. Hot-food timing depends on branch coverage and order volume.",
                )}
              </Accordion>
              <Accordion title="ORDER NOTES">
                {t(
                  "Please add allergy notes, sauce preferences, and pickup instructions before checkout.",
                )}
              </Accordion>
            </div>

            <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--background)] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {t("ITEM REVIEWS")}
              </div>
              {customer ? (
                <div className="mt-4 space-y-4 border-b border-[var(--border)] pb-5">
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setReviewRating(value)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
                          reviewRating === value
                            ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                            : "border-[var(--border)] text-[var(--text-secondary)]"
                        }`}
                      >
                        <Star
                          className={`h-4 w-4 ${reviewRating >= value ? "fill-current" : ""}`}
                        />
                        {value}
                      </button>
                    ))}
                  </div>
                  <input
                    value={reviewTitle}
                    onChange={(event) => setReviewTitle(event.target.value)}
                    placeholder={t("Review title")}
                    className="h-12 w-full rounded-full border border-[var(--border)] bg-[var(--background-secondary)] px-5 text-sm text-[var(--text)] outline-none"
                  />
                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder={t("Write your review")}
                    rows={4}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] px-5 py-4 text-sm text-[var(--text)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleReviewSubmit}
                    disabled={isSubmittingReview}
                    className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-40"
                  >
                    {isSubmittingReview ? t("PLEASE WAIT") : t("SUBMIT REVIEW")}
                  </button>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] p-4 text-sm text-[var(--text-secondary)]">
                  <div>{t("Sign in to review products.")}</div>
                  <Link
                    href="/login"
                    className="mt-3 inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text)]"
                  >
                    {t("LOG IN")}
                  </Link>
                </div>
              )}

              <div className="mt-5 space-y-4">
                {reviews.length ? (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium">
                            {review.authorName}
                          </div>
                          <div className="mt-1 text-xs tracking-[0.16em] text-[var(--muted)]">
                            {review.createdAt}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          {Array.from({ length: review.rating }).map(
                            (_, index) => (
                              <Star
                                key={`${review.id}-${index}`}
                                className="h-4 w-4 fill-current"
                              />
                            ),
                          )}
                        </div>
                      </div>
                      {review.title ? (
                        <div className="mt-3 text-sm uppercase tracking-[0.14em]">
                          {review.title}
                        </div>
                      ) : null}
                      <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                        {review.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-[var(--text-secondary)]">
                    {t("No reviews yet.")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Container className="mt-16">
        <SectionHeading title="You may also want" />
        <ProductGrid products={relatedProducts} />
      </Container>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border)] bg-[color:color-mix(in_srgb,var(--card)_90%,transparent)] p-4 text-[var(--text)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3">
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {t("PRICE")}
            </div>
            <div className="text-lg font-bold text-[var(--accent)]">
              {formatCurrency(selectedVariant.price)}
            </div>
          </div>
          <button
            type="button"
            disabled={
              selectedVariant.stockQuantity <= 0 &&
              !selectedVariant.allowBackorder
            }
            onClick={() => {
              addItem(
                buildConfiguredProduct(),
                selectedVariant.id,
                Math.min(quantity, maxQuantity),
                cartLineId,
                cartSelections,
              );
              openCart();
            }}
            className="rounded-full bg-[#c7202f] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white"
          >
            {t("AddToCartButton")}
          </button>
        </div>
      </div>
    </div>
  );
}

function CartSelectionList({
  selections,
  compact = false,
}: {
  selections: CartLineSelection[];
  compact?: boolean;
}) {
  const { localize } = useLocale();

  if (!selections.length) {
    return null;
  }

  return (
    <div className={compact ? "mt-2 space-y-1.5" : "mt-3 space-y-2"}>
      {selections.map((selection) => (
        <div
          key={selection.groupId}
          className={
            compact
              ? "rounded-[14px] border border-white/8 bg-white/4 px-3 py-2"
              : "rounded-[16px] border border-white/8 bg-black/10 px-4 py-3"
          }
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {localize(selection.groupName, selection.groupNameAr)}
          </div>
          <div className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
            {selection.items
              .map((item) => {
                const label = localize(item.name, item.nameAr);
                return item.priceDelta > 0
                  ? `${label} +${formatCurrency(item.priceDelta)}`
                  : label;
              })
              .join(", ")}
          </div>
        </div>
      ))}
    </div>
  );
}

function getCartSelectionSummary(
  selections: CartLineSelection[],
  localize: (english?: string | null, arabic?: string | null) => string,
) {
  return selections
    .map((selection) => {
      const items = selection.items
        .map((item) => {
          const label = localize(item.name, item.nameAr);
          return item.priceDelta > 0
            ? `${label} +${formatCurrency(item.priceDelta)}`
            : label;
        })
        .join(", ");

      return items
        ? `${localize(selection.groupName, selection.groupNameAr)}: ${items}`
        : null;
    })
    .filter(Boolean)
    .join(" | ");
}

export function CartPageView({ products }: { products: StoreProduct[] }) {
  const { t, localize } = useLocale();
  const items = useCartStore((state) => state.items);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const setAppliedCoupon = useCartStore((state) => state.setAppliedCoupon);
  const clearAppliedCoupon = useCartStore((state) => state.clearAppliedCoupon);
  const pushToast = useUiStore((state) => state.pushToast);
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code ?? "");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const lines = items
    .map((item) => {
      const product =
        item.product ?? products.find((entry) => entry.id === item.productId);
      const variant = product?.variants.find(
        (entry) => entry.id === item.variantId,
      );
      if (!product || !variant) {
        return null;
      }
      return {
        lineId: item.lineId ?? item.variantId,
        product,
        variant,
        quantity: item.quantity,
        selections: item.selections ?? [],
      };
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));
  const subtotal = lines.reduce(
    (sum, line) => sum + line.variant.price * line.quantity,
    0,
  );
  const couponDiscountAmount = useMemo(
    () =>
      appliedCoupon ? calculateCouponDiscount(subtotal, appliedCoupon) : 0,
    [appliedCoupon, subtotal],
  );
  const total = Math.max(0, subtotal - couponDiscountAmount);

  useEffect(() => {
    setCouponCode(appliedCoupon?.code ?? "");
  }, [appliedCoupon?.code]);

  useEffect(() => {
    let mounted = true;

    async function revalidateCoupon() {
      if (!appliedCoupon || !lines.length) {
        return;
      }

      try {
        const response = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: appliedCoupon.code,
            subtotal,
          }),
        });

        const result = (await response.json()) as {
          data?: typeof appliedCoupon;
          error?: string;
        };

        if (!mounted) {
          return;
        }

        if (!response.ok || result.error || !result.data) {
          clearAppliedCoupon();
          pushToast({
            title: t("Coupon removed"),
            description: result.error
              ? localizeCouponError(result.error, t)
              : t("This coupon no longer applies to your bag."),
          });
          return;
        }

        if (!appliedCoupon || !sameAppliedCoupon(appliedCoupon, result.data)) {
          setAppliedCoupon(result.data);
        }
      } catch {
        if (mounted) {
          clearAppliedCoupon();
        }
      }
    }

    void revalidateCoupon();

    return () => {
      mounted = false;
    };
  }, [
    appliedCoupon?.code,
    appliedCoupon?.description,
    appliedCoupon?.discountType,
    appliedCoupon?.discountValue,
    appliedCoupon?.minSubtotal,
    clearAppliedCoupon,
    lines.length,
    pushToast,
    setAppliedCoupon,
    subtotal,
    t,
  ]);

  async function applyCoupon() {
    if (!couponCode.trim() || isApplyingCoupon) {
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          subtotal,
        }),
      });
      const result = (await response.json()) as {
        data?: NonNullable<typeof appliedCoupon>;
        error?: string;
      };

      if (!response.ok || result.error || !result.data) {
        throw new Error(result.error ?? "Failed to apply coupon");
      }

      setAppliedCoupon(result.data);
      pushToast({
        title: t("Coupon applied"),
        description: `${result.data.code} ${t("is active on this order.")}`,
      });
    } catch (error) {
      pushToast({
        title: t("Coupon failed"),
        description:
          error instanceof Error
            ? localizeCouponError(error.message, t)
            : t("Unable to apply that coupon right now."),
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  return (
    <Container className="py-8 md:py-14">
      <div className="mb-8">
        <div className="text-xs tracking-[0.3em] text-[var(--muted)]">
          {t("CART")}
        </div>
        <h1 className="font-display text-4xl uppercase sm:text-5xl">
          {t("YOUR CART")}
        </h1>
      </div>
      {lines.length ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {lines.map((line) => (
              <div
                key={line.lineId}
                className="flex flex-col gap-4 rounded-[24px] border border-white/8 bg-white/3 p-3 sm:p-4 md:flex-row"
              >
                <img
                  src={line.product.images[0]?.url}
                  alt={localize(line.product.name, line.product.nameAr)}
                  className="h-32 w-full rounded-[20px] bg-[#fff8f2] object-contain p-2 sm:h-40 md:h-36 md:w-32 md:flex-none"
                />
                <div className="flex flex-1 flex-col">
                  <div className="text-base sm:text-lg">
                    {localize(line.product.name, line.product.nameAr)}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {localize(line.variant.size, line.variant.sizeAr)}
                  </div>
                  <CartSelectionList selections={line.selections} />
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm sm:text-base">
                      {formatCurrency(line.variant.price)}
                    </div>
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-3 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(line.lineId, line.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(line.lineId, line.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(line.lineId)}
                    className="mt-4 self-start text-xs tracking-[0.2em] text-[var(--muted)]"
                  >
                    {t("REMOVE")}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="h-fit rounded-[28px] border border-white/8 bg-white/3 p-5 lg:sticky lg:top-28">
            <div className="mb-5 text-xs tracking-[0.25em] text-[var(--muted)]">
              {t("ORDER SUMMARY")}
            </div>
            <SummaryRow
              label={t("Subtotal")}
              value={formatCurrency(subtotal)}
            />
            {couponDiscountAmount > 0 ? (
              <SummaryRow
                label={
                  appliedCoupon
                    ? `${t("Coupon")} (${appliedCoupon.code})`
                    : t("Coupon")
                }
                value={`-${formatCurrency(couponDiscountAmount)}`}
              />
            ) : null}
            <SummaryRow
              label={t("Delivery")}
              value={
                lines.length ? t("Calculated at checkout") : formatCurrency(0)
              }
            />
            <SummaryRow label={t("Tax")} value={formatCurrency(0)} />
            <div className="mt-4 border-t border-white/8 pt-4">
              <SummaryRow
                label={t("Total")}
                value={formatCurrency(total)}
                emphasis
              />
            </div>
            <div className="mt-5 grid gap-3">
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder={t("Enter promo code")}
                className="h-12 rounded-full border border-white/10 bg-black/20 px-5 text-sm outline-none"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={clearAppliedCoupon}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm tracking-[0.2em]"
                >
                  {t("REMOVE COUPON")}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!lines.length || isApplyingCoupon}
                  onClick={applyCoupon}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isApplyingCoupon ? t("APPLYING") : t("Apply")}
                </button>
              )}
              {appliedCoupon?.description ? (
                <div className="text-xs text-[var(--text-secondary)]">
                  {appliedCoupon.description}
                </div>
              ) : null}
              <Link
                href="/checkout"
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-center text-sm tracking-[0.2em]"
                style={{ color: "var(--background)" }}
              >
                {t("CHECKOUT")}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[32px] border border-white/8 bg-white/3 p-10 text-center">
          <div className="font-display text-4xl uppercase">
            {t("YOUR CART IS EMPTY.")}
          </div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            {t("Start with a saj sandwich or a full arabi meal.")}
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm tracking-[0.2em]"
            style={{ color: "var(--background)" }}
          >
            {t("VIEW MENU")}
          </Link>
        </div>
      )}
    </Container>
  );
}

export function FavoritesPageView({ products }: { products: StoreProduct[] }) {
  const favorites = useCartStore((state) => state.favorites);
  const favoriteProducts = products.filter((product) =>
    favorites.includes(product.id),
  );

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title="YOUR FAVORITES ARE EMPTY."
        description="Save the meals worth ordering again."
      />
      {favoriteProducts.length ? (
        <ProductGrid products={favoriteProducts} />
      ) : (
        <div className="rounded-[32px] border border-white/8 bg-white/3 p-10 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Nothing saved yet.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-[var(--text)] px-5 py-3 text-sm tracking-[0.2em] text-black"
          >
            VIEW MENU
          </Link>
        </div>
      )}
    </Container>
  );
}

export function SearchPageView({ products }: { products: StoreProduct[] }) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => filterProducts(products, { search: query || undefined }).slice(0, 8),
    [products, query],
  );

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title="SEARCH"
        description="Search by name, mood, or product detail."
      />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("Search the coven...")}
        className="h-14 w-full rounded-full border border-white/10 bg-white/3 px-6 text-sm outline-none"
      />
      <div className="mt-8">
        <ProductGrid
          products={results.length ? results : products.slice(0, 4)}
        />
      </div>
    </Container>
  );
}

export function AccountPageView() {
  const { t } = useLocale();
  const cards = [
    { title: "Profile", body: "Update your details and stay on the list." },
    { title: "My Orders", body: "Track deliveries and status changes." },
    { title: "Favorites", body: "Saved pieces you are not over yet." },
    { title: "Addresses", body: "Delivery details for checkout." },
    { title: "Settings", body: "Preferences, notifications, and sign out." },
  ];

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title="ACCOUNT"
        description="Everything you need, none of the clutter."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-[28px] border border-white/8 bg-white/3 p-6"
          >
            <div className="font-display text-3xl uppercase">
              {t(card.title)}
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              {t(card.body)}
            </p>
          </div>
        ))}
      </div>
    </Container>
  );
}

type CheckoutAddressView = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  area: string;
  street?: string;
  building?: string;
  isDefault: boolean;
};

type CheckoutSessionView = {
  fullName: string;
  email: string;
  phone: string;
};

type ActiveFlashSaleView = {
  id: string;
  title: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
};

type CheckoutFormState = {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  area: string;
  street: string;
  building: string;
  notes: string;
  paymentMethod: string;
};

export function CheckoutPageView({
  session,
  addresses,
  deliveryZones,
}: {
  session: CheckoutSessionView;
  addresses: CheckoutAddressView[];
  deliveryZones: DeliveryZone[];
}) {
  const { t, localize } = useLocale();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const setAppliedCoupon = useCartStore((state) => state.setAppliedCoupon);
  const clearAppliedCoupon = useCartStore((state) => state.clearAppliedCoupon);
  const pushToast = useUiStore((state) => state.pushToast);
  const lines = useMemo(() => getCartProducts(items), [items]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code ?? "");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [activeFlashSale, setActiveFlashSale] =
    useState<ActiveFlashSaleView | null>(null);
  const defaultAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddress?.id ?? "",
  );
  const [form, setForm] = useState<CheckoutFormState>({
    fullName: defaultAddress?.fullName ?? session.fullName,
    phone: defaultAddress?.phone ?? session.phone,
    country: defaultAddress?.country ?? "",
    city: defaultAddress?.city ?? "",
    area: defaultAddress?.area ?? "",
    street: defaultAddress?.street ?? "",
    building: defaultAddress?.building ?? "",
    notes: "",
    paymentMethod: "cash_on_delivery",
  });
  const countryOptions = useMemo(
    () =>
      deliveryZones.reduce<Array<{ value: string; label: string }>>(
        (acc, zone) => {
          if (acc.some((item) => item.value === zone.country)) {
            return acc;
          }

          acc.push({
            value: zone.country,
            label: localize(zone.country, zone.countryAr),
          });
          return acc;
        },
        [],
      ),
    [deliveryZones, localize],
  );
  const cityOptions = useMemo(
    () =>
      deliveryZones
        .filter((zone) => zone.country === form.country && zone.city)
        .reduce<Array<{ value: string; label: string }>>((acc, zone) => {
          if (!zone.city || acc.some((item) => item.value === zone.city)) {
            return acc;
          }

          acc.push({
            value: zone.city,
            label: localize(zone.city, zone.cityAr),
          });
          return acc;
        }, []),
    [deliveryZones, form.country, localize],
  );
  const subtotal = lines.reduce(
    (sum, line) => sum + line.variant.price * line.quantity,
    0,
  );
  const flashSaleDiscountAmount = useMemo(() => {
    if (!activeFlashSale) {
      return 0;
    }

    return calculateDiscountAmount(
      subtotal,
      activeFlashSale.discount_type,
      activeFlashSale.discount_value,
    );
  }, [activeFlashSale, subtotal]);
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) {
      return 0;
    }

    const remainingSubtotal = Math.max(0, subtotal - flashSaleDiscountAmount);
    return Math.min(
      remainingSubtotal,
      calculateCouponDiscount(subtotal, appliedCoupon),
    );
  }, [appliedCoupon, flashSaleDiscountAmount, subtotal]);
  const shippingAmount = lines.length
    ? (resolveDeliveryFee(deliveryZones, form.country, form.city) ?? 0)
    : 0;
  const hasConfiguredDelivery =
    !lines.length ||
    resolveDeliveryFee(deliveryZones, form.country, form.city) !== null;
  const discountAmount = flashSaleDiscountAmount + couponDiscountAmount;
  const total = Math.max(0, subtotal - discountAmount + shippingAmount);
  const checkoutFields: Array<{ label: string; key: keyof CheckoutFormState }> =
    [
      { label: "Full Name", key: "fullName" },
      { label: "Phone", key: "phone" },
      { label: "Area", key: "area" },
      { label: "Street", key: "street" },
      { label: "Building", key: "building" },
    ];

  useEffect(() => {
    setCouponCode(appliedCoupon?.code ?? "");
  }, [appliedCoupon?.code]);

  useEffect(() => {
    if (!selectedAddressId) {
      return;
    }

    const selectedAddress = addresses.find(
      (address) => address.id === selectedAddressId,
    );

    if (!selectedAddress) {
      return;
    }

    setForm((current) => ({
      ...current,
      fullName: selectedAddress.fullName,
      phone: selectedAddress.phone,
      country: selectedAddress.country,
      city: selectedAddress.city,
      area: selectedAddress.area,
      street: selectedAddress.street ?? "",
      building: selectedAddress.building ?? "",
    }));
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (!form.country) {
      return;
    }

    if (cityOptions.length === 0) {
      return;
    }

    if (cityOptions.some((option) => option.value === form.city)) {
      return;
    }

    setForm((current) => ({
      ...current,
      city: cityOptions[0]?.value ?? "",
    }));
  }, [cityOptions, form.city, form.country]);

  useEffect(() => {
    let mounted = true;

    async function loadActiveFlashSale() {
      if (!lines.length) {
        if (mounted) {
          setActiveFlashSale(null);
        }
        return;
      }

      try {
        const response = await fetch("/api/flash-sales/active");
        const payload = (await response.json()) as {
          data?: Array<{
            id: string;
            title: string;
            discount_type: "percentage" | "fixed";
            discount_value: string | number;
          }>;
        };
        const sale = payload.data?.[0];

        if (!mounted) {
          return;
        }

        if (!sale) {
          setActiveFlashSale(null);
          return;
        }

        setActiveFlashSale({
          id: sale.id,
          title: sale.title,
          discount_type: sale.discount_type,
          discount_value: Number(sale.discount_value),
        });
      } catch {
        if (mounted) {
          setActiveFlashSale(null);
        }
      }
    }

    void loadActiveFlashSale();

    return () => {
      mounted = false;
    };
  }, [lines.length]);

  useEffect(() => {
    let mounted = true;

    async function revalidateCoupon() {
      if (!appliedCoupon || !lines.length) {
        return;
      }

      try {
        const response = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: appliedCoupon.code,
            subtotal,
          }),
        });
        const result = (await response.json()) as {
          data?: typeof appliedCoupon;
          error?: string;
        };

        if (!mounted) {
          return;
        }

        if (!response.ok || result.error || !result.data) {
          clearAppliedCoupon();
          pushToast({
            title: t("Coupon removed"),
            description: result.error
              ? localizeCouponError(result.error, t)
              : t("This coupon no longer applies to your order."),
          });
          return;
        }

        if (!appliedCoupon || !sameAppliedCoupon(appliedCoupon, result.data)) {
          setAppliedCoupon(result.data);
        }
      } catch {
        if (mounted) {
          clearAppliedCoupon();
        }
      }
    }

    void revalidateCoupon();

    return () => {
      mounted = false;
    };
  }, [
    appliedCoupon?.code,
    appliedCoupon?.description,
    appliedCoupon?.discountType,
    appliedCoupon?.discountValue,
    appliedCoupon?.minSubtotal,
    clearAppliedCoupon,
    lines.length,
    pushToast,
    setAppliedCoupon,
    subtotal,
    t,
  ]);

  async function applyCoupon() {
    if (!couponCode.trim() || isApplyingCoupon) {
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          subtotal,
        }),
      });
      const result = (await response.json()) as {
        data?: NonNullable<typeof appliedCoupon>;
        error?: string;
      };

      if (!response.ok || result.error || !result.data) {
        throw new Error(result.error ?? "Failed to apply coupon");
      }

      setAppliedCoupon(result.data);
      pushToast({
        title: t("Coupon applied"),
        description: `${result.data.code} ${t("is active on this order.")}`,
      });
    } catch (error) {
      pushToast({
        title: t("Coupon failed"),
        description:
          error instanceof Error
            ? localizeCouponError(error.message, t)
            : t("Unable to apply that coupon right now."),
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  async function placeOrder() {
    if (!lines.length || isSubmitting) {
      return;
    }

    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.country.trim() ||
      !form.city.trim() ||
      !form.area.trim() ||
      !form.street.trim()
    ) {
      pushToast({
        title: t("Missing details"),
        description: t(
          "Please complete the delivery details before placing your order.",
        ),
      });
      return;
    }

    if (!hasConfiguredDelivery) {
      pushToast({
        title: t("Delivery unavailable"),
        description: t(
          "No delivery fee is configured for the selected location.",
        ),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: form.paymentMethod,
          customerName: form.fullName,
          customerEmail: session.email,
          customerPhone: form.phone,
          shippingAddress: {
            country: form.country,
            city: form.city,
            area: form.area,
            street: form.street,
            building: form.building,
          },
          billingAddress: null,
          subtotal,
          discountAmount,
          shippingAmount,
          taxAmount: 0,
          totalAmount: total,
          currency: "JOD",
          couponCode: appliedCoupon?.code ?? null,
          notes: form.notes,
          items: lines.map((line) => {
            const selectionSummary = getCartSelectionSummary(
              line.selections,
              localize,
            );

            return {
              productId: line.product.id,
              variantId: line.variant.id,
              productName: localize(line.product.name, line.product.nameAr),
              sku: line.variant.sku,
              sizeName: [
                localize(line.variant.size, line.variant.sizeAr),
                selectionSummary,
              ]
                .filter(Boolean)
                .join(" | "),
              colorName: null,
              imageUrl: line.product.images[0]?.url ?? null,
              unitPrice: line.variant.price,
              quantity: line.quantity,
              lineTotal: line.variant.price * line.quantity,
            };
          }),
        }),
      });

      const result = (await response.json()) as {
        data?: { order?: { id?: string } };
        error?: string;
      };

      if (!response.ok || result.error || !result.data?.order?.id) {
        throw new Error(result.error ?? "Failed to place order");
      }

      clearCart();
      router.push(`/order-success/${result.data.order.id}`);
    } catch (error) {
      pushToast({
        title: t("Order failed"),
        description:
          error instanceof Error
            ? t(error.message)
            : t("Something went wrong while placing the order."),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Container className="py-8 md:py-14">
      <section className="relative overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-8 md:px-8 md:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(140,36,71,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(214,180,180,0.08),transparent_28%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.34em] text-[var(--muted)]">
              {t("Secure checkout")}
            </div>
            <h1 className="mt-3 font-display text-4xl uppercase leading-none md:text-6xl">
              {t("CHECKOUT")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              {t(
                "Cash on Delivery is supported. Card checkout requires a configured payment provider.",
              )}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Bag lines", value: String(lines.length || 0) },
              {
                label: "Discount",
                value:
                  discountAmount > 0 ? formatCurrency(discountAmount) : "—",
              },
              { label: "Total", value: formatCurrency(total) },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-[22px] border border-white/10 bg-black/16 px-4 py-4 backdrop-blur-sm"
              >
                <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
                  {t(metric.label)}
                </div>
                <div className="mt-2 text-lg uppercase tracking-[0.08em] text-[var(--text)]">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5 rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 md:p-7">
          <div className="rounded-[22px] border border-white/8 bg-black/10 px-5 py-4">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
              {t("Single-page checkout")}
            </div>
            <div className="mt-2 text-sm uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              {t(
                "Delivery, payment, and review are handled on this one screen.",
              )}
            </div>
          </div>
          {!lines.length ? (
            <div className="rounded-[24px] border border-white/8 bg-black/10 p-5 text-sm text-[var(--text-secondary)]">
              {t("YOUR CART IS EMPTY.")}
            </div>
          ) : null}
          {addresses.length ? (
            <div className="space-y-3 rounded-[24px] border border-white/8 bg-black/10 p-4">
              <div className="text-xs tracking-[0.24em] text-[var(--muted)]">
                {t("Saved addresses")}
              </div>
              <div className="grid gap-3">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => setSelectedAddressId(address.id)}
                    className={`rounded-[22px] border px-4 py-4 text-left transition ${
                      selectedAddressId === address.id
                        ? "border-[var(--text)] bg-[color:color-mix(in_srgb,var(--card)_88%,var(--text)_12%)] text-[var(--text)]"
                        : "border-white/10 bg-transparent text-[var(--text)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium uppercase tracking-[0.16em]">
                        {address.label}
                      </div>
                      {address.isDefault ? (
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${selectedAddressId === address.id ? "bg-[var(--text)] text-[var(--background)]" : "border border-white/10 text-[var(--muted)]"}`}
                        >
                          {t("Default")}
                        </span>
                      ) : null}
                    </div>
                    <div
                      className={`mt-2 text-sm ${selectedAddressId === address.id ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"}`}
                    >
                      {address.fullName} · {address.phone}
                    </div>
                    <div
                      className={`mt-1 text-sm ${selectedAddressId === address.id ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"}`}
                    >
                      {[address.country, address.city, address.area]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                    <div
                      className={`mt-1 text-sm ${selectedAddressId === address.id ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"}`}
                    >
                      {[address.street, address.building]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <Link
                  href="/addresses/new"
                  className="rounded-[0.25rem] border border-white/10 px-4 py-2 text-xs tracking-[0.2em]"
                >
                  {t("ADD ADDRESS")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-white/8 bg-black/10 p-5 text-sm text-[var(--text-secondary)]">
              <div>{t("No saved addresses.")}</div>
              <Link
                href="/addresses/new"
                className="mt-4 inline-flex rounded-[0.25rem] border border-white/10 px-4 py-2 text-xs tracking-[0.2em] text-[var(--text)]"
              >
                {t("ADD ADDRESS")}
              </Link>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={form.country}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  country: event.target.value,
                  city: "",
                }))
              }
              className="h-12 rounded-[0.25rem] border border-white/10 bg-black/20 px-5 text-sm outline-none"
            >
              <option value="">{t("Select a country")}</option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={form.city}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  city: event.target.value,
                }))
              }
              className="h-12 rounded-[0.25rem] border border-white/10 bg-black/20 px-5 text-sm outline-none"
            >
              <option value="">{t("Select a city")}</option>
              {cityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {checkoutFields.map((field) => (
              <input
                key={field.key}
                value={form[field.key]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
                placeholder={t(field.label)}
                className="h-12 rounded-[0.25rem] border border-white/10 bg-black/20 px-5 text-sm outline-none"
              />
            ))}
          </div>
          <select
            value={form.paymentMethod}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                paymentMethod: event.target.value,
              }))
            }
            className="h-12 rounded-[0.25rem] border border-white/10 bg-black/20 px-5 text-sm outline-none"
          >
            <option value="cash_on_delivery">{t("Cash on Delivery")}</option>
            <option disabled>{t("Card (not configured)")}</option>
          </select>
          <div>
            <label
              htmlFor="checkout-notes"
              className="mb-2 block text-xs tracking-[0.16em] text-[var(--muted)]"
            >
              {t("Delivery instructions (optional)")}
            </label>
            <textarea
              id="checkout-notes"
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              placeholder={t(
                "Add delivery instructions or a note for your order",
              )}
              rows={3}
              className="w-full resize-y rounded-[0.25rem] border border-white/10 bg-black/20 px-5 py-3 text-sm outline-none"
            />
          </div>
        </div>
        <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6">
          <div className="mb-4 text-xs tracking-[0.25em] text-[var(--muted)]">
            {t("ORDER SUMMARY")}
          </div>
          <div className="mb-5 space-y-3">
            {lines.map((line) => (
              <div
                key={line.lineId}
                className="rounded-[24px] border border-white/8 bg-black/10 p-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      line.product.images[0]?.url ??
                      "/products/product-placeholder.svg"
                    }
                    alt={localize(line.product.name, line.product.nameAr)}
                    className="h-16 w-14 rounded-[14px] bg-[#fff8f2] object-contain p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">
                      {localize(line.product.name, line.product.nameAr)}
                    </div>
                    <div className="mt-1 text-xs text-[var(--text-secondary)]">
                      {localize(line.variant.size, line.variant.sizeAr)}
                    </div>
                    <CartSelectionList selections={line.selections} compact />
                    <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-white/10 px-3 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            line.lineId,
                            Math.max(1, line.quantity - 1),
                          )
                        }
                        className="text-[var(--text-secondary)] transition hover:text-[var(--text)]"
                        aria-label={`Decrease quantity for ${localize(line.product.name, line.product.nameAr)}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-4 text-sm">{line.quantity}</span>
                      <button
                        type="button"
                        disabled={
                          !line.variant.allowBackorder &&
                          line.quantity >=
                            Math.max(1, line.variant.stockQuantity)
                        }
                        onClick={() =>
                          updateQuantity(line.lineId, line.quantity + 1)
                        }
                        className="text-[var(--text-secondary)] transition hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Increase quantity for ${localize(line.product.name, line.product.nameAr)}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                      {line.variant.allowBackorder
                        ? t("Backorder available")
                        : `${t("Max")}: ${Math.max(1, line.variant.stockQuantity)}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {formatCurrency(line.variant.price * line.quantity)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(line.lineId)}
                      className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] transition hover:text-[var(--text)]"
                    >
                      {t("REMOVE")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <SummaryRow label={t("Subtotal")} value={formatCurrency(subtotal)} />
          {flashSaleDiscountAmount > 0 ? (
            <SummaryRow
              label={
                activeFlashSale
                  ? `${t("Flash sale")} (${activeFlashSale.title})`
                  : t("Flash sale")
              }
              value={`-${formatCurrency(flashSaleDiscountAmount)}`}
            />
          ) : null}
          {couponDiscountAmount > 0 ? (
            <SummaryRow
              label={
                appliedCoupon
                  ? `${t("Coupon")} (${appliedCoupon.code})`
                  : t("Coupon")
              }
              value={`-${formatCurrency(couponDiscountAmount)}`}
            />
          ) : null}
          <div className="mt-5 grid gap-3">
            <input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              placeholder={t("Enter promo code")}
              className="h-12 rounded-[0.25rem] border border-white/10 bg-black/20 px-5 text-sm outline-none"
            />
            {appliedCoupon ? (
              <button
                type="button"
                onClick={clearAppliedCoupon}
                className="rounded-full border border-white/10 px-5 py-3 text-sm tracking-[0.2em]"
              >
                {t("REMOVE COUPON")}
              </button>
            ) : (
              <button
                type="button"
                disabled={!lines.length || isApplyingCoupon}
                onClick={applyCoupon}
                className="rounded-full border border-white/10 px-5 py-3 text-sm tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isApplyingCoupon ? t("APPLYING") : t("Apply")}
              </button>
            )}
            {appliedCoupon?.description ? (
              <div className="text-xs text-[var(--text-secondary)]">
                {appliedCoupon.description}
              </div>
            ) : null}
          </div>
          <SummaryRow
            label={t("Delivery")}
            value={
              hasConfiguredDelivery
                ? formatCurrency(shippingAmount)
                : t("Select a supported country and city")
            }
          />
          <SummaryRow
            label={t("Total")}
            value={formatCurrency(total)}
            emphasis
          />
          {!hasConfiguredDelivery && lines.length ? (
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              {t("No delivery fee is configured for the selected location.")}
            </p>
          ) : null}
          <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">
            {t(
              "Final pricing should be confirmed by a Supabase checkout RPC before production launch.",
            )}
          </p>
          <button
            type="button"
            disabled={!lines.length || isSubmitting || !hasConfiguredDelivery}
            onClick={placeOrder}
            className="mt-6 w-full rounded-full bg-[var(--text)] px-5 py-3 text-sm tracking-[0.2em] text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? t("PLEASE WAIT") : t("PLACE ORDER")}
          </button>
        </div>
      </div>
    </Container>
  );
}

export function AuthPageView({
  mode,
}: {
  mode: "login" | "register" | "forgot-password";
}) {
  const { t } = useLocale();
  const schema = z.object({
    email: z.string().email(),
    password:
      mode === "forgot-password" ? z.string().optional() : z.string().min(6),
    fullName: mode === "register" ? z.string().min(2) : z.string().optional(),
  });

  type FormValues = z.infer<typeof schema>;
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <Container className="flex min-h-[70vh] items-center py-10">
      <div className="mx-auto w-full max-w-lg rounded-[36px] border border-white/8 bg-white/3 p-8 md:p-10">
        <div className="text-xs tracking-[0.25em] text-[var(--muted)]">
          {t("SUPABASE AUTH")}
        </div>
        <h1 className="mt-3 font-display text-5xl uppercase">
          {mode === "login"
            ? t("LOG IN")
            : mode === "register"
              ? t("JOIN THE COVEN")
              : t("RESET PASSWORD")}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          {mode === "login"
            ? "Sign in to keep your bag, favorites, and orders in sync."
            : mode === "register"
              ? "Create your account before the next drop disappears."
              : "We will send a reset link if your Supabase project is configured."}
        </p>
        <form
          onSubmit={handleSubmit(async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setSubmitted(true);
          })}
          className="mt-8 space-y-4"
        >
          {mode === "register" ? (
            <Field label={t("Full Name")} error={errors.fullName?.message}>
              <input
                {...register("fullName")}
                className="h-12 w-full rounded-full border border-white/10 bg-black/20 px-5 text-sm outline-none"
              />
            </Field>
          ) : null}
          <Field label={t("Email")} error={errors.email?.message}>
            <input
              {...register("email")}
              className="h-12 w-full rounded-full border border-white/10 bg-black/20 px-5 text-sm outline-none"
            />
          </Field>
          {mode !== "forgot-password" ? (
            <Field label={t("Password")} error={errors.password?.message}>
              <input
                type="password"
                {...register("password")}
                className="h-12 w-full rounded-full border border-white/10 bg-black/20 px-5 text-sm outline-none"
              />
            </Field>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[var(--text)] px-5 py-3 text-sm tracking-[0.2em] text-black"
          >
            {isSubmitting
              ? t("PLEASE WAIT")
              : mode === "login"
                ? t("LOG IN")
                : mode === "register"
                  ? t("Register")
                  : t("Send code")}
          </button>
          {submitted ? (
            <p className="text-sm text-[var(--blush)]">
              {t(
                "Form captured. Wire this to your Supabase auth environment keys before launch.",
              )}
            </p>
          ) : null}
        </form>
      </div>
    </Container>
  );
}

export function OrderSuccessPageView({ orderId }: { orderId: string }) {
  const { t } = useLocale();

  return (
    <Container className="py-12 md:py-20">
      <div className="mx-auto max-w-3xl rounded-[36px] border border-white/8 bg-white/3 p-8 md:p-10">
        <SectionHeading
          title={t("ORDER RECEIVED.")}
          description={`${t("Order number")} #${orderId}`}
        />
        <div className="space-y-4 text-sm leading-7 text-[var(--text-secondary)]">
          <p>{t("Your order has been placed successfully.")}</p>
          <p>
            {t(
              "You can review delivery updates and order details from your account page.",
            )}
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/account"
            className="rounded-full border border-white/10 px-5 py-3 text-center text-sm tracking-[0.2em]"
          >
            {t("TRACK ORDER")}
          </Link>
          <Link
            href="/shop"
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-center text-sm tracking-[0.2em]"
            style={{ color: "var(--background)" }}
          >
            {t("CONTINUE SHOPPING")}
          </Link>
        </div>
      </div>
    </Container>
  );
}

function CatalogHero({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { t } = useLocale();
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] py-10 md:py-14">
      <Container className="relative">
        <div className="text-[11px] tracking-[0.28em] text-[var(--muted)]">
          {t("STORE")}
        </div>
        <h1 className="mt-3 text-2xl font-semibold uppercase tracking-[0.22em] md:text-4xl">
          {t(title)}
        </h1>
        <p className="mt-3 max-w-2xl text-sm uppercase tracking-[0.12em] text-[var(--text-secondary)]">
          {t(description)}
        </p>
      </Container>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${emphasis ? "text-lg text-[var(--text)]" : "text-sm text-[var(--text-secondary)]"}`}
    >
      <span>{label}</span>
      <span className={emphasis ? "text-[var(--text)]" : ""}>{value}</span>
    </div>
  );
}

function localizeCouponError(message: string, t: (value: string) => string) {
  const prefix = "This coupon requires a minimum subtotal of ";

  if (message.startsWith(prefix) && message.endsWith(" JOD.")) {
    const amount = message.slice(prefix.length, -" JOD.".length);
    return `${t("This coupon requires a minimum subtotal of")} ${amount} ${t("JOD.")}`;
  }

  return t(message);
}

function sameAppliedCoupon(
  left: {
    code: string;
    name: string;
    description?: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minSubtotal?: number;
  },
  right: {
    code: string;
    name: string;
    description?: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minSubtotal?: number;
  },
) {
  return (
    left.code === right.code &&
    left.name === right.name &&
    left.description === right.description &&
    left.discountType === right.discountType &&
    left.discountValue === right.discountValue &&
    left.minSubtotal === right.minSubtotal
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs tracking-[0.24em] text-[var(--muted)]">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-2 block text-xs text-[var(--blush)]">{error}</span>
      ) : null}
    </label>
  );
}

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const { t, dir } = useLocale();
  const [open, setOpen] = useState(defaultOpen);
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="border-b border-[var(--border)] pb-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text)]"
      >
        <span>{t(title)}</span>
        <ArrowIcon
          className={`h-4 w-4 transition ${open ? (dir === "rtl" ? "-rotate-90" : "rotate-90") : ""}`}
        />
      </button>
      {open ? (
        <div className="pt-2 text-sm leading-7 text-[var(--text-secondary)]">
          {children}
        </div>
      ) : null}
    </div>
  );
}
