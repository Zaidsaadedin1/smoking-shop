'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Grid,
  Group,
  Image,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { MotionBox } from '@/components/storefront/ui/motion-box';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Heart,
  Minus,
  PackageOpen,
  Plus,
  SlidersHorizontal,
  Star,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLocale } from '@/components/storefront/locale-provider';
import {
  CheckoutDetailsPanel,
  CheckoutFormState,
} from '@/components/storefront/ui/checkout-details-panel';
import { StoreTextInput } from '@/components/storefront/ui/store-form-controls';
import { CartLineCard } from '@/components/storefront/ui/cart-line-card';
import { StorePageContainer } from '@/components/storefront/ui/store-layout';
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
    <Box component="div" className="pb-12 md:pb-16">
      {/* Flash sale */}
      {flashSale ? (
        <Box className="mb-4">
          <CatalogFlashSaleBanner flashSale={flashSale} />
        </Box>
      ) : null}

      {/* Hero */}
      <Box className="mb-4 md:mb-5">
        <CatalogHero title={title} description={description} />
      </Box>

      {/* Categories */}
      <Box className="mb-5">
        <CategoryFilterBar
          categories={rootCategories}
          subcategories={subcategories}
          selectedCategory={category}
          productCount={productCount}
          dir={dir}
          selectedLabel={
            category === 'all'
              ? t('ALL')
              : localize(selectedCategory?.name, selectedCategory?.nameAr)
          }
          resultCount={filtered.length}
          onSelect={setCategory}
          allLabel={t('ALL')}
          localize={localize}
          t={t}
        />
      </Box>

      <Container>
        {/* Toolbar */}
        <Paper withBorder radius="md" px={{ base: 'sm', sm: 'md' }} py="sm" mb="md">
          <Group justify="space-between" align="center" gap="sm" wrap="wrap">
            <Text size="sm" c="dimmed">
              {filtered.length} {t(filtered.length === 1 ? 'product' : 'products')}
            </Text>

            <Group gap="xs" wrap="nowrap">
              <Button
                variant="default"
                size="xs"
                radius="sm"
                leftSection={<SlidersHorizontal size={14} />}
              >
                {t('Filters')}
              </Button>

              <Select
                value={sort}
                onChange={(value) => {
                  if (value) {
                    setSort(value as typeof sort);
                  }
                }}
                data={[
                  {
                    value: 'newest',
                    label: t('Newest'),
                  },
                  {
                    value: 'price-asc',
                    label: t('Price Low to High'),
                  },
                  {
                    value: 'price-desc',
                    label: t('Price High to Low'),
                  },
                  {
                    value: 'featured',
                    label: t('Featured'),
                  },
                ]}
                size="xs"
                radius="sm"
                w={{ base: 155, sm: 190 }}
                allowDeselect={false}
              />
            </Group>
          </Group>
        </Paper>

        {/* Products */}
        {filtered.length ? (
          <ProductGrid products={filtered} />
        ) : (
          <ShopEmptyState onClearFilters={() => setCategory('all')} />
        )}

        {/* Newsletter */}
        <Box mt={{ base: 32, md: 40 }}>
          <NewsletterSection />
        </Box>
      </Container>
    </Box>
  );
}
function ShopEmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  const { t, dir } = useLocale();

  return (
    <Box
      component="section"
      className="relative isolate overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-12 shadow-sm md:px-8 md:py-16"
    >
      <Box
        component="div"
        className="pointer-events-none absolute -right-10 -top-16 -z-10 text-[15rem] font-black leading-none tracking-[-.16em] text-[var(--text)]/[.035]"
      >
        00
      </Box>
      <Box component="div" className="mx-auto max-w-2xl text-center">
        <Box
          component="div"
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] text-[var(--accent)]"
        >
          <PackageOpen className="h-6 w-6" />
        </Box>
        <Box
          component="div"
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent)]"
        >
          {t('PUFF JO / CATALOG')}
        </Box>
        <Box
          component="h2"
          className="mt-4 text-3xl font-black uppercase leading-none tracking-[-.04em] md:text-4xl"
        >
          {t('NO PRODUCTS MATCH')}
        </Box>
        <Box
          component="p"
          className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--text-secondary)]"
        >
          {t('Try another category or clear your filters to see the full collection.')}
        </Box>
        <Box
          component="button"
          type="button"
          onClick={onClearFilters}
          className="!text-white mt-7 inline-flex min-h-11 items-center gap-3 rounded-full bg-[var(--accent)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition hover:gap-4"
        >
          {t('VIEW ALL PRODUCTS')}
          {dir === 'rtl' ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </Box>
      </Box>
    </Box>
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
      <MotionBox
        component="section"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(145deg,var(--card),var(--background-secondary))] p-5 shadow-sm md:p-8"
      >
        <Box
          component="div"
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-[var(--border)] opacity-60"
        />
        <Box component="div" className="relative max-w-2xl">
          <Box
            component="div"
            className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]"
          >
            {t('PUFF JO / BRANDS')}
          </Box>
          <Box
            component="h1"
            className="mt-4 text-4xl font-black uppercase leading-none tracking-[-0.05em] text-[var(--text)] md:text-4xl"
          >
            {t('BRANDS')}
          </Box>
          <Box
            component="p"
            className="mt-5 max-w-xl text-base leading-8 text-[var(--text-secondary)]"
          >
            {t('Shop trusted vape brands, devices, flavors, and accessories from one place.')}
          </Box>
        </Box>
      </MotionBox>

      {brandCards.length ? (
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {brandCards.map((brand) => (
            <MotionBox
              key={brand.id}
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4 }}
            >
              <Link
                href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                className="group relative block aspect-[1.08] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                {brand.image ? (
                  <Image
                    src={brand.image}
                    alt={localize(brand.name, brand.nameAr)}
                    className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                  />
                ) : null}
                <Box
                  component="div"
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
                />
                <Box
                  component="div"
                  className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white"
                >
                  <Box component="div">
                    <Box
                      component="div"
                      className="text-xl font-black uppercase tracking-[-0.02em]"
                    >
                      {localize(brand.name, brand.nameAr)}
                    </Box>
                    <Box
                      component="div"
                      className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65"
                    >
                      {t('View products')}
                    </Box>
                  </Box>
                  <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-1" />
                </Box>
              </Link>
            </MotionBox>
          ))}
        </MotionBox>
      ) : (
        <Box
          component="div"
          className="mt-6 rounded-[26px] border border-[var(--border)] bg-[var(--card)] p-10 text-center text-[var(--text-secondary)]"
        >
          {t('No brands available yet.')}
        </Box>
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
    <Box
      component="section"
      className="border-y border-[var(--border)] bg-[var(--background-secondary)]/80 backdrop-blur-xl"
      dir={dir}
    >
      <Container className="py-4 md:py-5">
        <Box component="div" className="relative">
          <Box
            component="div"
            className="scrollbar-hidden flex gap-2.5 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible"
          >
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
          </Box>
        </Box>
        <Box
          component="div"
          className={`grid transition-all duration-300 ease-out ${hasSubcategories ? 'mt-3 max-h-20 translate-y-0 opacity-100' : 'max-h-0 -translate-y-1 overflow-hidden opacity-0'}`}
        >
          <Box
            component="div"
            className="scrollbar-hidden flex gap-2 overflow-x-auto border-t border-[var(--border)] pt-3 md:flex-wrap md:overflow-visible"
          >
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
          </Box>
        </Box>
        <Box
          component="div"
          className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
        >
          {selectedLabel} · {resultCount} {t(resultCount === 1 ? 'product' : 'products')}
        </Box>
      </Container>
    </Box>
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
    <Box
      component="button"
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap border px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.13em] transition duration-300 ${secondary ? 'rounded-full border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--card)]' : 'rounded-full'} ${active ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_8px_22px_rgba(0,0,0,.14)]' : 'border-[var(--border)] bg-[var(--card)]/40 text-[var(--text-secondary)] hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--text)]'}`}
    >
      <Box component="span">{label}</Box>
      {count !== null ? (
        <Box
          component="span"
          className={`text-[9px] ${active ? 'opacity-60' : 'text-[var(--muted)]'}`}
        >
          {count}
        </Box>
      ) : null}
    </Box>
  );
}

