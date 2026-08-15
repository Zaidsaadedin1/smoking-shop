'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, ReactNode, useState } from 'react';
import { useLocale } from '@/components/storefront/locale-provider';
import { StoreCategory, StoreProduct } from '@/lib/commerce-types';
import {
  calculateDiscount,
  formatCurrency,
  getCompareAtPrice,
  getPrimaryPrice,
  getProductColors,
  getProductInventory,
} from '@/lib/commerce-utils';
import { useCartStore } from '@/stores/use-cart-store';
import { useUiStore } from '@/stores/use-ui-store';

export function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`w-full px-4 md:px-8 lg:px-12 ${className}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const { t } = useLocale();

  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-[var(--border)] pb-5 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <div className="text-[11px] font-medium tracking-[0.3em] text-[var(--muted)]">
            {t(eyebrow)}
          </div>
        ) : null}
        <h2 className="mt-2 text-3xl font-semibold uppercase tracking-[0.18em] md:text-5xl">
          {t(title)}
        </h2>
        {description ? (
          <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
            {t(description)}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function CategoryMoodCard({ category }: { category: StoreCategory }) {
  const { dir, localize } = useLocale();

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group relative min-h-[360px] overflow-hidden border border-[var(--border)] bg-[var(--card)]"
    >
      <img
        src={category.image}
        alt={localize(category.name, category.nameAr)}
        className="absolute inset-0 h-full w-full bg-[#fff8f2] object-contain transition duration-500 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5">
        <div>
          <div className="text-[11px] tracking-[0.3em] text-[var(--text-secondary)]">
            {localize(category.accent, category.accentAr)}
          </div>
          <div className="mt-2 text-2xl font-semibold uppercase tracking-[0.18em]">
            {localize(category.name, category.nameAr)}
          </div>
        </div>
        <ArrowRight
          className={`h-5 w-5 transition duration-500 ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}
        />
      </div>
    </Link>
  );
}

