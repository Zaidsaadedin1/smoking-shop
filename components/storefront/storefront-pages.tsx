'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, Minus, Plus, SlidersHorizontal, Star } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, useMemo, useState } from 'react';
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
import { FlashSale, StoreCategory, StoreProduct } from '@/lib/commerce-types';
import {
  calculateDiscount,
  filterProducts,
  formatCurrency,
  getCompareAtPrice,
  getPrimaryPrice,
  getProductColors,
  getProductInventory,
  getProductSizes,
} from '@/lib/commerce-utils';
import { useCartStore } from '@/stores/use-cart-store';
import { useUiStore } from '@/stores/use-ui-store';

export function ShopPageView({
  products,
  categories,
  title = 'SHOP',
  description = 'Dark feminine pieces, nails, and finishing touches.',
  initialCategory,
  flashSale,
}: {
  products: StoreProduct[];
  categories: StoreCategory[];
  title?: string;
  description?: string;
  initialCategory?: string;
  flashSale?: FlashSale | null;
}) {
  const { t } = useLocale();
  const [category, setCategory] = useState(initialCategory ?? 'all');
  const [sort, setSort] = useState<'newest' | 'price-asc' | 'price-desc' | 'featured'>('newest');

  const filtered = useMemo(
    () =>
      filterProducts(products, {
        category: category !== 'all' ? category : undefined,
        sort,
      }),
    [category, products, sort]
  );

  return (
    <div className="space-y-10 pb-16 md:space-y-16 md:pb-24">
      <CatalogHero title={title} description={description} />
      <div className="border-y border-[var(--border)] bg-[var(--card)]">
        <Container className="py-3">
          <div className="grid gap-2 md:grid-cols-6 xl:grid-cols-7">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={`flex items-center justify-between border px-3 py-3 text-left text-[10px] uppercase tracking-[0.18em] ${
                category === 'all' ? 'border-[var(--text)] bg-[var(--background)]' : 'border-[var(--border)]'
              }`}
            >
              <span>{t('ALL')}</span>
              <span className="text-[var(--muted)]">+</span>
            </button>
            {categories.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.slug)}
                className={`flex items-center justify-between border px-3 py-3 text-left text-[10px] uppercase tracking-[0.18em] ${
                  category === item.slug ? 'border-[var(--text)] bg-[var(--background)]' : 'border-[var(--border)]'
                }`}
              >
                <span>{t(item.name)}</span>
                <span className="text-[var(--muted)]">+</span>
              </button>
            ))}
          </div>
        </Container>
      </div>
      <Container>
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] py-3 text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
          <div>{filtered.length} {t('PIECES')}</div>
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

