'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Heart,
  Minus,
  Plus,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLocale } from '@/components/storefront/locale-provider';
import {
  Container,
  NewsletterSection,
  ProductGrid,
  Rating,
  SectionHeading,
} from '@/components/storefront/storefront-sections';
import {
  DeliveryZone,
  FlashSale,
  StoreBrand,
  StoreCategory,
  StoreProduct,
} from '@/lib/commerce-types';
import {
  calculateDiscount,
  calculateDiscountAmount,
  filterProducts,
  formatCurrency,
  getProductSizes,
} from '@/lib/commerce-utils';
import { calculateCouponDiscount } from '@/lib/coupon-utils';
import { resolveDeliveryFee } from '@/lib/delivery-zones';
import { CartLineSelection, getCartProducts, useCartStore } from '@/stores/use-cart-store';
import { useUiStore } from '@/stores/use-ui-store';

export function ShopPageView({
  products,
  categories,
  title = 'SHOP',
  description = 'Explore premium devices, e-liquids, pods, coils, and smoking accessories.',
  initialCategory,
  initialBrand,
  initialSort,
  initialSale = false,
  flashSale,
}: {
  products: StoreProduct[];
  categories: StoreCategory[];
  title?: string;
  description?: string;
  initialCategory?: string;
  initialBrand?: string;
  initialSort?: 'newest' | 'price-asc' | 'price-desc' | 'featured';
  initialSale?: boolean;
  flashSale?: FlashSale | null;
}) {
  const { t, localize, dir } = useLocale();
  const [category, setCategory] = useState(initialCategory ?? 'all');
  const [brand] = useState(initialBrand ?? '');
  const [sort, setSort] = useState<'newest' | 'price-asc' | 'price-desc' | 'featured'>(
    initialSort ?? 'newest'
  );

  const filtered = useMemo(
    () =>
      filterProducts(products, {
        category: category !== 'all' ? category : undefined,
        brand: brand || undefined,
        sort,
        sale: initialSale || undefined,
      }),
    [brand, category, initialSale, products, sort]
  );
  const rootCategories = categories.filter((item) => !item.parentId);
  const selectedCategory = categories.find((item) => item.slug === category);
  const selectedParent = selectedCategory?.parentId
    ? categories.find((item) => item.id === selectedCategory.parentId)
    : selectedCategory;
  const subcategories = selectedParent
    ? categories.filter((item) => item.parentId === selectedParent.id)
    : [];
  const productCount = (slug: string) =>
    products.filter((product) => product.categorySlug === slug).length;

  return (
    <div className="space-y-10 pb-16 md:space-y-16 md:pb-24">
      {flashSale ? <CatalogFlashSaleBanner flashSale={flashSale} /> : null}
      <CatalogHero title={title} description={description} />
      <CategoryFilterBar
        categories={rootCategories}
        subcategories={subcategories}
        selectedCategory={category}
        productCount={productCount}
        dir={dir}
        selectedLabel={
          category === 'all' ? t('ALL') : localize(selectedCategory?.name, selectedCategory?.nameAr)
        }
        resultCount={filtered.length}
        onSelect={setCategory}
        allLabel={t('ALL')}
        localize={localize}
        t={t}
      />
      <Container>
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] py-3 text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
          <div>
            {t('Showing')} {filtered.length} {t('products')}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="inline-flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t('FILTERS')}
            </button>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
              className="border-l border-[var(--border)] bg-transparent pl-3 text-[10px] uppercase tracking-[0.22em] outline-none"
            >
              <option value="newest">{t('Newest')}</option>
              <option value="price-asc">{t('Price Low to High')}</option>
              <option value="price-desc">{t('Price High to Low')}</option>
              <option value="featured">{t('Featured')}</option>
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

export function BrandsPageView({
  brands,
  products,
}: {
  brands: StoreBrand[];
  products: StoreProduct[];
}) {
  const { localize, t } = useLocale();
  const brandCards = brands.length
    ? brands
    : Array.from(new Map(products.map((product) => [product.brand, product])).values()).map(
        (product) => ({
          id: product.brand,
          slug: product.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: product.brand,
          nameAr: product.brandAr,
          image: product.images[0]?.url,
        })
      );

  return (
    <Container className="py-10 md:py-16">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-7 md:p-12"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-[var(--border)] opacity-60" />
        <div className="relative max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
            {t('PUFF JO / BRANDS')}
          </div>
          <h1 className="mt-4 text-5xl font-black uppercase leading-none tracking-[-0.05em] text-[var(--text)] md:text-7xl">
            {t('BRANDS')}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--text-secondary)]">
            {t('Shop trusted vape brands, devices, flavors, and accessories from one place.')}
          </p>
        </div>
      </motion.section>

      {brandCards.length ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {brandCards.map((brand) => (
            <motion.div
              key={brand.id}
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4 }}
            >
              <Link
                href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                className="group relative block aspect-[1.15] overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--card)]"
              >
                {brand.image ? (
                  <img
                    src={brand.image}
                    alt={localize(brand.name, brand.nameAr)}
                    className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
                  <div>
                    <div className="text-xl font-black uppercase tracking-[-0.02em]">
                      {localize(brand.name, brand.nameAr)}
                    </div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                      {t('View products')}
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="mt-6 rounded-[26px] border border-[var(--border)] bg-[var(--card)] p-10 text-center text-[var(--text-secondary)]">
          {t('No brands available yet.')}
        </div>
      )}
    </Container>
  );
}

function CategoryFilterBar({
  categories,
  subcategories,
  selectedCategory,
  productCount,
  dir,
  selectedLabel,
  resultCount,
  onSelect,
  allLabel,
  localize,
  t,
}: {
  categories: StoreCategory[];
  subcategories: StoreCategory[];
  selectedCategory: string;
  productCount: (slug: string) => number;
  dir: 'ltr' | 'rtl';
  selectedLabel: string;
  resultCount: number;
  onSelect: (slug: string) => void;
  allLabel: string;
  localize: (english?: string | null, arabic?: string | null) => string;
  t: (text: string) => string;
}) {
  const hasSubcategories = subcategories.length > 0 && selectedCategory !== 'all';

  return (
    <section className="border-y border-[var(--border)] bg-[var(--background-secondary)]" dir={dir}>
      <Container className="py-4 md:py-5">
        <div className="relative">
          <div className="scrollbar-hidden flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
            <CategoryFilterButton
              label={allLabel}
              count={null}
              active={selectedCategory === 'all'}
              onClick={() => onSelect('all')}
            />
            {categories.map((item) => (
              <CategoryFilterButton
                key={item.id}
                label={localize(item.name, item.nameAr)}
                count={productCount(item.slug)}
                active={
                  selectedCategory === item.slug ||
                  item.id === subcategories.find((sub) => sub.slug === selectedCategory)?.parentId
                }
                onClick={() => onSelect(item.slug)}
              />
            ))}
          </div>
        </div>
        <div
          className={`grid transition-all duration-300 ease-out ${hasSubcategories ? 'mt-3 max-h-20 translate-y-0 opacity-100' : 'max-h-0 -translate-y-1 overflow-hidden opacity-0'}`}
        >
          <div className="scrollbar-hidden flex gap-2 overflow-x-auto border-t border-[var(--border)] pt-3 md:flex-wrap md:overflow-visible">
            {subcategories.map((item) => (
              <CategoryFilterButton
                key={item.id}
                label={localize(item.name, item.nameAr)}
                count={productCount(item.slug)}
                active={selectedCategory === item.slug}
                onClick={() => onSelect(item.slug)}
                secondary
              />
            ))}
          </div>
        </div>
        <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {selectedLabel} · {resultCount} {t(resultCount === 1 ? 'product' : 'products')}
        </div>
      </Container>
    </section>
  );
}

function CategoryFilterButton({
  label,
  count,
  active,
  onClick,
  secondary = false,
}: {
  label: string;
  count: number | null;
  active: boolean;
  onClick: () => void;
  secondary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap border px-3.5 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.14em] transition duration-300 hover:-translate-y-0.5 ${secondary ? 'rounded-lg border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--card)]' : 'rounded-xl'} ${active ? 'border-[var(--text)] bg-[var(--text)] text-[var(--background)] shadow-[0_6px_16px_rgba(0,0,0,.14)]' : 'border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--text)] hover:bg-[var(--card)]'}`}
    >
      <span>{label}</span>
      {count !== null ? (
        <span className={`text-[9px] ${active ? 'opacity-60' : 'text-[var(--muted)]'}`}>
          {count}
        </span>
      ) : null}
    </button>
  );
}

function CatalogFlashSaleBanner({ flashSale }: { flashSale: FlashSale }) {
  const { dir, t } = useLocale();

  return (
    <section className="border-y border-white/10 bg-[linear-gradient(135deg,#222525,#090a0a)] px-4 py-5 md:px-8">
      <Container className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/60">
            {t(flashSale.title)}
          </div>
          <div className="mt-2 font-display text-4xl uppercase leading-none text-white md:text-5xl">
            {t(flashSale.discountLabel)}
          </div>
          {flashSale.description ? (
            <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-white/74">
              {t(flashSale.description)}
            </div>
          ) : null}
        </div>

        <Link
          href={flashSale.ctaUrl || '/shop?sale=true'}
          className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-black md:self-center"
        >
          <span className="text-black">
            {flashSale.ctaText ? t(flashSale.ctaText) : t('Shop sale')}
          </span>
          {dir === 'rtl' ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
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
          id: 'fallback-image',
          url: '/products/puff-jo-product-default.png',
          alt: product.name,
        },
      ];
  const [selectedSize, setSelectedSize] = useState(sizes[0]?.name ?? '');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      optionGroups.map((group) => [
        group.id,
        group.selectionType === 'radio'
          ? [
              group.items.find(
                (item) =>
                  item.isDefault &&
                  (!item.trackInventory || item.stockQuantity > 0 || item.allowBackorder)
              )?.id ??
                group.items.find(
                  (item) => !item.trackInventory || item.stockQuantity > 0 || item.allowBackorder
                )?.id ??
                '',
            ].filter(Boolean)
          : group.items
              .filter(
                (item) =>
                  item.isDefault &&
                  (!item.trackInventory || item.stockQuantity > 0 || item.allowBackorder)
              )
              .map((item) => item.id),
      ])
    )
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const selectedVariant =
    product.variants.find((variant) => variant.size === selectedSize) ?? product.variants[0];

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
  const optionsTotal = selectedOptionItems.reduce((sum, item) => sum + item.priceDelta, 0);
  const displayPrice = selectedVariant.price + optionsTotal;
  const discount = calculateDiscount(selectedVariant.price, selectedVariant.compareAtPrice);
  const maxQuantity = Math.min(
    product.maxOrderQuantity ?? 99,
    selectedVariant.allowBackorder ? 99 : Math.max(1, selectedVariant.stockQuantity)
  );
  const selectedOptionKey = optionGroups
    .map((group) => `${group.id}:${[...(selectedOptions[group.id] ?? [])].sort().join(',')}`)
    .sort()
    .join('|');
  const cartLineId = [product.id, selectedVariant.id, selectedSize, selectedOptionKey]
    .filter(Boolean)
    .join('::');

  function handleBuyNow() {
    addItem(
      buildConfiguredProduct(),
      selectedVariant.id,
      Math.min(quantity, maxQuantity),
      cartLineId,
      cartSelections
    );

    if (!customer) {
      router.push('/login?next=%2Fcheckout');
      return;
    }

    router.push('/checkout');
  }

  function buildConfiguredProduct() {
    if (optionsTotal <= 0) {
      return product;
    }

    return {
      ...product,
      variants: product.variants.map((variant) =>
        variant.id === selectedVariant.id ? { ...variant, price: displayPrice } : variant
      ),
    };
  }

  function handleOptionChange(
    groupId: string,
    itemId: string,
    selectionType: 'radio' | 'checkbox'
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
      if (selectionType === 'radio') {
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
        title: t('Sign in required'),
        description: t('Sign in to save products to your favorites.'),
      });
      router.push('/login');
      return;
    }

    const nextFavorite = !isFavorite;
    const response = await fetch(
      nextFavorite
        ? '/api/favorites'
        : `/api/favorites?productId=${encodeURIComponent(product.id)}`,
      nextFavorite
        ? {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId: product.id }),
          }
        : { method: 'DELETE' }
    );

    if (!response.ok) {
      pushToast({
        title: t('Something went wrong'),
        description: t('Try again in a moment.'),
      });
      return;
    }

    setIsFavorite(nextFavorite);
    toggleFavorite(product.id);
    pushToast({
      title: nextFavorite ? t('SAVED TO FAVORITES') : t('REMOVED FROM FAVORITES'),
      description: localize(product.name, product.nameAr),
    });
  }

  async function handleReviewSubmit() {
    if (!customer) {
      pushToast({
        title: t('Sign in required'),
        description: t('Sign in to review products.'),
      });
      router.push('/login');
      return;
    }

    if (!reviewComment.trim()) {
      pushToast({
        title: t('Review comment is required'),
        description: t('Write a short review before submitting.'),
      });
      return;
    }

    setIsSubmittingReview(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Failed to submit review');
      }

      setReviews((current) => [
        {
          id: crypto.randomUUID(),
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          createdAt: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).format(new Date()),
          authorName: customer.fullName,
        },
        ...current,
      ]);
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      pushToast({
        title: t('Review submitted'),
        description: t('Your review was submitted successfully.'),
      });
    } catch (error) {
      pushToast({
        title: t('Something went wrong'),
        description: error instanceof Error ? t(error.message) : t('Try again in a moment.'),
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
            {dir === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {t('BACK TO SHOP')}
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
                        ? 'border-[var(--accent)] shadow-[0_0_0_1px_var(--accent)]'
                        : 'border-[var(--border)] hover:border-[var(--accent)]/40'
                    }`}
                  >
                    <img
                      src={image.url || undefined}
                      alt={image.alt}
                      className="h-24 w-24 rounded-md bg-[var(--background)] object-contain transition duration-500 group-hover:scale-[1.03] lg:h-24 lg:w-full lg:min-w-[96px]"
                    />
                  </button>
                );
              })}
            </div>

            <div className="order-1 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[0_24px_70px_rgba(24,18,17,0.12)] lg:order-2">
              <div className="relative bg-[var(--card)]">
                {galleryImages[selectedImageIndex]?.url ? (
                  <img
                    src={galleryImages[selectedImageIndex].url}
                    alt={galleryImages[selectedImageIndex].alt}
                    className="block h-auto w-full object-contain"
                  />
                ) : null}
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
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                }`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
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
              <Rating rating={product.rating} reviewCount={product.reviewCount} />
              <div className="text-sm text-[var(--muted)]">
                {selectedVariant.stockQuantity > 0
                  ? selectedVariant.stockQuantity <= 2
                    ? `${t('ONLY')} ${selectedVariant.stockQuantity} ${t('LEFT')}`
                    : t('HOT NOW')
                  : t('SOLD OUT')}
              </div>
            </div>

            {sizes.length > 1 ? (
              <div className="mt-7">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t('SIZE')}
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((sizeOption) => {
                    const available = product.variants.some(
                      (variant) =>
                        variant.size === sizeOption.name &&
                        (variant.stockQuantity > 0 || variant.allowBackorder)
                    );

                    return (
                      <button
                        key={sizeOption.name}
                        type="button"
                        onClick={() => setSelectedSize(sizeOption.name)}
                        disabled={!available}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          selectedSize === sizeOption.name
                            ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                            : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40'
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        {localize(sizeOption.name, sizeOption.nameAr)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

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
                            {localize(group.description ?? '', group.descriptionAr)}
                          </div>
                        ) : null}
                      </div>
                      <span className="rounded-full bg-[color:color-mix(in_srgb,var(--accent)_12%,transparent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                        {group.selectionType === 'radio' ? t('Choose one') : t('Add-ons')}
                      </span>
                    </div>
                    <div className="grid gap-2">
                      {group.items.map((item) => {
                        const selected = (selectedOptions[group.id] ?? []).includes(item.id);
                        const inputType = group.selectionType === 'radio' ? 'radio' : 'checkbox';
                        const available =
                          !item.trackInventory || item.stockQuantity > 0 || item.allowBackorder;

                        return (
                          <label
                            key={item.id}
                            className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                              selected
                                ? 'border-[var(--accent)] bg-[color:color-mix(in_srgb,var(--accent)_10%,var(--background))] text-[var(--text)]'
                                : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40'
                            } ${available ? 'cursor-pointer' : 'cursor-not-allowed opacity-45'}`}
                          >
                            <span className="flex items-center gap-3">
                              <input
                                type={inputType}
                                name={`option-${group.id}`}
                                checked={selected}
                                disabled={!available}
                                onChange={() =>
                                  handleOptionChange(group.id, item.id, group.selectionType)
                                }
                                className="h-4 w-4 accent-black"
                              />
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={localize(item.name, item.nameAr)}
                                  className="h-11 w-11 rounded-md bg-[var(--background-secondary)] object-contain p-1"
                                />
                              ) : null}
                              <span>
                                <span className="block">{localize(item.name, item.nameAr)}</span>
                                {item.trackInventory ? (
                                  <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                                    {available
                                      ? `${t('Stock')}: ${item.stockQuantity}`
                                      : t('SOLD OUT')}
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
                <span className="min-w-6 text-center text-lg font-bold">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= maxQuantity}
                  onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--card)] text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm font-semibold text-[var(--text-secondary)]">
                {t('Choose quantity')}
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={selectedVariant.stockQuantity <= 0 && !selectedVariant.allowBackorder}
                onClick={() => {
                  addItem(
                    buildConfiguredProduct(),
                    selectedVariant.id,
                    Math.min(quantity, maxQuantity),
                    cartLineId,
                    cartSelections
                  );
                  openCart();
                  pushToast({
                    title: t('Added to your cart'),
                    description: `${localize(product.name, product.nameAr)} • ${localize(selectedVariant.size, selectedVariant.sizeAr)}`,
                  });
                }}
                className="rounded-full bg-black px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_34px_rgba(0,0,0,0.22)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('AddToCartButton')}
              </button>
              <Link
                href="/checkout"
                onClick={(event) => {
                  event.preventDefault();
                  handleBuyNow();
                }}
                className="rounded-full border border-[var(--border)] px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {t('ORDER NOW')}
              </Link>
            </div>

            <div className="mt-8 space-y-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-5">
              <Accordion title="ITEM DETAILS" defaultOpen>
                {localize(product.description, product.descriptionAr)}
              </Accordion>
              <Accordion title="DELIVERY">
                {t(
                  'Fast delivery is available across Jordan. Dispatch timing depends on coverage and order volume.'
                )}
              </Accordion>
              <Accordion title="ORDER NOTES">
                {t('Please add delivery notes and any setup preferences before checkout.')}
              </Accordion>
            </div>

            <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--background)] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {t('ITEM REVIEWS')}
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
                            ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                            : 'border-[var(--border)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <Star
                          className={`h-4 w-4 ${reviewRating >= value ? 'fill-current' : ''}`}
                        />
                        {value}
                      </button>
                    ))}
                  </div>
                  <input
                    value={reviewTitle}
                    onChange={(event) => setReviewTitle(event.target.value)}
                    placeholder={t('Review title')}
                    className="h-12 w-full rounded-full border border-[var(--border)] bg-[var(--background-secondary)] px-5 text-sm text-[var(--text)] outline-none"
                  />
                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder={t('Write your review')}
                    rows={4}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] px-5 py-4 text-sm text-[var(--text)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleReviewSubmit}
                    disabled={isSubmittingReview}
                    className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-40"
                  >
                    {isSubmittingReview ? t('PLEASE WAIT') : t('SUBMIT REVIEW')}
                  </button>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] p-4 text-sm text-[var(--text-secondary)]">
                  <div>{t('Sign in to review products.')}</div>
                  <Link
                    href="/login"
                    className="mt-3 inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text)]"
                  >
                    {t('LOG IN')}
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
                          <div className="text-sm font-medium">{review.authorName}</div>
                          <div className="mt-1 text-xs tracking-[0.16em] text-[var(--muted)]">
                            {review.createdAt}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          {Array.from({ length: review.rating }).map((_, index) => (
                            <Star key={`${review.id}-${index}`} className="h-4 w-4 fill-current" />
                          ))}
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
                  <div className="text-sm text-[var(--text-secondary)]">{t('No reviews yet.')}</div>
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
              {t('PRICE')}
            </div>
            <div className="text-lg font-bold text-[var(--accent)]">
              {formatCurrency(selectedVariant.price)}
            </div>
          </div>
          <button
            type="button"
            disabled={selectedVariant.stockQuantity <= 0 && !selectedVariant.allowBackorder}
            onClick={() => {
              addItem(
                buildConfiguredProduct(),
                selectedVariant.id,
                Math.min(quantity, maxQuantity),
                cartLineId,
                cartSelections
              );
              openCart();
            }}
            className="rounded-full bg-black px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white"
          >
            {t('AddToCartButton')}
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
    <div className={compact ? 'mt-2 space-y-1.5' : 'mt-3 space-y-2'}>
      {selections.map((selection) => (
        <div
          key={selection.groupId}
          className={
            compact
              ? 'rounded-[14px] border border-white/8 bg-white/4 px-3 py-2'
              : 'rounded-[16px] border border-white/8 bg-black/10 px-4 py-3'
          }
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {localize(selection.groupName, selection.groupNameAr)}
          </div>
          <div className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
            {selection.items
              .map((item) => {
                const label = localize(item.name, item.nameAr);
                return item.priceDelta > 0 ? `${label} +${formatCurrency(item.priceDelta)}` : label;
              })
              .join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
}

function getCartSelectionSummary(
  selections: CartLineSelection[],
  localize: (english?: string | null, arabic?: string | null) => string
) {
  return selections
    .map((selection) => {
      const items = selection.items
        .map((item) => {
          const label = localize(item.name, item.nameAr);
          return item.priceDelta > 0 ? `${label} +${formatCurrency(item.priceDelta)}` : label;
        })
        .join(', ');

      return items ? `${localize(selection.groupName, selection.groupNameAr)}: ${items}` : null;
    })
    .filter(Boolean)
    .join(' | ');
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
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code ?? '');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const lines = items
    .map((item) => {
      const product = item.product ?? products.find((entry) => entry.id === item.productId);
      const variant = product?.variants.find((entry) => entry.id === item.variantId);
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
  const subtotal = lines.reduce((sum, line) => sum + line.variant.price * line.quantity, 0);
  const couponDiscountAmount = useMemo(
    () => (appliedCoupon ? calculateCouponDiscount(subtotal, appliedCoupon) : 0),
    [appliedCoupon, subtotal]
  );
  const total = Math.max(0, subtotal - couponDiscountAmount);

  useEffect(() => {
    setCouponCode(appliedCoupon?.code ?? '');
  }, [appliedCoupon?.code]);

  useEffect(() => {
    let mounted = true;

    async function revalidateCoupon() {
      if (!appliedCoupon || !lines.length) {
        return;
      }

      try {
        const response = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
            title: t('Coupon removed'),
            description: result.error
              ? localizeCouponError(result.error, t)
              : t('This coupon no longer applies to your bag.'),
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
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        throw new Error(result.error ?? 'Failed to apply coupon');
      }

      setAppliedCoupon(result.data);
      pushToast({
        title: t('Coupon applied'),
        description: `${result.data.code} ${t('is active on this order.')}`,
      });
    } catch (error) {
      pushToast({
        title: t('Coupon failed'),
        description:
          error instanceof Error
            ? localizeCouponError(error.message, t)
            : t('Unable to apply that coupon right now.'),
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  return (
    <Container className="py-8 md:py-14">
      <div className="mb-8">
        <div className="text-xs tracking-[0.3em] text-[var(--muted)]">{t('CART')}</div>
        <h1 className="font-display text-4xl uppercase sm:text-5xl">{t('YOUR CART')}</h1>
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
                  src={line.product.images[0]?.url || '/products/puff-jo-product-default.png'}
                  alt={localize(line.product.name, line.product.nameAr)}
                  className="h-32 w-full rounded-[20px] bg-[var(--background-secondary)] object-contain p-2 sm:h-40 md:h-36 md:w-32 md:flex-none"
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
                    <div className="text-sm sm:text-base">{formatCurrency(line.variant.price)}</div>
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
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
                    {t('REMOVE')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="h-fit rounded-[28px] border border-white/8 bg-white/3 p-5 lg:sticky lg:top-28">
            <div className="mb-5 text-xs tracking-[0.25em] text-[var(--muted)]">
              {t('ORDER SUMMARY')}
            </div>
            <SummaryRow label={t('Subtotal')} value={formatCurrency(subtotal)} />
            {couponDiscountAmount > 0 ? (
              <SummaryRow
                label={appliedCoupon ? `${t('Coupon')} (${appliedCoupon.code})` : t('Coupon')}
                value={`-${formatCurrency(couponDiscountAmount)}`}
              />
            ) : null}
            <SummaryRow
              label={t('Delivery')}
              value={lines.length ? t('Calculated at checkout') : formatCurrency(0)}
            />
            <SummaryRow label={t('Tax')} value={formatCurrency(0)} />
            <div className="mt-4 border-t border-white/8 pt-4">
              <SummaryRow label={t('Total')} value={formatCurrency(total)} emphasis />
            </div>
            <div className="mt-5 grid gap-3">
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder={t('Enter promo code')}
                className="h-12 rounded-full border border-white/10 bg-black/20 px-5 text-sm outline-none"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={clearAppliedCoupon}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm tracking-[0.2em]"
                >
                  {t('REMOVE COUPON')}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!lines.length || isApplyingCoupon}
                  onClick={applyCoupon}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isApplyingCoupon ? t('APPLYING') : t('Apply')}
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
                style={{ color: 'var(--background)' }}
              >
                {t('CHECKOUT')}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[32px] border border-white/8 bg-white/3 p-10 text-center">
          <div className="font-display text-4xl uppercase">{t('YOUR CART IS EMPTY.')}</div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            {t('Start with a device, a fresh flavor, or a new everyday essential.')}
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm tracking-[0.2em]"
            style={{ color: 'var(--background)' }}
          >
            {t('VIEW SHOP')}
          </Link>
        </div>
      )}
    </Container>
  );
}

export function FavoritesPageView({ products }: { products: StoreProduct[] }) {
  const favorites = useCartStore((state) => state.favorites);
  const favoriteProducts = products.filter((product) => favorites.includes(product.id));

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title="YOUR FAVORITES ARE EMPTY."
        description="Save the gear and flavors worth coming back to."
      />
      {favoriteProducts.length ? (
        <ProductGrid products={favoriteProducts} />
      ) : (
        <div className="rounded-[32px] border border-white/8 bg-white/3 p-10 text-center">
          <p className="text-sm text-[var(--text-secondary)]">Nothing saved yet.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-[var(--text)] px-5 py-3 text-sm tracking-[0.2em] text-black"
          >
            VIEW SHOP
          </Link>
        </div>
      )}
    </Container>
  );
}

export function SearchPageView({ products }: { products: StoreProduct[] }) {
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const results = useMemo(
    () => filterProducts(products, { search: query || undefined }).slice(0, 8),
    [products, query]
  );

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading title="SEARCH" description="Search by name, mood, or product detail." />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('Search devices, flavors, and accessories...')}
        className="h-14 w-full rounded-full border border-white/10 bg-white/3 px-6 text-sm outline-none"
      />
      <div className="mt-8">
        <ProductGrid products={results.length ? results : products.slice(0, 4)} />
      </div>
    </Container>
  );
}

export function AccountPageView() {
  const { t } = useLocale();
  const cards = [
    { title: 'Profile', body: 'Update your details and stay on the list.' },
    { title: 'My Orders', body: 'Track deliveries and status changes.' },
    { title: 'Favorites', body: 'Saved pieces you are not over yet.' },
    { title: 'Addresses', body: 'Delivery details for checkout.' },
    { title: 'Settings', body: 'Preferences, notifications, and sign out.' },
  ];

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading title="ACCOUNT" description="Everything you need, none of the clutter." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-[28px] border border-white/8 bg-white/3 p-6">
            <div className="font-display text-3xl uppercase">{t(card.title)}</div>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{t(card.body)}</p>
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
  discount_type: 'percentage' | 'fixed';
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
  const { t, localize, locale, dir } = useLocale();
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
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code ?? '');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCouponOpen, setIsCouponOpen] = useState(Boolean(appliedCoupon));
  const [activeFlashSale, setActiveFlashSale] = useState<ActiveFlashSaleView | null>(null);
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id ?? '');
  const [form, setForm] = useState<CheckoutFormState>({
    fullName: defaultAddress?.fullName ?? session.fullName,
    phone: defaultAddress?.phone ?? session.phone,
    country: defaultAddress?.country ?? '',
    city: defaultAddress?.city ?? '',
    area: defaultAddress?.area ?? '',
    street: defaultAddress?.street ?? '',
    building: defaultAddress?.building ?? '',
    notes: '',
    paymentMethod: 'cash_on_delivery',
  });
  const countryOptions = useMemo(
    () =>
      deliveryZones.reduce<Array<{ value: string; label: string }>>((acc, zone) => {
        if (acc.some((item) => item.value === zone.country)) {
          return acc;
        }

        acc.push({
          value: zone.country,
          label: localize(zone.country, zone.countryAr),
        });
        return acc;
      }, []),
    [deliveryZones, localize]
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
    [deliveryZones, form.country, localize]
  );
  const subtotal = lines.reduce((sum, line) => sum + line.variant.price * line.quantity, 0);
  const flashSaleDiscountAmount = useMemo(() => {
    if (!activeFlashSale) {
      return 0;
    }

    return calculateDiscountAmount(
      subtotal,
      activeFlashSale.discount_type,
      activeFlashSale.discount_value
    );
  }, [activeFlashSale, subtotal]);
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) {
      return 0;
    }

    const remainingSubtotal = Math.max(0, subtotal - flashSaleDiscountAmount);
    return Math.min(remainingSubtotal, calculateCouponDiscount(subtotal, appliedCoupon));
  }, [appliedCoupon, flashSaleDiscountAmount, subtotal]);
  const shippingAmount = lines.length
    ? (resolveDeliveryFee(deliveryZones, form.country, form.city) ?? 0)
    : 0;
  const hasConfiguredDelivery =
    !lines.length || resolveDeliveryFee(deliveryZones, form.country, form.city) !== null;
  const discountAmount = flashSaleDiscountAmount + couponDiscountAmount;
  const total = Math.max(0, subtotal - discountAmount + shippingAmount);
  const checkoutFields: Array<{ label: string; key: keyof CheckoutFormState }> = [
    { label: 'Full Name', key: 'fullName' },
    { label: 'Phone', key: 'phone' },
    { label: 'Area', key: 'area' },
    { label: 'Street', key: 'street' },
    { label: 'Building', key: 'building' },
  ];

  useEffect(() => {
    setCouponCode(appliedCoupon?.code ?? '');
  }, [appliedCoupon?.code]);

  useEffect(() => {
    if (!selectedAddressId) {
      return;
    }

    const selectedAddress = addresses.find((address) => address.id === selectedAddressId);

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
      street: selectedAddress.street ?? '',
      building: selectedAddress.building ?? '',
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
      city: cityOptions[0]?.value ?? '',
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
        const response = await fetch('/api/flash-sales/active');
        const payload = (await response.json()) as {
          data?: Array<{
            id: string;
            title: string;
            discount_type: 'percentage' | 'fixed';
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
        const response = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
            title: t('Coupon removed'),
            description: result.error
              ? localizeCouponError(result.error, t)
              : t('This coupon no longer applies to your order.'),
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
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        throw new Error(result.error ?? 'Failed to apply coupon');
      }

      setAppliedCoupon(result.data);
      pushToast({
        title: t('Coupon applied'),
        description: `${result.data.code} ${t('is active on this order.')}`,
      });
    } catch (error) {
      pushToast({
        title: t('Coupon failed'),
        description:
          error instanceof Error
            ? localizeCouponError(error.message, t)
            : t('Unable to apply that coupon right now.'),
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
        title: t('Missing details'),
        description: t('Please complete the delivery details before placing your order.'),
      });
      return;
    }

    if (!hasConfiguredDelivery) {
      pushToast({
        title: t('Delivery unavailable'),
        description: t('No delivery fee is configured for the selected location.'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          currency: 'JOD',
          couponCode: appliedCoupon?.code ?? null,
          notes: form.notes,
          items: lines.map((line) => {
            const selectionSummary = getCartSelectionSummary(line.selections, localize);

            return {
              productId: line.product.id,
              variantId: line.variant.id,
              productName: localize(line.product.name, line.product.nameAr),
              sku: line.variant.sku,
              sizeName: [localize(line.variant.size, line.variant.sizeAr), selectionSummary]
                .filter(Boolean)
                .join(' | '),
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
        throw new Error(result.error ?? 'Failed to place order');
      }

      clearCart();
      router.push(`/order-success/${result.data.order.id}`);
    } catch (error) {
      pushToast({
        title: t('Order failed'),
        description:
          error instanceof Error
            ? t(error.message)
            : t('Something went wrong while placing the order.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Container className="checkout-page py-6 md:py-12">
      <header className="checkout-entrance mb-8 border-b border-[var(--border)] pb-7 md:mb-10 md:pb-8">
        <div className="flex items-end justify-between gap-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
              PUFF JO / {t('CHECKOUT')}
            </div>
            <h1 className="mt-3 font-display text-4xl uppercase leading-none md:text-6xl">
              {t('Complete your order')}
            </h1>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              {t('Secure checkout · Fast delivery across Jordan')}
            </p>
          </div>
          <div className="hidden text-right text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] sm:block">
            {lines.length} {t('items')} <span className="mx-2">·</span>{' '}
            {new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-JO', {
              style: 'currency',
              currency: 'JOD',
              maximumFractionDigits: 2,
            }).format(total)}
          </div>
        </div>
        <div className="mt-8 flex max-w-2xl items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] md:gap-3">
          <span className="font-semibold text-[var(--text)]">01 {t('Cart')}</span>
          <span className="h-px flex-1 bg-[var(--border)]" />
          <span>02 {t('Delivery')}</span>
          <span className="h-px flex-1 bg-[var(--border)]" /> <span>03 {t('Confirm')}</span>
        </div>
      </header>
      <div className="checkout-layout mt-8 grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(390px,30vw)] lg:gap-16">
        <div className="checkout-form checkout-form-shell space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 md:p-8">
          <div className="checkout-section border-b border-[var(--border)] pb-7">
            <div className="checkout-section-kicker">01</div>
            <h2 className="mt-2 text-xl font-semibold uppercase tracking-[0.08em]">
              {t('CONTACT')}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {t('Who should we contact about this order?')}
            </p>
          </div>
          {!lines.length ? (
            <div className="rounded-[24px] border border-white/8 bg-black/10 p-5 text-sm text-[var(--text-secondary)]">
              {t('YOUR CART IS EMPTY.')}
            </div>
          ) : null}
          {addresses.length ? (
            <div className="space-y-3 border-b border-[var(--border)] pb-7">
              <div className="text-[10px] tracking-[0.22em] text-[var(--muted)] md:text-xs">
                {t('Saved addresses')}
              </div>
              <div className="grid gap-3">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => setSelectedAddressId(address.id)}
                    className={`rounded-[18px] border px-3 py-3 text-left transition md:rounded-[22px] md:px-4 md:py-4 ${
                      selectedAddressId === address.id
                        ? 'border-[var(--text)] bg-[color:color-mix(in_srgb,var(--card)_88%,var(--text)_12%)] text-[var(--text)]'
                        : 'border-white/10 bg-transparent text-[var(--text)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium uppercase tracking-[0.16em]">
                        {address.label}
                      </div>
                      {address.isDefault ? (
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${selectedAddressId === address.id ? 'bg-[var(--text)] text-[var(--background)]' : 'border border-white/10 text-[var(--muted)]'}`}
                        >
                          {t('Default')}
                        </span>
                      ) : null}
                    </div>
                    <div
                      className={`mt-2 text-sm ${selectedAddressId === address.id ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'}`}
                    >
                      {address.fullName} · {address.phone}
                    </div>
                    <div
                      className={`mt-1 text-sm ${selectedAddressId === address.id ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'}`}
                    >
                      {[address.country, address.city, address.area].filter(Boolean).join(', ')}
                    </div>
                    <div
                      className={`mt-1 text-sm ${selectedAddressId === address.id ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'}`}
                    >
                      {[address.street, address.building].filter(Boolean).join(', ')}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <Link
                  href="/addresses/new"
                  className="rounded-[0.25rem] border border-white/10 px-4 py-2 text-xs tracking-[0.2em]"
                >
                  {t('ADD ADDRESS')}
                </Link>
              </div>
            </div>
          ) : (
            <div className="border-b border-[var(--border)] pb-7 text-sm text-[var(--text-secondary)]">
              <div>{t('No saved addresses.')}</div>
              <Link
                href="/addresses/new"
                className="mt-4 inline-flex rounded-[0.25rem] border border-white/10 px-4 py-2 text-xs tracking-[0.2em] text-[var(--text)]"
              >
                {t('ADD ADDRESS')}
              </Link>
            </div>
          )}
          <div className="checkout-section border-b border-[var(--border)] pb-8">
            <div className="mb-5">
              <div className="checkout-section-kicker">02</div>
              <h2 className="mt-2 text-xl font-semibold uppercase tracking-[0.08em]">
                {t('DELIVERY ADDRESS')}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {t('Where should we deliver your order?')}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <select
                value={form.country}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    country: event.target.value,
                    city: '',
                  }))
                }
                className="checkout-input"
              >
                <option value="">{t('Select a country')}</option>
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
                className="checkout-input"
              >
                <option value="">{t('Select a city')}</option>
                {cityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {checkoutFields.map((field) => (
                <label key={field.key} className={field.key === 'street' ? 'md:col-span-2' : ''}>
                  <span className="checkout-label">{t(field.label)}</span>
                  <input
                    value={form[field.key]}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                    className="checkout-input"
                  />
                </label>
              ))}
            </div>
            {form.city && hasConfiguredDelivery ? (
              <div className="mt-4 text-xs text-[var(--success)]">
                ✓ {t('Delivery available')} · {t('Estimated fee')}: {formatCurrency(shippingAmount)}
              </div>
            ) : null}
          </div>
          <div className="checkout-section border-b border-[var(--border)] pb-8">
            <div className="mb-5">
              <div className="checkout-section-kicker">03</div>
              <h2 className="mt-2 text-xl font-semibold uppercase tracking-[0.08em]">
                {t('PAYMENT')}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {t('Choose how you would like to pay.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({ ...current, paymentMethod: 'cash_on_delivery' }))
              }
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${form.paymentMethod === 'cash_on_delivery' ? 'border-[var(--text)] bg-[var(--surface)]' : 'border-[var(--border)]'}`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${form.paymentMethod === 'cash_on_delivery' ? 'border-[var(--text)]' : 'border-[var(--muted)]'}`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full bg-[var(--text)] ${form.paymentMethod === 'cash_on_delivery' ? '' : 'scale-0'}`}
                  />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{t('Cash on Delivery')}</span>
                  <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                    {t('Pay when your order arrives')}
                  </span>
                </span>
              </span>
              <span className="text-sm">
                {form.paymentMethod === 'cash_on_delivery' ? '✓' : ''}
              </span>
            </button>
          </div>
          <div>
            <label
              htmlFor="checkout-notes"
              className="mb-2 block text-xs tracking-[0.16em] text-[var(--muted)]"
            >
              {t('Delivery instructions (optional)')}
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
              placeholder={t('Add delivery instructions or a note for your order')}
              rows={3}
              className="w-full resize-y rounded-[0.25rem] border border-white/10 bg-black/20 px-5 py-3 text-sm outline-none"
            />
          </div>
        </div>
        <aside className="checkout-summary h-fit rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 md:p-7 lg:sticky lg:top-[120px]">
          <div className="mb-4 text-[10px] tracking-[0.22em] text-[var(--muted)] md:text-xs">
            {t('ORDER SUMMARY')}
          </div>
          <div className="mb-5 space-y-3">
            {lines.map((line) => (
              <div
                key={line.lineId}
                className="checkout-product rounded-xl border border-[var(--border)] bg-[var(--background-secondary)]/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={line.product.images[0]?.url || '/products/puff-jo-product-default.png'}
                    alt={localize(line.product.name, line.product.nameAr)}
                    className="h-[76px] w-[68px] rounded-xl bg-[var(--background-secondary)] object-contain p-1.5"
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
                        onClick={() => updateQuantity(line.lineId, Math.max(1, line.quantity - 1))}
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
                          line.quantity >= Math.max(1, line.variant.stockQuantity)
                        }
                        onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                        className="text-[var(--text-secondary)] transition hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Increase quantity for ${localize(line.product.name, line.product.nameAr)}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                      {line.variant.allowBackorder
                        ? t('Backorder available')
                        : `${t('Max')}: ${Math.max(1, line.variant.stockQuantity)}`}
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
                      {t('REMOVE')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <SummaryRow label={t('Subtotal')} value={formatCurrency(subtotal)} />
          {flashSaleDiscountAmount > 0 ? (
            <SummaryRow
              label={
                activeFlashSale ? `${t('Flash sale')} (${activeFlashSale.title})` : t('Flash sale')
              }
              value={`-${formatCurrency(flashSaleDiscountAmount)}`}
            />
          ) : null}
          {couponDiscountAmount > 0 ? (
            <SummaryRow
              label={appliedCoupon ? `${t('Coupon')} (${appliedCoupon.code})` : t('Coupon')}
              value={`-${formatCurrency(couponDiscountAmount)}`}
            />
          ) : null}
          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <button
              type="button"
              onClick={() => setIsCouponOpen((open) => !open)}
              className="text-sm text-[var(--text-secondary)]"
            >
              {isCouponOpen ? '−' : '+'} {t('Have a discount code?')}
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${isCouponOpen ? 'mt-3 max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="grid gap-3">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder={t('Enter discount code')}
                  className="checkout-input"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={clearAppliedCoupon}
                    className="rounded-full border border-white/10 px-4 py-2.5 text-sm tracking-[0.2em] md:px-5 md:py-3"
                  >
                    {t('REMOVE COUPON')}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!lines.length || isApplyingCoupon}
                    onClick={applyCoupon}
                    className="rounded-full border border-white/10 px-4 py-2.5 text-sm tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-40 md:px-5 md:py-3"
                  >
                    {isApplyingCoupon ? t('APPLYING') : t('Apply')}
                  </button>
                )}
                {appliedCoupon?.description ? (
                  <div className="text-xs text-[var(--text-secondary)]">
                    {appliedCoupon.description}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <SummaryRow
            label={t('Delivery')}
            value={
              hasConfiguredDelivery
                ? formatCurrency(shippingAmount)
                : t('Calculated after selecting your city')
            }
          />
          <SummaryRow label={t('Total')} value={formatCurrency(total)} emphasis />
          {!hasConfiguredDelivery && lines.length ? (
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              {t('No delivery fee is configured for the selected location.')}
            </p>
          ) : null}
          <button
            type="button"
            disabled={!lines.length || isSubmitting || !hasConfiguredDelivery}
            onClick={placeOrder}
            className="checkout-order-button mt-7 w-full rounded-xl bg-[var(--text)] px-5 py-4 text-sm font-semibold tracking-[0.16em] text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="checkout-spinner" />
                {t('PLACING ORDER')}...
              </span>
            ) : (
              <span className="inline-flex items-center gap-3">
                {t('PLACE ORDER')}{' '}
                {dir === 'rtl' ? (
                  <ArrowLeft className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </span>
            )}
          </button>
          <p className="mt-4 text-center text-xs leading-6 text-[var(--text-secondary)]">
            🔒 {t('Secure checkout')}
            <br />
            {t('Your order is only created after confirmation.')}
          </p>
        </aside>
      </div>
    </Container>
  );
}

export function AuthPageView({ mode }: { mode: 'login' | 'register' | 'forgot-password' }) {
  const { t } = useLocale();
  const schema = z.object({
    email: z.string().email(),
    password: mode === 'forgot-password' ? z.string().optional() : z.string().min(6),
    fullName: mode === 'register' ? z.string().min(2) : z.string().optional(),
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
        <div className="text-xs tracking-[0.25em] text-[var(--muted)]">{t('SUPABASE AUTH')}</div>
        <h1 className="mt-3 font-display text-5xl uppercase">
          {mode === 'login'
            ? t('LOG IN')
            : mode === 'register'
              ? t('JOIN THE PUFF CLUB')
              : t('RESET PASSWORD')}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          {mode === 'login'
            ? 'Sign in to keep your bag, favorites, and orders in sync.'
            : mode === 'register'
              ? 'Create your account before the next drop disappears.'
              : 'We will send a reset link if your Supabase project is configured.'}
        </p>
        <form
          onSubmit={handleSubmit(async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setSubmitted(true);
          })}
          className="mt-8 space-y-4"
        >
          {mode === 'register' ? (
            <Field label={t('Full Name')} error={errors.fullName?.message}>
              <input
                {...register('fullName')}
                className="h-12 w-full rounded-full border border-white/10 bg-black/20 px-5 text-sm outline-none"
              />
            </Field>
          ) : null}
          <Field label={t('Email')} error={errors.email?.message}>
            <input
              {...register('email')}
              className="h-12 w-full rounded-full border border-white/10 bg-black/20 px-5 text-sm outline-none"
            />
          </Field>
          {mode !== 'forgot-password' ? (
            <Field label={t('Password')} error={errors.password?.message}>
              <input
                type="password"
                {...register('password')}
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
              ? t('PLEASE WAIT')
              : mode === 'login'
                ? t('LOG IN')
                : mode === 'register'
                  ? t('Register')
                  : t('Send code')}
          </button>
          {submitted ? (
            <p className="text-sm text-[var(--blush)]">
              {t('Form captured. Wire this to your Supabase auth environment keys before launch.')}
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
          title={t('ORDER RECEIVED.')}
          description={`${t('Order number')} #${orderId}`}
        />
        <div className="space-y-4 text-sm leading-7 text-[var(--text-secondary)]">
          <p>{t('Your order has been placed successfully.')}</p>
          <p>{t('You can review delivery updates and order details from your account page.')}</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/account"
            className="rounded-full border border-white/10 px-5 py-3 text-center text-sm tracking-[0.2em]"
          >
            {t('TRACK ORDER')}
          </Link>
          <Link
            href="/shop"
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-center text-sm tracking-[0.2em]"
            style={{ color: 'var(--background)' }}
          >
            {t('CONTINUE SHOPPING')}
          </Link>
        </div>
      </div>
    </Container>
  );
}

function CatalogHero({ title, description }: { title: string; description: string }) {
  const { t } = useLocale();
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,.08),transparent_25%),var(--background)] py-12 md:py-20">
      <Container className="relative">
        <div className="text-[11px] font-bold tracking-[0.3em] text-[var(--accent)]">
          {t('PUFF JO / STORE')}
        </div>
        <h1 className="mt-4 max-w-3xl text-4xl font-black uppercase leading-none tracking-[-0.04em] md:text-7xl">
          {t(title)}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
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
      className={`flex items-center justify-between ${emphasis ? 'text-lg text-[var(--text)]' : 'text-sm text-[var(--text-secondary)]'}`}
    >
      <span>{label}</span>
      <span className={emphasis ? 'text-[var(--text)]' : ''}>{value}</span>
    </div>
  );
}

function localizeCouponError(message: string, t: (value: string) => string) {
  const prefix = 'This coupon requires a minimum subtotal of ';

  if (message.startsWith(prefix) && message.endsWith(' JOD.')) {
    const amount = message.slice(prefix.length, -' JOD.'.length);
    return `${t('This coupon requires a minimum subtotal of')} ${amount} ${t('JOD.')}`;
  }

  return t(message);
}

function sameAppliedCoupon(
  left: {
    code: string;
    name: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minSubtotal?: number;
  },
  right: {
    code: string;
    name: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minSubtotal?: number;
  }
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

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs tracking-[0.24em] text-[var(--muted)]">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs text-[var(--blush)]">{error}</span> : null}
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
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="border-b border-[var(--border)] pb-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text)]"
      >
        <span>{t(title)}</span>
        <ArrowIcon
          className={`h-4 w-4 transition ${open ? (dir === 'rtl' ? '-rotate-90' : 'rotate-90') : ''}`}
        />
      </button>
      {open ? (
        <div className="pt-2 text-sm leading-7 text-[var(--text-secondary)]">{children}</div>
      ) : null}
    </div>
  );
}