function CatalogFlashSaleBanner({ flashSale }: { flashSale: FlashSale }) {
  const { dir, t } = useLocale();

  return (
    <Box
      component="section"
      className="border-y border-white/10 bg-[linear-gradient(135deg,#222525,#090a0a)] px-4 py-5 md:px-8"
    >
      <Container className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Box component="div">
          <Box component="div" className="text-[10px] uppercase tracking-[0.28em] text-white/60">
            {t(flashSale.title)}
          </Box>
          <Box
            component="div"
            className="mt-2 font-display text-4xl uppercase leading-none text-white md:text-4xl"
          >
            {t(flashSale.discountLabel)}
          </Box>
          {flashSale.description ? (
            <Box
              component="div"
              className="mt-2 text-[11px] uppercase tracking-[0.16em] text-white/74"
            >
              {t(flashSale.description)}
            </Box>
          ) : null}
        </Box>

        <Link
          href={flashSale.ctaUrl || '/shop?sale=true'}
          className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-black md:self-center"
        >
          <Box component="span" className="text-black">
            {flashSale.ctaText ? t(flashSale.ctaText) : t('Shop sale')}
          </Box>
          {dir === 'rtl' ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </Link>
      </Container>
    </Box>
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
  const { t, localize } = useLocale();
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
    <Box
      component="div"
      className="bg-[var(--background)] pb-24 pt-4 text-[var(--text)] md:pb-16 md:pt-6"
    >
      <Container>
        {/* BREADCRUMB */}
        <Box component="div" className="mb-5 flex items-center justify-between gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('BACK TO SHOP')}
          </Link>

          <Text size="xs" c="dimmed">
            {localize(product.categorySlug, product.categorySlug)}
          </Text>
        </Box>

        {/* MAIN PRODUCT */}
        <Box
          component="div"
          className="grid gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,.95fr)] lg:items-start xl:gap-10"
        >
          {/* ============================
            LEFT - GALLERY
        ============================= */}
          <Box component="div" className="grid min-w-0 gap-3 lg:grid-cols-[76px_minmax(0,1fr)]">
            {/* THUMBNAILS */}
            <Box
              component="div"
              className="order-2 flex gap-2 overflow-x-auto pb-1 lg:order-1 lg:flex-col lg:overflow-visible"
            >
              {galleryImages.map((image, index) => {
                const isActive = index === selectedImageIndex;

                return (
                  <Box
                    component="button"
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border bg-[var(--card)] p-1 transition ${
                      isActive
                        ? 'border-[var(--accent)]'
                        : 'border-[var(--border)] hover:border-[var(--text-secondary)]'
                    }`}
                  >
                    <Image
                      src={image.url || undefined}
                      alt={image.alt}
                      className="h-full w-full object-contain"
                    />
                  </Box>
                );
              })}
            </Box>

            {/* MAIN IMAGE */}
            <Box
              component="div"
              className="order-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] lg:order-2"
            >
              <Box
                component="div"
                className="relative flex min-h-[360px] w-full items-center justify-center bg-[var(--background-secondary)] p-4 sm:min-h-[460px] lg:min-h-[520px]"
              >
                {galleryImages[selectedImageIndex]?.url ? (
                  <Image
                    src={galleryImages[selectedImageIndex].url}
                    alt={galleryImages[selectedImageIndex].alt}
                    fit="contain"
                    className="max-h-[520px] w-full object-contain"
                  />
                ) : null}

                {discount > 0 ? (
                  <Box
                    component="div"
                    className="absolute left-3 top-3 rounded-md bg-[var(--accent)] px-2.5 py-1 text-xs font-semibold text-white"
                  >
                    -{discount}%
                  </Box>
                ) : null}
              </Box>
            </Box>
          </Box>

          {/* ============================
            RIGHT - PRODUCT DETAILS
        ============================= */}
          <Box component="div" className="min-w-0 lg:sticky lg:top-24">
            <Box
              component="div"
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5"
            >
              {/* BRAND + FAVORITE */}
              <Box component="div" className="flex items-start justify-between gap-4">
                <Box>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                    {localize(product.brand, product.brandAr)}
                  </Text>

                  <Box
                    component="h1"
                    className="mt-2 text-2xl font-bold leading-tight tracking-[-0.02em] md:text-[28px]"
                  >
                    {localize(product.name, product.nameAr)}
                  </Box>
                </Box>

                <Box
                  component="button"
                  type="button"
                  onClick={handleFavoriteToggle}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
                    isFavorite
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                      : 'border-[var(--border)] bg-[var(--background)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Box>
              </Box>

              {/* SHORT DESCRIPTION */}
              {product.shortDescription ? (
                <Text mt={10} size="sm" c="dimmed" lh={1.6}>
                  {localize(product.shortDescription, product.shortDescriptionAr)}
                </Text>
              ) : null}

              {/* RATING */}
              <Group mt="sm" gap="md">
                <Rating rating={product.rating} reviewCount={product.reviewCount} />

                <Text size="xs" c={selectedVariant.stockQuantity <= 2 ? 'red' : 'dimmed'}>
                  {selectedVariant.stockQuantity > 0
                    ? selectedVariant.stockQuantity <= 2
                      ? `${t('ONLY')} ${selectedVariant.stockQuantity} ${t('LEFT')}`
                      : t('IN STOCK')
                    : selectedVariant.allowBackorder
                      ? t('AVAILABLE')
                      : t('SOLD OUT')}
                </Text>
              </Group>

              {/* PRICE */}
              <Group mt="md" gap="sm" align="center" wrap="wrap">
                <Text size="xl" fw={700} c="var(--accent)">
                  {formatCurrency(displayPrice)}
                </Text>

                {selectedVariant.compareAtPrice ? (
                  <Text size="sm" c="dimmed" td="line-through">
                    {formatCurrency(selectedVariant.compareAtPrice)}
                  </Text>
                ) : null}

                {discount > 0 ? (
                  <Box
                    component="span"
                    className="rounded-md bg-[var(--background-secondary)] px-2 py-1 text-xs font-semibold"
                  >
                    {discount}% {t('OFF')}
                  </Box>
                ) : null}
              </Group>

              {/* DIVIDER */}
              <Box component="div" className="my-5 border-t border-[var(--border)]" />

              {/* SIZE */}
              {sizes.length > 1 ? (
                <Box component="div">
                  <Text size="sm" fw={600} mb={8}>
                    {t('SIZE')}
                  </Text>

                  <Box component="div" className="flex flex-wrap gap-2">
                    {sizes.map((sizeOption) => {
                      const available = product.variants.some(
                        (variant) =>
                          variant.size === sizeOption.name &&
                          (variant.stockQuantity > 0 || variant.allowBackorder)
                      );

                      const active = selectedSize === sizeOption.name;

                      return (
                        <Box
                          component="button"
                          key={sizeOption.name}
                          type="button"
                          disabled={!available}
                          onClick={() => setSelectedSize(sizeOption.name)}
                          className={`min-w-[52px] rounded-md border px-3 py-2 text-sm font-medium transition ${
                            active
                              ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                              : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]'
                          } disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          {localize(sizeOption.name, sizeOption.nameAr)}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ) : null}

              {/* OPTIONS */}
              {optionGroups.length ? (
                <Box component="div" className="mt-5 space-y-5">
                  {optionGroups.map((group) => (
                    <Box component="div" key={group.id}>
                      <Box component="div" className="mb-2 flex items-center justify-between gap-2">
                        <Box>
                          <Text size="sm" fw={600}>
                            {localize(group.name, group.nameAr)}
                          </Text>

                          {group.description || group.descriptionAr ? (
                            <Text size="xs" c="dimmed" mt={2}>
                              {localize(group.description ?? '', group.descriptionAr)}
                            </Text>
                          ) : null}
                        </Box>

                        <Text size="xs" c="dimmed">
                          {group.selectionType === 'radio' ? t('Choose one') : t('Add-ons')}
                        </Text>
                      </Box>

                      <Box component="div" className="grid gap-2">
                        {group.items.map((item) => {
                          const selected = (selectedOptions[group.id] ?? []).includes(item.id);

                          const available =
                            !item.trackInventory || item.stockQuantity > 0 || item.allowBackorder;

                          return (
                            <Box
                              component="label"
                              key={item.id}
                              className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition ${
                                selected
                                  ? 'border-[var(--accent)] bg-[color:color-mix(in_srgb,var(--accent)_7%,var(--background))]'
                                  : 'border-[var(--border)]'
                              } ${available ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
                            >
                              <Box component="span" className="flex min-w-0 items-center gap-3">
                                <Box
                                  component="input"
                                  type={group.selectionType === 'radio' ? 'radio' : 'checkbox'}
                                  name={`option-${group.id}`}
                                  checked={selected}
                                  disabled={!available}
                                  onChange={() =>
                                    handleOptionChange(group.id, item.id, group.selectionType)
                                  }
                                  className="h-4 w-4 accent-black"
                                />

                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={localize(item.name, item.nameAr)}
                                    className="h-10 w-10 rounded-md bg-[var(--background-secondary)] object-contain p-1"
                                  />
                                ) : null}

                                <Box component="span" className="min-w-0">
                                  <Text size="sm" fw={500} lineClamp={1}>
                                    {localize(item.name, item.nameAr)}
                                  </Text>

                                  {item.trackInventory ? (
                                    <Text size="xs" c="dimmed">
                                      {available
                                        ? `${t('Stock')}: ${item.stockQuantity}`
                                        : t('SOLD OUT')}
                                    </Text>
                                  ) : null}
                                </Box>
                              </Box>

                              {item.priceDelta > 0 ? (
                                <Text size="xs" fw={600} c="var(--accent)" className="shrink-0">
                                  +{formatCurrency(item.priceDelta)}
                                </Text>
                              ) : null}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : null}

              {/* QUANTITY */}
              <Box component="div" className="mt-5">
                <Text size="sm" fw={600} mb={8}>
                  {t('Quantity')}
                </Text>

                <Box
                  component="div"
                  className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--background)]"
                >
                  <Box
                    component="button"
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="flex h-9 w-9 items-center justify-center"
                  >
                    <Minus className="h-4 w-4" />
                  </Box>

                  <Box component="span" className="min-w-10 text-center text-sm font-semibold">
                    {quantity}
                  </Box>

                  <Box
                    component="button"
                    type="button"
                    disabled={quantity >= maxQuantity}
                    onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
                    className="flex h-9 w-9 items-center justify-center disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </Box>
                </Box>
              </Box>

              {/* CART BUTTONS */}
              <Box component="div" className="mt-5 grid gap-2 sm:grid-cols-2">
                <Box
                  component="button"
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
                      description: `${localize(product.name, product.nameAr)} • ${localize(
                        selectedVariant.size,
                        selectedVariant.sizeAr
                      )}`,
                    });
                  }}
                  className="h-11 rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t('AddToCartButton')}
                </Box>

                <Link
                  href="/checkout"
                  onClick={(event) => {
                    event.preventDefault();
                    handleBuyNow();
                  }}
                  className="flex h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {t('ORDER NOW')}
                </Link>
              </Box>

              {/* DETAILS */}
              <Box component="div" className="mt-5 border-t border-[var(--border)] pt-2">
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
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ============================
          REVIEWS
      ============================= */}
        <Box
          component="section"
          className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5"
        >
          <Box component="div" className="mb-5 flex items-center justify-between">
            <Box>
              <Text size="lg" fw={700}>
                {t('ITEM REVIEWS')}
              </Text>

              <Text size="xs" c="dimmed">
                {product.reviewCount} {t('reviews')}
              </Text>
            </Box>

            <Rating rating={product.rating} reviewCount={product.reviewCount} />
          </Box>

          {customer ? (
            <Box
              component="div"
              className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <Text size="sm" fw={600}>
                {t('Write a review')}
              </Text>

              <Box component="div" className="mt-3 flex flex-wrap gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Box
                    component="button"
                    key={value}
                    type="button"
                    onClick={() => setReviewRating(value)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md border ${
                      reviewRating >= value
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                        : 'border-[var(--border)]'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${reviewRating >= value ? 'fill-current' : ''}`} />
                  </Box>
                ))}
              </Box>

              <Box
                component="input"
                value={reviewTitle}
                onChange={(event) => setReviewTitle(event.target.value)}
                placeholder={t('Review title')}
                className="mt-3 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background-secondary)] px-3 text-sm outline-none"
              />

              <Box
                component="textarea"
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder={t('Write your review')}
                rows={3}
                className="mt-2 w-full resize-none rounded-md border border-[var(--border)] bg-[var(--background-secondary)] px-3 py-2 text-sm outline-none"
              />

              <Box
                component="button"
                type="button"
                onClick={handleReviewSubmit}
                disabled={isSubmittingReview}
                className="mt-3 h-9 rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-white disabled:opacity-40"
              >
                {isSubmittingReview ? t('PLEASE WAIT') : t('SUBMIT REVIEW')}
              </Box>
            </Box>
          ) : (
            <Box
              component="div"
              className="mb-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <Text size="sm" c="dimmed">
                {t('Sign in to review products.')}
              </Text>

              <Link
                href="/login"
                className="mt-3 inline-flex rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium"
              >
                {t('LOG IN')}
              </Link>
            </Box>
          )}

          <Box component="div" className="grid gap-3 md:grid-cols-2">
            {reviews.length ? (
              reviews.map((review) => (
                <Box
                  component="article"
                  key={review.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <Box component="div" className="flex items-start justify-between gap-3">
                    <Box>
                      <Text size="sm" fw={600}>
                        {review.authorName}
                      </Text>

                      <Text size="xs" c="dimmed" mt={2}>
                        {review.createdAt}
                      </Text>
                    </Box>

                    <Box component="div" className="flex gap-0.5">
                      {Array.from({
                        length: review.rating,
                      }).map((_, index) => (
                        <Star key={`${review.id}-${index}`} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </Box>
                  </Box>

                  {review.title ? (
                    <Text mt="sm" size="sm" fw={600}>
                      {review.title}
                    </Text>
                  ) : null}

                  <Text mt={4} size="sm" c="dimmed" lh={1.6}>
                    {review.comment}
                  </Text>
                </Box>
              ))
            ) : (
              <Text size="sm" c="dimmed">
                {t('No reviews yet.')}
              </Text>
            )}
          </Box>
        </Box>
      </Container>

      {/* RELATED PRODUCTS */}
      <Container className="mt-10">
        <SectionHeading title="You may also want" />
        <ProductGrid products={relatedProducts} />
      </Container>

      {/* MOBILE BUY BAR */}
      <Box
        component="div"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--card)] px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 shadow-[0_-5px_20px_rgba(0,0,0,.08)] md:hidden"
      >
        <Box component="div" className="mx-auto flex items-center gap-3">
          <Box className="min-w-0 flex-1">
            <Text size="xs" c="dimmed">
              {t('PRICE')}
            </Text>

            <Text size="md" fw={700}>
              {formatCurrency(displayPrice)}
            </Text>
          </Box>

          <Box
            component="button"
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
            className="h-10 rounded-md bg-[var(--accent)] px-5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {t('AddToCartButton')}
          </Box>
        </Box>
      </Box>
    </Box>
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
    <Box component="div" className={compact ? 'mt-2 space-y-1.5' : 'mt-3 space-y-2'}>
      {selections.map((selection) => (
        <Box
          component="div"
          key={selection.groupId}
          className={
            compact
              ? 'rounded-[14px] border border-white/8 bg-white/4 px-3 py-2'
              : 'rounded-[16px] border border-white/8 bg-black/10 px-4 py-3'
          }
        >
          <Box
            component="div"
            className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
          >
            {localize(selection.groupName, selection.groupNameAr)}
          </Box>
          <Box component="div" className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
            {selection.items
              .map((item) => {
                const label = localize(item.name, item.nameAr);
                return item.priceDelta > 0 ? `${label} +${formatCurrency(item.priceDelta)}` : label;
              })
              .join(', ')}
          </Box>
        </Box>
      ))}
    </Box>
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
  const { t } = useLocale();
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
    <StorePageContainer py={{ base: 20, sm: 32, md: 40 }}>
      {/* Header */}
      <Box mb={{ base: 24, md: 32 }}>
        <Group justify="space-between" align="flex-end" gap="md" wrap="wrap">
          <Box>
            <Title
              order={1}
              fz={{ base: 28, sm: 32 }}
              fw={700}
              style={{
                lineHeight: 1.15,
              }}
            >
              {t('Shopping Cart')}
            </Title>

            <Text mt={6} size="sm" c="dimmed">
              {lines.length
                ? `${lines.length} ${t(lines.length === 1 ? 'item' : 'items')}`
                : t('Your cart is empty')}
            </Text>
          </Box>

          {lines.length ? (
            <Button
              component={Link}
              href="/shop"
              variant="subtle"
              color="gray"
              size="sm"
              radius="md"
            >
              {t('Continue shopping')}
            </Button>
          ) : null}
        </Group>
      </Box>

      {lines.length ? (
        <Grid align="flex-start">
          {/* Cart products */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="sm">
              {lines.map((line) => (
                <CartLineCard
                  key={line.lineId}
                  line={line}
                  onQuantityChange={(quantity) => updateQuantity(line.lineId, quantity)}
                  onRemove={() => removeItem(line.lineId)}
                />
              ))}
            </Stack>
          </Grid.Col>

          {/* Order summary */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Paper
              radius="md"
              p={{ base: 'md', sm: 'lg' }}
              withBorder
              style={{
                position: 'sticky',
                top: 88,
              }}
            >
              <Title order={2} fz={18} fw={700} mb="lg">
                {t('Order Summary')}
              </Title>

              <Stack gap="md">
                <Stack gap="sm">
                  <SummaryRow label={t('Subtotal')} value={formatCurrency(subtotal)} />

                  {couponDiscountAmount > 0 ? (
                    <SummaryRow
                      label={
                        appliedCoupon ? `${t('Discount')} (${appliedCoupon.code})` : t('Discount')
                      }
                      value={`-${formatCurrency(couponDiscountAmount)}`}
                    />
                  ) : null}

                  <SummaryRow label={t('Shipping')} value={t('Calculated at checkout')} />
                </Stack>

                <Box
                  style={{
                    height: 1,
                    background: 'var(--mantine-color-default-border)',
                  }}
                />

                <SummaryRow label={t('Total')} value={formatCurrency(total)} emphasis />

                {/* Coupon */}
                <Box mt={4}>
                  <Text size="sm" fw={600} mb={8}>
                    {t('Promo code')}
                  </Text>

                  <Group gap="xs" align="stretch" wrap="nowrap">
                    <Box style={{ flex: 1 }}>
                      <StoreTextInput
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value)}
                        placeholder={t('Enter promo code')}
                        aria-label={t('Enter promo code')}
                        disabled={Boolean(appliedCoupon)}
                      />
                    </Box>

                    <Button
                      variant="default"
                      radius="md"
                      loading={isApplyingCoupon}
                      disabled={!lines.length || (!couponCode.trim() && !appliedCoupon)}
                      onClick={appliedCoupon ? clearAppliedCoupon : applyCoupon}
                      px="md"
                    >
                      {appliedCoupon ? t('Remove') : t('Apply')}
                    </Button>
                  </Group>

                  {appliedCoupon ? (
                    <Paper mt="xs" p="sm" radius="sm" bg="var(--mantine-color-green-light)">
                      <Group justify="space-between" gap="xs">
                        <Box>
                          <Text size="xs" fw={700}>
                            {appliedCoupon.code}
                          </Text>

                          {appliedCoupon.description ? (
                            <Text size="xs" c="dimmed" mt={2}>
                              {appliedCoupon.description}
                            </Text>
                          ) : null}
                        </Box>

                        <Text size="xs" fw={700} c="green">
                          {t('Applied')}
                        </Text>
                      </Group>
                    </Paper>
                  ) : null}
                </Box>

                <Button
                  component={Link}
                  href="/checkout"
                  fullWidth
                  radius="md"
                  size="md"
                  color="dark"
                  mt={4}
                  styles={{
                    root: {
                      height: 48,
                    },
                  }}
                >
                  {t('Proceed to Checkout')}
                </Button>

                <Text size="xs" c="dimmed" ta="center">
                  {t('Shipping fees are calculated during checkout.')}
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      ) : (
        /* Empty cart */
        <Paper withBorder radius="md" px={{ base: 20, sm: 32 }} py={{ base: 48, sm: 64 }}>
          <Stack align="center" gap="md" ta="center">
            <Box
              w={56}
              h={56}
              style={{
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: 'var(--mantine-color-gray-light)',
              }}
            >
              <PackageOpen size={24} strokeWidth={1.6} />
            </Box>

            <Box>
              <Title order={2} fz={{ base: 22, sm: 24 }}>
                {t('Your cart is empty')}
              </Title>

              <Text mt={8} size="sm" c="dimmed" maw={420}>
                {t('Browse our products and add something to your cart to get started.')}
              </Text>
            </Box>

            <Button component={Link} href="/shop" radius="md" color="dark" mt="xs">
              {t('Continue Shopping')}
            </Button>
          </Stack>
        </Paper>
      )}
    </StorePageContainer>
  );
}

export function FavoritesPageView({ products }: { products: StoreProduct[] }) {
  const favorites = useCartStore((state) => state.favorites);
  const favoriteProducts = products.filter((product) => favorites.includes(product.id));

  return (
    <Container className="py-7 md:py-14">
      <SectionHeading
        title="YOUR FAVORITES ARE EMPTY."
        description="Save the gear and flavors worth coming back to."
      />
      {favoriteProducts.length ? (
        <ProductGrid products={favoriteProducts} />
      ) : (
        <Box
          component="div"
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10 text-center shadow-sm"
        >
          <Box component="p" className="text-sm text-[var(--text-secondary)]">
            Nothing saved yet.
          </Box>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-[var(--text)] px-5 py-3 text-sm tracking-[0.2em] text-black"
          >
            VIEW SHOP
          </Link>
        </Box>
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
    <Container className="py-7 md:py-14">
      <SectionHeading title="SEARCH" description="Search by name, mood, or product detail." />
      <Box
        component="input"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('Search devices, flavors, and accessories...')}
        className="h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--accent)_12%,transparent)]"
      />
      <Box component="div" className="mt-8">
        <ProductGrid products={results.length ? results : products.slice(0, 4)} />
      </Box>
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
    <Container className="py-7 md:py-14">
      <SectionHeading title="ACCOUNT" description="Everything you need, none of the clutter." />
      <Box component="div" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Box
            component="div"
            key={card.title}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-md"
          >
            <Box component="div" className="font-display text-3xl uppercase">
              {t(card.title)}
            </Box>
            <Box component="p" className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              {t(card.body)}
            </Box>
          </Box>
        ))}
      </Box>
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
  const [showCheckoutValidation, setShowCheckoutValidation] = useState(false);
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

    setShowCheckoutValidation(true);

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
    <Container>
      {/* Header */}
      <Box mb={{ base: 24, md: 32 }}>
        <Group justify="space-between" align="flex-end" gap="md" wrap="wrap">
          <Box>
            <Title order={1} fz={{ base: 26, sm: 30 }} fw={700}>
              {t('Checkout')}
            </Title>

            <Text mt={5} size="sm" c="dimmed">
              {t('Complete your delivery details and place your order.')}
            </Text>
          </Box>

          <Text size="sm" c="dimmed">
            {lines.length} {t(lines.length === 1 ? 'item' : 'items')}
            {' · '}
            {formatCurrency(total)}
          </Text>
        </Group>
      </Box>

      <Grid align="flex-start">
        {/* LEFT */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="sm">
            {!lines.length ? (
              <Paper withBorder radius="md" p="sm">
                <Text size="xs" c="dimmed">
                  {t('Your cart is empty.')}
                </Text>
              </Paper>
            ) : null}

            <Paper withBorder radius="md" p={{ base: 'sm', sm: 'md' }}>
              <Group justify="space-between" align="center" mb="sm" gap="sm">
                <Box>
                  <Text fw={700} fz={15}>
                    {t('Delivery Address')}
                  </Text>

                  <Text mt={2} size="xs" c="dimmed">
                    {addresses.length
                      ? t('Choose a saved address or enter your details.')
                      : t('Enter your delivery details.')}
                  </Text>
                </Box>

                <Button
                  component={Link}
                  href="/addresses/new"
                  variant="subtle"
                  color="gray"
                  size="compact-xs"
                  radius="sm"
                >
                  {t('Add address')}
                </Button>
              </Group>

              {addresses.length ? (
                <Box mb="sm">
                  <Text size="xs" c="dimmed" mb={6}>
                    {t('Saved addresses')}
                  </Text>

                  <SimpleGrid
                    cols={{
                      base: 1,
                      sm: Math.min(addresses.length, 2),
                    }}
                    spacing="xs"
                  >
                    {addresses.map((address) => {
                      const selected = selectedAddressId === address.id;

                      return (
                        <UnstyledButton
                          key={address.id}
                          onClick={() => setSelectedAddressId(address.id)}
                          style={{
                            width: '100%',
                            height: '100%',
                          }}
                        >
                          <Paper
                            withBorder
                            radius="sm"
                            px="sm"
                            py={8}
                            h="100%"
                            style={{
                              borderColor: selected ? 'var(--mantine-color-dark-5)' : undefined,
                              background: selected
                                ? 'var(--mantine-color-default-hover)'
                                : undefined,
                            }}
                          >
                            <Group align="flex-start" wrap="nowrap" gap="xs">
                              <Box
                                mt={3}
                                w={14}
                                h={14}
                                style={{
                                  flexShrink: 0,
                                  borderRadius: '50%',
                                  border: selected
                                    ? '4px solid var(--mantine-color-dark-6)'
                                    : '1px solid var(--mantine-color-default-border)',
                                }}
                              />

                              <Box
                                style={{
                                  minWidth: 0,
                                  flex: 1,
                                }}
                              >
                                <Group justify="space-between" gap="xs" wrap="nowrap">
                                  <Text fw={600} size="xs" lineClamp={1}>
                                    {address.label}
                                  </Text>

                                  {address.isDefault ? (
                                    <Badge variant="light" color="gray" size="xs" radius="sm">
                                      {t('Default')}
                                    </Badge>
                                  ) : null}
                                </Group>

                                <Text mt={3} size="xs" lineClamp={1}>
                                  {address.fullName} · {address.phone}
                                </Text>

                                <Text mt={2} size="xs" c="dimmed" lineClamp={1}>
                                  {[
                                    address.area,
                                    address.street,
                                    address.building,
                                    address.city,
                                    address.country,
                                  ]
                                    .filter(Boolean)
                                    .join(', ')}
                                </Text>
                              </Box>
                            </Group>
                          </Paper>
                        </UnstyledButton>
                      );
                    })}
                  </SimpleGrid>
                </Box>
              ) : null}

              <Box
                pt="sm"
                style={{
                  borderTop: addresses.length
                    ? '1px solid var(--mantine-color-default-border)'
                    : undefined,
                }}
              >
                <CheckoutDetailsPanel
                  form={form}
                  setForm={setForm}
                  countryOptions={countryOptions}
                  cityOptions={cityOptions}
                  hasConfiguredDelivery={hasConfiguredDelivery}
                  deliveryFee={formatCurrency(shippingAmount)}
                  t={t}
                  showValidation={showCheckoutValidation}
                />
              </Box>
            </Paper>
          </Stack>
        </Grid.Col>

        {/* RIGHT */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper
            withBorder
            radius="md"
            p="md"
            style={{
              position: 'sticky',
              top: 76,
              maxHeight: 'calc(100vh - 92px)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Group justify="space-between" mb="sm">
              <Text fw={700} fz={15}>
                {t('Order Summary')}
              </Text>

              <Text size="xs" c="dimmed">
                {lines.length} {t(lines.length === 1 ? 'item' : 'items')}
              </Text>
            </Group>

            {/* PRODUCTS */}
            <Stack
              gap={0}
              style={{
                maxHeight: lines.length > 3 ? 190 : undefined,
                overflowY: lines.length > 3 ? 'auto' : 'visible',
              }}
            >
              {lines.map((line, index) => {
                const productName = localize(line.product.name, line.product.nameAr);

                const variantName = localize(line.variant.size, line.variant.sizeAr);

                return (
                  <Box
                    key={line.lineId}
                    py={8}
                    style={{
                      borderBottom:
                        index < lines.length - 1
                          ? '1px solid var(--mantine-color-default-border)'
                          : undefined,
                    }}
                  >
                    <Group wrap="nowrap" gap="sm">
                      <Image
                        src={line.product.images[0]?.url || '/products/puff-jo-product-default.png'}
                        alt={productName}
                        w={44}
                        h={44}
                        radius="sm"
                        fit="contain"
                        p={3}
                        fallbackSrc="/products/puff-jo-product-default.png"
                        style={{
                          flexShrink: 0,
                          background: 'var(--mantine-color-default-hover)',
                        }}
                      />

                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Group justify="space-between" align="flex-start" gap="xs" wrap="nowrap">
                          <Box style={{ minWidth: 0 }}>
                            <Text size="xs" fw={600} lineClamp={1}>
                              {productName}
                            </Text>

                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {variantName ? `${variantName} · ` : ''}
                              {t('Qty')}: {line.quantity}
                            </Text>
                          </Box>

                          <Text size="xs" fw={600} style={{ flexShrink: 0 }}>
                            {formatCurrency(line.variant.price * line.quantity)}
                          </Text>
                        </Group>
                      </Box>

                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size={24}
                        radius="sm"
                        onClick={() => removeItem(line.lineId)}
                        aria-label={t('Remove')}
                      >
                        <Trash2 size={12} />
                      </ActionIcon>
                    </Group>
                  </Box>
                );
              })}
            </Stack>

            {/* PRICE SUMMARY */}
            <Stack
              gap={6}
              mt="sm"
              pt="sm"
              style={{
                borderTop: '1px solid var(--mantine-color-default-border)',
              }}
            >
              <Group justify="space-between" gap="sm">
                <Text size="xs" c="dimmed">
                  {t('Subtotal')}
                </Text>

                <Text size="xs" fw={500}>
                  {formatCurrency(subtotal)}
                </Text>
              </Group>

              {flashSaleDiscountAmount > 0 ? (
                <Group justify="space-between" gap="sm">
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {activeFlashSale
                      ? `${t('Flash sale')} (${activeFlashSale.title})`
                      : t('Flash sale')}
                  </Text>

                  <Text size="xs" fw={500}>
                    -{formatCurrency(flashSaleDiscountAmount)}
                  </Text>
                </Group>
              ) : null}

              {couponDiscountAmount > 0 ? (
                <Group justify="space-between" gap="sm">
                  <Text size="xs" c="dimmed">
                    {appliedCoupon ? `${t('Coupon')} (${appliedCoupon.code})` : t('Coupon')}
                  </Text>

                  <Text size="xs" fw={500}>
                    -{formatCurrency(couponDiscountAmount)}
                  </Text>
                </Group>
              ) : null}

              <Group justify="space-between" gap="sm">
                <Text size="xs" c="dimmed">
                  {t('Delivery')}
                </Text>

                <Text size="xs" fw={500}>
                  {hasConfiguredDelivery ? formatCurrency(shippingAmount) : t('Select city')}
                </Text>
              </Group>
            </Stack>

            {/* COUPON */}
            <Box
              mt="sm"
              pt="sm"
              style={{
                borderTop: '1px solid var(--mantine-color-default-border)',
              }}
            >
              <UnstyledButton onClick={() => setIsCouponOpen((current) => !current)} w="100%">
                <Group justify="space-between">
                  <Text size="xs" fw={500}>
                    {appliedCoupon
                      ? `${t('Promo code')}: ${appliedCoupon.code}`
                      : t('Add promo code')}
                  </Text>

                  <Text size="sm" c="dimmed">
                    {isCouponOpen ? '−' : '+'}
                  </Text>
                </Group>
              </UnstyledButton>

              {isCouponOpen ? (
                <Group mt={8} gap={6} wrap="nowrap">
                  <Box style={{ flex: 1 }}>
                    <StoreTextInput
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value)}
                      placeholder={t('Promo code')}
                      disabled={Boolean(appliedCoupon)}
                    />
                  </Box>

                  <Button
                    variant="default"
                    radius="sm"
                    size="xs"
                    loading={isApplyingCoupon}
                    disabled={!lines.length || (!couponCode.trim() && !appliedCoupon)}
                    onClick={appliedCoupon ? clearAppliedCoupon : applyCoupon}
                  >
                    {appliedCoupon ? t('Remove') : t('Apply')}
                  </Button>
                </Group>
              ) : null}
            </Box>

            {/* TOTAL */}
            <Group
              justify="space-between"
              mt="sm"
              pt="sm"
              style={{
                borderTop: '1px solid var(--mantine-color-default-border)',
              }}
            >
              <Text size="sm" fw={700}>
                {t('Total')}
              </Text>

              <Text fz={17} fw={700}>
                {formatCurrency(total)}
              </Text>
            </Group>

            {!hasConfiguredDelivery && lines.length ? (
              <Text mt={5} size="xs" c="red">
                {t('No delivery fee is configured for the selected location.')}
              </Text>
            ) : null}

            {/* PLACE ORDER */}
            <Button
              fullWidth
              color="dark"
              radius="md"
              mt="sm"
              loading={isSubmitting}
              disabled={!lines.length || isSubmitting || !hasConfiguredDelivery}
              onClick={placeOrder}
              rightSection={dir === 'rtl' ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              styles={{
                root: {
                  height: 40,
                },
              }}
            >
              {isSubmitting ? t('Placing Order') : t('Place Order')}
            </Button>

            <Text mt={6} size="xs" c="dimmed" ta="center">
              {t('Secure checkout')}
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>
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
    <Container className="flex min-h-[72vh] items-center py-8 md:py-12">
      <Box
        component="div"
        className="mx-auto w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6 md:p-8"
      >
        <Box component="div" className="text-xs tracking-[0.25em] text-[var(--muted)]">
          {t('SUPABASE AUTH')}
        </Box>
        <Box component="h1" className="mt-3 font-display text-4xl uppercase">
          {mode === 'login'
            ? t('LOG IN')
            : mode === 'register'
              ? t('JOIN THE PUFF CLUB')
              : t('RESET PASSWORD')}
        </Box>
        <Box component="p" className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          {mode === 'login'
            ? 'Sign in to keep your bag, favorites, and orders in sync.'
            : mode === 'register'
              ? 'Create your account before the next drop disappears.'
              : 'We will send a reset link if your Supabase project is configured.'}
        </Box>
        <Box
          component="form"
          onSubmit={handleSubmit(async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setSubmitted(true);
          })}
          className="mt-8 space-y-4"
        >
          {mode === 'register' ? (
            <Field label={t('Full Name')} error={errors.fullName?.message}>
              <Box
                component="input"
                {...register('fullName')}
                className="h-13 w-full rounded-2xl border border-[var(--border)] bg-[var(--background-secondary)] px-4 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--accent)_12%,transparent)]"
              />
            </Field>
          ) : null}
          <Field label={t('Email')} error={errors.email?.message}>
            <Box
              component="input"
              {...register('email')}
              className="h-13 w-full rounded-2xl border border-[var(--border)] bg-[var(--background-secondary)] px-4 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--accent)_12%,transparent)]"
            />
          </Field>
          {mode !== 'forgot-password' ? (
            <Field label={t('Password')} error={errors.password?.message}>
              <Box
                component="input"
                type="password"
                {...register('password')}
                className="h-13 w-full rounded-2xl border border-[var(--border)] bg-[var(--background-secondary)] px-4 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--accent)_12%,transparent)]"
              />
            </Field>
          ) : null}
          <Box
            component="button"
            type="submit"
            disabled={isSubmitting}
            className="min-h-11 w-full rounded-2xl bg-[var(--text)] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[var(--background)] shadow-[0_14px_30px_rgba(0,0,0,.14)] transition hover:-translate-y-0.5"
          >
            {isSubmitting
              ? t('PLEASE WAIT')
              : mode === 'login'
                ? t('LOG IN')
                : mode === 'register'
                  ? t('Register')
                  : t('Send code')}
          </Box>
          {submitted ? (
            <Box component="p" className="text-sm text-[var(--blush)]">
              {t('Form captured. Wire this to your Supabase auth environment keys before launch.')}
            </Box>
          ) : null}
        </Box>
      </Box>
    </Container>
  );
}

export function OrderSuccessPageView({
  orderId,
  order,
}: {
  orderId: string;
  order: {
    order_number: string;
    customer_name: string | null;
    customer_phone: string | null;
    shipping_address: Record<string, unknown>;
    payment_method: string;
    subtotal: string | number;
    shipping_amount: string | number;
    discount_amount: string | number;
    total_amount: string | number;
    currency: string;
    items?: Array<{
      product_name: string;
      quantity: number;
      size_name: string | null;
    }>;
  } | null;
}) {
  const { t } = useLocale();
  const address = order?.shipping_address ?? {};
  const whatsappMessage = order
    ? [
        'New Puff Jo Order',
        `Order number: ${order.order_number}`,
        `Customer: ${order.customer_name ?? ''}`,
        `Phone: ${order.customer_phone ?? ''}`,
        '',
        'Shipping address:',
        [address.country, address.city, address.area, address.street, address.building]
          .filter(Boolean)
          .join(', '),
        '',
        'Items:',
        ...(order.items ?? []).map(
          (item) =>
            `- ${item.product_name} x${item.quantity}${item.size_name ? ` (${item.size_name})` : ''}`
        ),
        '',
        `Subtotal: ${formatCurrency(Number(order.subtotal), order.currency)}`,
        `Discount: ${formatCurrency(Number(order.discount_amount), order.currency)}`,
        `Delivery: ${formatCurrency(Number(order.shipping_amount), order.currency)}`,
        `Total: ${formatCurrency(Number(order.total_amount), order.currency)}`,
        `Payment: ${order.payment_method}`,
      ].join('\n')
    : '';
  const whatsappUrl = `https://wa.me/962796508327?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <Container className="py-12 md:py-20">
      <Box
        component="div"
        className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6 md:p-8"
      >
        <SectionHeading
          title={t('ORDER RECEIVED.')}
          description={`${t('Order number')} #${orderId}`}
        />
        <Box component="div" className="space-y-4 text-sm leading-7 text-[var(--text-secondary)]">
          <Box component="p">{t('Your order has been placed successfully.')}</Box>
          <Box component="p">
            {t('You can review delivery updates and order details from your account page.')}
          </Box>
        </Box>
        <Box component="div" className="mt-8 flex flex-col gap-3 sm:flex-row">
          {order ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#25D366] px-5 py-3 text-center text-sm font-semibold tracking-[0.12em] text-white"
            >
              {t('SEND ORDER ON WHATSAPP')}
            </a>
          ) : null}
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
        </Box>
      </Box>
    </Container>
  );
}

function CatalogHero({ title, description }: { title: string; description: string }) {
  const { t } = useLocale();
  return (
    <Box
      component="section"
      className="border-b border-[var(--border)] bg-[var(--background-secondary)] py-10 md:py-14"
    >
      <Container className="relative">
        <Box
          component="div"
          className="text-[11px] font-bold tracking-[0.3em] text-[var(--accent)]"
        >
          {t('PUFF JO / STORE')}
        </Box>
        <Box
          component="h1"
          className="mt-4 max-w-4xl text-4xl md:text-4xl font-black uppercase leading-[.88] tracking-[-0.055em]"
        >
          {t(title)}
        </Box>
        <Box
          component="p"
          className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] md:text-base"
        >
          {t(description)}
        </Box>
      </Container>
    </Box>
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
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <Text size={emphasis ? 'lg' : 'sm'} c={emphasis ? undefined : 'dimmed'}>
        {label}
      </Text>
      <Text size={emphasis ? 'lg' : 'sm'} fw={emphasis ? 700 : 500}>
        {value}
      </Text>
    </Box>
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
    <Box component="label" className="block">
      <Box component="span" className="mb-2 block text-xs tracking-[0.24em] text-[var(--muted)]">
        {label}
      </Box>
      {children}
      {error ? (
        <Box component="span" className="mt-2 block text-xs text-[var(--blush)]">
          {error}
        </Box>
      ) : null}
    </Box>
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
    <Box component="div" className="border-b border-[var(--border)] py-1 last:border-b-0">
      <Box
        component="button"
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text)]"
      >
        <Box component="span">{t(title)}</Box>
        <ArrowIcon
          className={`h-4 w-4 transition ${open ? (dir === 'rtl' ? '-rotate-90' : 'rotate-90') : ''}`}
        />
      </Box>
      {open ? (
        <Box component="div" className="pt-2 text-sm leading-7 text-[var(--text-secondary)]">
          {children}
        </Box>
      ) : null}
    </Box>
  );
}