export function ProductPageView({
  product,
  relatedProducts,
}: {
  product: StoreProduct;
  relatedProducts: StoreProduct[];
}) {
  const { t } = useLocale();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUiStore((state) => state.openCart);
  const pushToast = useUiStore((state) => state.pushToast);
  const colors = getProductColors(product);
  const sizes = getProductSizes(product);
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? '');
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? '');
  const [quantity, setQuantity] = useState(1);

  const selectedVariant =
    product.variants.find((variant) => variant.color === selectedColor && variant.size === selectedSize) ??
    product.variants.find((variant) => variant.color === selectedColor) ??
    product.variants[0];

  const discount = calculateDiscount(selectedVariant.price, selectedVariant.compareAtPrice);

  return (
    <div className="pb-20 pt-6 md:pb-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {product.images.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-[28px] border border-white/8 bg-[var(--card)]">
                <img src={image.url} alt={image.alt} className="aspect-[4/5] w-full object-cover transition duration-500 hover:scale-[1.04]" />
              </div>
            ))}
          </div>
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <div className="text-xs tracking-[0.26em] text-[var(--muted)]">{product.brand}</div>
            <h1 className="mt-3 font-display text-4xl uppercase md:text-6xl">{t(product.name)}</h1>
            <div className="mt-4 flex items-center gap-4">
              <div className="text-2xl">{formatCurrency(selectedVariant.price)}</div>
              {selectedVariant.compareAtPrice ? <div className="text-lg text-[var(--muted)] line-through">{formatCurrency(selectedVariant.compareAtPrice)}</div> : null}
              {discount > 0 ? <div className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs tracking-[0.2em]">{discount}% OFF</div> : null}
            </div>
            <div className="mt-4">
              <Rating rating={product.rating} reviewCount={product.reviewCount} />
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">{t(product.shortDescription)}</p>

            <div className="mt-8">
              <div className="mb-3 text-xs tracking-[0.24em] text-[var(--muted)]">{t('COLOR')}</div>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                      selectedColor === color.name ? 'border-white bg-white text-black' : 'border-white/10'
                    }`}
                  >
                    <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: color.hex }} />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-3 text-xs tracking-[0.24em] text-[var(--muted)]">{t('SIZE')}</div>
              <div className="flex flex-wrap gap-3">
                {sizes.map((sizeOption) => {
                  const available = product.variants.some(
                    (variant) =>
                      variant.size === sizeOption &&
                      variant.color === selectedColor &&
                      (variant.stockQuantity > 0 || variant.allowBackorder)
                  );

                  return (
                    <button
                      key={sizeOption}
                      type="button"
                      onClick={() => setSelectedSize(sizeOption)}
                      disabled={!available}
                      className={`rounded-full border px-4 py-2 text-sm ${
                        selectedSize === sizeOption ? 'border-white bg-white text-black' : 'border-white/10'
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      {sizeOption}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-full border border-white/10 px-4 py-3">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                  <Minus className="h-4 w-4" />
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((value) => value + 1)}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {selectedVariant.stockQuantity > 0
                  ? selectedVariant.stockQuantity <= 2
                    ? `${t('ONLY')} ${selectedVariant.stockQuantity} ${t('LEFT')}`
                    : t('IN STOCK')
                  : t('SOLD OUT')}
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={selectedVariant.stockQuantity <= 0 && !selectedVariant.allowBackorder}
                onClick={() => {
                  addItem(product, selectedVariant.id, quantity);
                  openCart();
                  pushToast({
                    title: t('Added to your bag'),
                    description: `${t(product.name)} • ${selectedVariant.color} / ${selectedVariant.size}`,
                  });
                }}
                className="rounded-full bg-[var(--text)] px-6 py-4 text-sm tracking-[0.2em] text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('AddToCartButton')}
              </button>
              <Link href="/checkout" className="rounded-full border border-white/10 px-6 py-4 text-center text-sm tracking-[0.2em]">
                {t('BUY NOW')}
              </Link>
            </div>

            <div className="mt-8 space-y-4 rounded-[28px] border border-white/8 bg-white/3 p-5">
              <Accordion title="PRODUCT DETAILS" defaultOpen>
                {t(product.description)}
              </Accordion>
              <Accordion title="SHIPPING">
                {t('Delivery across Jordan. Orders in Amman usually arrive within 1-3 business days.')}
              </Accordion>
              <Accordion title="RETURNS">
                {t('Return eligibility depends on item type. Nail sets and intimate items remain final sale unless faulty.')}
              </Accordion>
            </div>
          </div>
        </div>
      </Container>

      <Container className="mt-16">
        <SectionHeading title="YOU MAY ALSO WANT" />
        <ProductGrid products={relatedProducts} />
      </Container>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/8 bg-black/80 p-4 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3">
          <div className="flex-1">
            <div className="text-xs tracking-[0.2em] text-[var(--muted)]">{t('PRICE')}</div>
            <div>{formatCurrency(selectedVariant.price)}</div>
          </div>
          <button
            type="button"
            disabled={selectedVariant.stockQuantity <= 0 && !selectedVariant.allowBackorder}
            onClick={() => {
              addItem(product, selectedVariant.id, quantity);
              openCart();
            }}
            className="rounded-full bg-[var(--text)] px-6 py-4 text-sm tracking-[0.2em] text-black"
          >
            {t('AddToCartButton')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CartPageView({ products }: { products: StoreProduct[] }) {
  const { t } = useLocale();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const lines = items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      const variant = product?.variants.find((entry) => entry.id === item.variantId);
      if (!product || !variant) {
        return null;
      }
      return { product, variant, quantity: item.quantity };
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));
  const subtotal = lines.reduce((sum, line) => sum + line.variant.price * line.quantity, 0);
  const total = subtotal + 3.5;

  return (
    <Container className="py-8 md:py-14">
      <div className="mb-8">
        <div className="text-xs tracking-[0.3em] text-[var(--muted)]">{t('BAG')}</div>
        <h1 className="font-display text-5xl uppercase">{t('YOUR BAG')}</h1>
      </div>
      {lines.length ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {lines.map((line) => (
              <div key={line.variant.id} className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-white/3 p-4 md:flex-row">
                <img src={line.product.images[0]?.url} alt={line.product.name} className="h-40 w-full rounded-[22px] object-cover md:w-32" />
                <div className="flex-1">
                  <div className="text-lg">{t(line.product.name)}</div>
                  <div className="mt-2 text-sm text-[var(--text-secondary)]">{line.variant.color} / {line.variant.size}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>{formatCurrency(line.variant.price)}</div>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
                      <button type="button" onClick={() => updateQuantity(line.variant.id, line.quantity - 1)}><Minus className="h-4 w-4" /></button>
                      <span>{line.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(line.variant.id, line.quantity + 1)}><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeItem(line.variant.id)} className="mt-4 text-xs tracking-[0.2em] text-[var(--muted)]">{t('REMOVE')}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="h-fit rounded-[28px] border border-white/8 bg-white/3 p-5 lg:sticky lg:top-28">
            <div className="mb-5 text-xs tracking-[0.25em] text-[var(--muted)]">{t('ORDER SUMMARY')}</div>
            <SummaryRow label={t('Subtotal')} value={formatCurrency(subtotal)} />
            <SummaryRow label={t('Delivery')} value={formatCurrency(3.5)} />
            <SummaryRow label={t('Tax')} value={formatCurrency(0)} />
            <div className="mt-4 border-t border-white/8 pt-4">
              <SummaryRow label={t('Total')} value={formatCurrency(total)} emphasis />
            </div>
            <div className="mt-5 grid gap-3">
              <input placeholder={t('CouponInput')} className="h-12 rounded-full border border-white/10 bg-black/20 px-5 text-sm outline-none" />
              <button type="button" className="rounded-full border border-white/10 px-5 py-3 text-sm tracking-[0.2em]">{t('Apply')}</button>
              <Link href="/checkout" className="rounded-full bg-[var(--text)] px-5 py-3 text-center text-sm tracking-[0.2em] text-black">{t('CHECKOUT')}</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[32px] border border-white/8 bg-white/3 p-10 text-center">
          <div className="font-display text-4xl uppercase">{t('YOUR BAG IS EMPTY.')}</div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{t('But that can be fixed.')}</p>
          <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[var(--text)] px-5 py-3 text-sm tracking-[0.2em] text-black">{t('SHOP THE DROP')}</Link>
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
      <SectionHeading title="YOUR WISHLIST IS TOO QUIET." description="Save the pieces worth circling back for." />
      {favoriteProducts.length ? (
        <ProductGrid products={favoriteProducts} />
      ) : (
        <div className="rounded-[32px] border border-white/8 bg-white/3 p-10 text-center">
          <p className="text-sm text-[var(--text-secondary)]">Nothing saved yet.</p>
          <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[var(--text)] px-5 py-3 text-sm tracking-[0.2em] text-black">VIEW PRODUCTS</Link>
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
        placeholder={t('Search the coven...')}
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

export function CheckoutPageView() {
  const { t } = useLocale();
  return (
    <Container className="py-8 md:py-14">
      <SectionHeading title="CHECKOUT" description="Cash on Delivery is supported. Card checkout requires a configured payment provider." />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4 rounded-[28px] border border-white/8 bg-white/3 p-6">
          <Step title="1. DELIVERY" active />
          <Step title="2. PAYMENT" />
          <Step title="3. REVIEW" />
          <div className="grid gap-4 md:grid-cols-2">
            {['Full Name', 'Phone', 'City', 'Area', 'Street', 'Building'].map((field) => (
              <input key={field} placeholder={t(field)} className="h-12 rounded-full border border-white/10 bg-black/20 px-5 text-sm outline-none" />
            ))}
          </div>
          <select className="h-12 rounded-full border border-white/10 bg-black/20 px-5 text-sm outline-none">
            <option>{t('Cash on Delivery')}</option>
            <option disabled>{t('Card (not configured)')}</option>
          </select>
        </div>
        <div className="rounded-[28px] border border-white/8 bg-white/3 p-6">
          <div className="mb-4 text-xs tracking-[0.25em] text-[var(--muted)]">{t('ORDER SUMMARY')}</div>
          <SummaryRow label={t('Subtotal')} value={formatCurrency(0)} />
          <SummaryRow label={t('Delivery')} value={formatCurrency(3.5)} />
          <SummaryRow label={t('Total')} value={formatCurrency(3.5)} emphasis />
          <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">
            {t('Final pricing should be confirmed by a Supabase checkout RPC before production launch.')}
          </p>
          <button type="button" className="mt-6 w-full rounded-full bg-[var(--text)] px-5 py-3 text-sm tracking-[0.2em] text-black">
            {t('PLACE ORDER')}
          </button>
        </div>
      </div>
    </Container>
  );
}

export function AuthPageView({
  mode,
}: {
  mode: 'login' | 'register' | 'forgot-password';
}) {
  const { t } = useLocale();
  const schema = z.object({
    email: z.string().email(),
    password: mode === 'forgot-password' ? z.string().optional() : z.string().min(6),
    fullName: mode === 'register' ? z.string().min(2) : z.string().optional(),
  });

  type FormValues = z.infer<typeof schema>;
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <Container className="flex min-h-[70vh] items-center py-10">
      <div className="mx-auto w-full max-w-lg rounded-[36px] border border-white/8 bg-white/3 p-8 md:p-10">
        <div className="text-xs tracking-[0.25em] text-[var(--muted)]">{t('SUPABASE AUTH')}</div>
        <h1 className="mt-3 font-display text-5xl uppercase">
          {mode === 'login' ? t('LOG IN') : mode === 'register' ? t('JOIN THE COVEN') : t('RESET PASSWORD')}
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
              <input {...register('fullName')} className="h-12 w-full rounded-full border border-white/10 bg-black/20 px-5 text-sm outline-none" />
            </Field>
          ) : null}
          <Field label={t('Email')} error={errors.email?.message}>
            <input {...register('email')} className="h-12 w-full rounded-full border border-white/10 bg-black/20 px-5 text-sm outline-none" />
          </Field>
          {mode !== 'forgot-password' ? (
            <Field label={t('Password')} error={errors.password?.message}>
              <input type="password" {...register('password')} className="h-12 w-full rounded-full border border-white/10 bg-black/20 px-5 text-sm outline-none" />
            </Field>
          ) : null}
          <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-[var(--text)] px-5 py-3 text-sm tracking-[0.2em] text-black">
            {isSubmitting ? t('PLEASE WAIT') : mode === 'login' ? t('LOG IN') : mode === 'register' ? t('Register') : t('Send code')}
          </button>
          {submitted ? <p className="text-sm text-[var(--blush)]">{t('Form captured. Wire this to your Supabase auth environment keys before launch.')}</p> : null}
        </form>
      </div>
    </Container>
  );
}

function CatalogHero({ title, description }: { title: string; description: string }) {
  const { t } = useLocale();
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] py-10 md:py-14">
      <Container className="relative">
        <div className="text-[11px] tracking-[0.28em] text-[var(--muted)]">{t('STORE')}</div>
        <h1 className="mt-3 text-2xl font-semibold uppercase tracking-[0.22em] md:text-4xl">{t(title)}</h1>
        <p className="mt-3 max-w-2xl text-sm uppercase tracking-[0.12em] text-[var(--text-secondary)]">{t(description)}</p>
      </Container>
    </section>
  );
}

function FilterGroup({
  title,
  items,
  value,
  onChange,
}: {
  title: string;
  items: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="mb-5">
      <div className="mb-3 text-xs tracking-[0.25em] text-[var(--muted)]">{t(title)}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`rounded-full border px-3 py-2 text-xs tracking-[0.18em] uppercase ${
              value === item ? 'border-white bg-white text-black' : 'border-white/10 text-[var(--text-secondary)]'
            }`}
          >
            {t(item.replace('-', ' '))}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${emphasis ? 'text-lg' : 'text-sm text-[var(--text-secondary)]'}`}>
      <span>{label}</span>
      <span className={emphasis ? 'text-white' : ''}>{value}</span>
    </div>
  );
}

function Step({ title, active = false }: { title: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-full border px-4 py-3 text-sm tracking-[0.2em] ${active ? 'border-white bg-white text-black' : 'border-white/10 text-[var(--text-secondary)]'}`}>
      {active ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
      {title}
    </div>
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
  const { t } = useLocale();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/8 pb-4 last:border-b-0">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between py-2 text-left text-sm tracking-[0.2em]">
        <span>{t(title)}</span>
        <ArrowRight className={`h-4 w-4 transition ${open ? 'rotate-90' : ''}`} />
      </button>
      {open ? <div className="pt-2 text-sm leading-7 text-[var(--text-secondary)]">{children}</div> : null}
    </div>
  );
}