export function ProductCard({ product }: { product: StoreProduct }) {
  const toggleFavorite = useCartStore((state) => state.toggleFavorite);
  const favorites = useCartStore((state) => state.favorites);
  const { pushToast } = useUiStore();
  const { t, localize } = useLocale();
  const router = useRouter();
  const favorite = favorites.includes(product.id);
  const price = getPrimaryPrice(product);
  const compareAtPrice = getCompareAtPrice(product);
  const discount = calculateDiscount(price, compareAtPrice);
  const inventory = getProductInventory(product);

  return (
    <div className="group rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-[0_16px_42px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[0_22px_52px_rgba(0,0,0,0.1)]">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-lg bg-[#fff8f2]">
          <img
            src={product.images[0]?.url}
            alt={localize(product.name, product.nameAr)}
            className="aspect-square w-full object-contain p-2 transition duration-500 group-hover:scale-[1.03]"
          />
          {product.images[1] ? (
            <img
              src={product.images[1].url}
              alt={localize(product.name, product.nameAr)}
              className="absolute inset-0 aspect-square w-full bg-[#fff8f2] object-contain p-2 opacity-0 transition duration-500 group-hover:opacity-100"
            />
          ) : null}
          <div className="absolute left-2 top-2 flex gap-1">
            {product.isNew ? <MiniFlag label="NEW" /> : null}
            {discount > 0 ? <MiniFlag label="SALE" /> : null}
          </div>
          <div className="absolute right-2 top-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              animate={favorite ? { scale: [1, 1.3, 1] } : undefined}
              onClick={async (event) => {
                event.preventDefault();

                try {
                  const response = await fetch(
                    favorite
                      ? `/api/favorites?productId=${encodeURIComponent(product.id)}`
                      : '/api/favorites',
                    favorite
                      ? { method: 'DELETE' }
                      : {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ productId: product.id }),
                        }
                  );

                  if (response.status === 401) {
                    pushToast({
                      title: t('Sign in required'),
                      description: t('Sign in to save menu items to your favorites.'),
                    });
                    router.push('/login');
                    return;
                  }

                  if (!response.ok) {
                    pushToast({
                      title: t('Something went wrong'),
                      description: t('Try again in a moment.'),
                    });
                    return;
                  }
                } catch {
                  pushToast({
                    title: t('Something went wrong'),
                    description: t('Try again in a moment.'),
                  });
                  return;
                }

                toggleFavorite(product.id);
                pushToast({
                  title: favorite ? t('REMOVED FROM FAVORITES') : t('SAVED TO FAVORITES'),
                  description: localize(product.name, product.nameAr),
                });
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#9a9a9a] shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:text-[#c7202f]"
              aria-label="Toggle favorite"
            >
              <Heart className={`h-4 w-4 ${favorite ? 'fill-current text-[#c7202f]' : ''}`} />
            </motion.button>
          </div>
        </div>
      </Link>
      <div className="px-1 pt-4">
        <div className="text-[9px] uppercase tracking-[0.22em] text-[var(--muted)]">
          {localize(product.brand, product.brandAr)}
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 block text-base font-bold text-[var(--text)]"
        >
          {localize(product.name, product.nameAr)}
        </Link>
        {product.shortDescription ? (
          <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[var(--text-secondary)]">
            {localize(product.shortDescription, product.shortDescriptionAr)}
          </p>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 font-bold text-[var(--text)]">
            <span>{formatCurrency(price)}</span>
            {compareAtPrice ? (
              <span className="text-[var(--muted)] line-through">
                {formatCurrency(compareAtPrice)}
              </span>
            ) : null}
          </div>
          <span className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            {t('ADD')}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {getProductColors(product).map((color) => (
              <span
                key={color.name}
                title={localize(color.name, color.nameAr)}
                className="h-2.5 w-2.5 rounded-full border border-black/10"
                style={{ background: color.hex }}
              />
            ))}
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            {inventory > 0 && inventory <= 2 ? `${t('ONLY')} ${inventory}` : t('HOT NOW')}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ products }: { products: StoreProduct[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function EditorialBanner() {
  const { t, dir } = useLocale();

  return (
    <section className="relative overflow-hidden border border-[var(--border)]">
      <img
        src="https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1600&q=80"
        alt="Shawerma saj preparation"
        className="h-[440px] w-full bg-[#181211] object-contain md:h-[560px]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 flex items-end p-6 md:p-12">
        <div className="max-w-xl">
          <div className="text-xs tracking-[0.3em] text-[var(--text-secondary)]">
            {t('FROM THE GRILL')}
          </div>
          <div className="mt-4 text-4xl font-semibold uppercase tracking-[0.18em] leading-none md:text-6xl">
            {t('SAJ, FIRE, GARLIC.')}
          </div>
          <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--text-secondary)]">
            {t('Thin bread, hot shawerma, sharp pickles, and sauce packed for the road.')}
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 text-sm tracking-[0.2em] text-white"
          >
            {t('ORDER FROM MENU')}{' '}
            <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function NewsletterSection() {
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setMessage({ type: 'error', text: t('Email address is required') });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage({ type: 'error', text: t(payload.error ?? 'Something went wrong') });
        return;
      }

      setEmail('');
      setMessage({ type: 'success', text: t('You are on the list.') });
    } catch {
      setMessage({ type: 'error', text: t('Try again in a moment.') });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="border border-[var(--border)] bg-[var(--card)] p-8 md:p-10">
      <div className="max-w-xl">
        <div className="text-xs tracking-[0.28em] text-[var(--muted)]">{t('OFFERS')}</div>
        <div className="mt-4 font-display text-4xl uppercase md:text-5xl">
          {t('GET THE SAJ DEALS.')}
        </div>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          {t('Branch updates, meal offers, and late-night cravings in your inbox.')}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 md:flex-row">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t('Email address')}
          className="h-14 flex-1 rounded-full border border-white/10 bg-black/20 px-6 text-sm outline-none placeholder:text-[var(--muted)]"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-14 rounded-full bg-[var(--accent)] px-8 text-sm tracking-[0.2em] disabled:opacity-40"
          style={{ color: 'var(--background)' }}
        >
          {isSubmitting ? t('PLEASE WAIT') : t('JOIN')}
        </button>
      </form>
      {message ? (
        <p
          className={`mt-4 text-sm ${message.type === 'success' ? 'text-[var(--text)]' : 'text-[var(--blush)]'}`}
        >
          {message.text}
        </p>
      ) : null}
    </section>
  );
}

export function SocialGallery() {
  const images = [
    'https://images.unsplash.com/photo-1662116765994-1e4200c43589?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=1200&q=80',
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {images.map((image) => (
        <div key={image} className="overflow-hidden rounded-[28px] border border-white/8">
          <img
            src={image}
            alt="Fresh menu item"
            className="aspect-square w-full bg-[#fff8f2] object-contain transition duration-500 hover:scale-[1.03]"
          />
        </div>
      ))}
    </div>
  );
}

export function Rating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
      <Star className="h-4 w-4 fill-current text-[var(--blush)]" />
      <span>{rating.toFixed(1)}</span>
      <span>({reviewCount})</span>
    </div>
  );
}

function MiniFlag({ label }: { label: string }) {
  return (
    <span className="bg-black px-2 py-1 text-[8px] font-medium tracking-[0.24em] text-white">
      {label}
    </span>
  );
}
