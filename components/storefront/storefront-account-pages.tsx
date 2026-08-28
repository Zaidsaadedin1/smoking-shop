'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Pencil,
  Heart,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLocale } from '@/components/storefront/locale-provider';
import { useThemeMode } from '@/components/storefront/theme-provider';
import {
  Container,
  ProductGrid,
  SectionHeading,
} from '@/components/storefront/storefront-sections';
import { DeliveryZone, StoreProduct } from '@/lib/commerce-types';

type CustomerSessionView = {
  fullName: string;
  email: string;
  phone?: string | null;
  role?: string;
};

type OrderView = {
  id: string;
  number: string;
  createdAt: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  total: number;
  currency?: string;
  trackingNumber?: string | null;
  shippingCarrier?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  notes?: string | null;
  items?: Array<{
    id: string;
    productName: string;
    sku?: string | null;
    sizeName?: string | null;
    colorName?: string | null;
    imageUrl?: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
};

type AddressView = {
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

type ReviewView = {
  id: string;
  productName: string;
  rating: number;
  body: string;
};

const phoneCountries = [
  { code: '+962', name: 'Jordan', nameAr: 'الأردن' },
  { code: '+966', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: '+971', name: 'United Arab Emirates', nameAr: 'الإمارات' },
  { code: '+970', name: 'Palestine', nameAr: 'فلسطين' },
  { code: '+20', name: 'Egypt', nameAr: 'مصر' },
  { code: '+965', name: 'Kuwait', nameAr: 'الكويت' },
  { code: '+974', name: 'Qatar', nameAr: 'قطر' },
  { code: '+973', name: 'Bahrain', nameAr: 'البحرين' },
  { code: '+968', name: 'Oman', nameAr: 'عُمان' },
  { code: '+964', name: 'Iraq', nameAr: 'العراق' },
];

function CountryCodeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedCountry =
    phoneCountries.find((country) => country.code === value) ?? phoneCountries[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative w-44 shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Country code / رمز الدولة"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex h-12 w-full items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-left text-sm text-[var(--text)] outline-none transition hover:border-[var(--text-secondary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
      >
        <span className="min-w-0 truncate">
          <span className="font-semibold">{selectedCountry.code}</span>
          <span className="ml-1 text-xs text-[var(--text-secondary)]">
            {selectedCountry.nameAr}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen ? (
        <div
          role="listbox"
          aria-label="Country code / رمز الدولة"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-30 max-h-64 w-[min(19rem,calc(100vw-3rem))] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.28)]"
        >
          {phoneCountries.map((country) => {
            const selected = country.code === selectedCountry.code;
            return (
              <button
                key={country.code}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(country.code);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  selected
                    ? 'bg-[var(--accent-deep)] text-[var(--background)]'
                    : 'text-[var(--text)] hover:bg-[var(--surface)]'
                }`}
              >
                <span className="w-12 shrink-0 font-semibold">{country.code}</span>
                <span className="min-w-0 flex-1 truncate text-xs">
                  {country.name} <span className="opacity-70">/ {country.nameAr}</span>
                </span>
                {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function AuthPageView({
  mode,
  nextPath = '/account',
}: {
  mode: 'login' | 'register' | 'forgot-password';
  nextPath?: string;
}) {
  const { t } = useLocale();
  const { isDark } = useThemeMode();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const schema = z.object({
    fullName:
      mode === 'register'
        ? z
            .string()
            .trim()
            .min(2, 'Full name must be at least 2 characters')
            .max(80, 'Full name is too long')
        : z.string().optional(),
    phone:
      mode === 'register'
        ? z
            .string()
            .trim()
            .regex(/^\d{7,12}$/, 'Enter a valid phone number')
        : z.string().optional(),
    phoneCountry:
      mode === 'register' ? z.string().min(1, 'Select a country') : z.string().optional(),
    email: z.string().trim().email('Enter a valid email').max(254, 'Email is too long'),
    password:
      mode === 'forgot-password'
        ? z.string().optional()
        : z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(72, 'Password is too long'),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phoneCountry: '+962' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  return (
    <Container className="flex min-h-[70vh] items-center py-10">
      <div className="mx-auto w-full max-w-xl rounded-[36px] border border-[var(--border)] bg-[var(--card)] p-8 shadow-[0_18px_54px_rgba(24,18,17,0.08)] md:p-10">
        <div className="text-xs tracking-[0.25em] text-[var(--muted)]">{t('CUSTOMER ACCESS')}</div>
        <h1 className="mt-3 font-display text-5xl uppercase">
          {mode === 'login'
            ? t('LOG IN')
            : mode === 'register'
              ? t('CREATE ACCOUNT')
              : t('RESET PASSWORD')}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          {mode === 'login'
            ? t('Sign in to keep your bag, favorites, and orders in sync.')
            : mode === 'register'
              ? t(
                  'Create a customer account for orders, favorites, addresses, and faster checkout.'
                )
              : t('Send a password reset email to your account.')}
        </p>
        <form
          onSubmit={handleSubmit(async (values) => {
            setServerError(null);
            setServerMessage(null);

            const endpoint =
              mode === 'login'
                ? '/api/auth/login'
                : mode === 'register'
                  ? '/api/auth/register'
                  : '/api/auth/forgot-password';

            const { phoneCountry, phone, ...submissionValues } = values;

            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...submissionValues,
                phone: mode === 'register' ? `${phoneCountry ?? '+962'}${phone ?? ''}` : phone,
              }),
            });

            const payload = (await response.json()) as {
              error?: string;
              requiresEmailConfirmation?: boolean;
            };

            if (!response.ok) {
              setServerError(payload.error ?? 'Something went wrong');
              return;
            }

            if (mode === 'forgot-password') {
              setServerMessage('Password reset email sent.');
              return;
            }

            if (mode === 'register' && payload.requiresEmailConfirmation) {
              setServerMessage('Account created. Confirm your email, then sign in.');
              router.push(`/login?next=${encodeURIComponent(nextPath)}`);
              return;
            }

            router.push(nextPath);
            router.refresh();
          })}
          className="mt-8 space-y-4"
        >
          {mode === 'register' ? (
            <>
              <Field
                label={t('Full Name')}
                error={errors.fullName?.message ? t(errors.fullName.message) : undefined}
              >
                <input
                  {...register('fullName')}
                  type="text"
                  autoComplete="name"
                  maxLength={80}
                  required
                  className={`${inputClassName} ${errors.fullName ? 'border-[var(--error)]' : ''}`}
                  aria-invalid={Boolean(errors.fullName)}
                />
              </Field>
              <Field
                label={t('Phone')}
                error={
                  errors.phone?.message || errors.phoneCountry?.message
                    ? t((errors.phone?.message ?? errors.phoneCountry?.message) as string)
                    : undefined
                }
              >
                <div className="flex min-w-0 gap-2" dir="ltr">
                  <input type="hidden" {...register('phoneCountry')} />
                  <CountryCodeSelect
                    value={watch('phoneCountry') ?? '+962'}
                    onChange={(value) =>
                      setValue('phoneCountry', value, { shouldValidate: true, shouldTouch: true })
                    }
                  />
                  <input
                    {...register('phone')}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={12}
                    placeholder={t('Phone number')}
                    className={`${inputClassName} min-w-0 flex-1 ${errors.phone ? 'border-[var(--error)]' : ''}`}
                    aria-invalid={Boolean(errors.phone)}
                  />
                </div>
              </Field>
            </>
          ) : null}
          <Field
            label={t('Email')}
            error={errors.email?.message ? t(errors.email.message) : undefined}
          >
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              className={`${inputClassName} ${errors.email ? 'border-[var(--error)]' : ''}`}
              aria-invalid={Boolean(errors.email)}
            />
          </Field>
          {mode !== 'forgot-password' ? (
            <Field
              label={t('Password')}
              error={errors.password?.message ? t(errors.password.message) : undefined}
            >
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  minLength={8}
                  maxLength={72}
                  required
                  className={`${inputClassName} pr-12 ${errors.password ? 'border-[var(--error)]' : ''}`}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-3 inline-flex items-center text-[var(--muted)] transition hover:text-[var(--text)]"
                  aria-label={showPassword ? t('Hide password') : t('Show password')}
                  title={showPassword ? t('Hide password') : t('Show password')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          ) : null}
          {serverError ? <p className="text-sm text-[var(--error)]">{t(serverError)}</p> : null}
          {serverMessage ? (
            <p className="text-sm text-[var(--success)]">{t(serverMessage)}</p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${primaryButtonClassName} w-full rounded-none`}
            style={getPrimaryButtonStyle(isDark)}
          >
            {isSubmitting
              ? t('PLEASE WAIT')
              : mode === 'login'
                ? t('LOG IN')
                : mode === 'register'
                  ? t('CREATE ACCOUNT')
                  : t('SEND RESET LINK')}
          </button>
        </form>
        <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          {mode !== 'login' ? (
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>
              {t('Already have an account? Sign in')}
            </Link>
          ) : null}
          {mode === 'login' ? (
            <Link href={`/register?next=${encodeURIComponent(nextPath)}`}>
              {t('Create account')}
            </Link>
          ) : null}
          {mode === 'login' ? <Link href="/forgot-password">{t('Forgot password?')}</Link> : null}
        </div>
      </div>
    </Container>
  );
}

export function AccountDashboardPageView({
  session,
  orderCount,
  favoriteCount,
  addressCount,
}: {
  session: CustomerSessionView;
  orderCount: number;
  favoriteCount: number;
  addressCount: number;
}) {
  const { t } = useLocale();

  return (
    <div className="bg-[var(--background)] text-[var(--text)]">
      <Container className="py-8 md:py-14">
        <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[0_24px_70px_rgba(24,18,17,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="relative overflow-hidden bg-black p-6 text-white md:p-8">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border-[36px] border-white/10" />
              <div className="absolute -bottom-28 left-1/2 h-72 w-72 rounded-full bg-black/10" />
              <div className="relative">
                <div className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  {t('CUSTOMER DASHBOARD')}
                </div>
                <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
                  {t('Welcome back')}, {session.fullName}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/78">
                  {t(
                    'Reorder your favorite devices and flavors, manage delivery addresses, and track every order from one place.'
                  )}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center rounded-full border border-white bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5"
                    style={{ color: '#111111' }}
                  >
                    {t('ORDER NOW')}
                  </Link>
                  <LogoutButton />
                </div>
              </div>
            </div>
            <div className="bg-[color:color-mix(in_srgb,var(--card)_86%,var(--accent)_8%)] p-6 md:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {t('Signed in as')}
              </div>
              <div className="mt-3 text-2xl font-bold text-[var(--text)]">{session.email}</div>
              {session.phone ? (
                <div className="mt-2 text-sm text-[var(--text-secondary)]">{session.phone}</div>
              ) : null}
              <div className="mt-7 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="flex items-center gap-3 text-sm font-semibold text-[var(--text-secondary)]">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  {t('Customer account is active and ready for orders.')}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            label={t('Orders')}
            value={String(orderCount)}
            icon={<Package className="h-5 w-5" />}
          />
          <MetricCard
            label={t('Favorites')}
            value={String(favoriteCount)}
            icon={<Heart className="h-5 w-5" />}
          />
          <MetricCard
            label={t('Addresses')}
            value={String(addressCount)}
            icon={<MapPin className="h-5 w-5" />}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AccountLinkCard
            href="/orders"
            title={t('My Orders')}
            body={t('Track placed orders, payment state, and delivery progress.')}
            icon={<Package className="h-5 w-5" />}
          />
          <AccountLinkCard
            href="/favorites"
            title={t('My Favorites')}
            body={t('Open your saved favorites and reorder the products you marked.')}
            icon={<Heart className="h-5 w-5" />}
          />
          <AccountLinkCard
            href="/addresses"
            title={t('My Addresses')}
            body={t('Review your saved delivery addresses for faster checkout.')}
            icon={<MapPin className="h-5 w-5" />}
          />
        </div>
      </Container>
    </div>
  );
}

export function OrdersPageView({ orders }: { orders: OrderView[] }) {
  const { t, locale } = useLocale();

  return (
    <Container className="orders-page py-7 md:py-12">
      <div className="orders-hero mb-8 flex flex-col justify-between gap-6 border-b border-[var(--border)] pb-8 md:mb-10 md:flex-row md:items-end">
        <div>
          <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
            PUFF JO / {t('ACCOUNT')}
          </div>
          <h1 className="font-display text-5xl uppercase leading-none md:text-7xl">
            {t('MY ORDERS')}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
            {t('Keep track of your Puff Jo orders, payment status, and delivery updates.')}
          </p>
        </div>
        <div className="flex items-center justify-between gap-5 sm:justify-end">
          <div className="orders-count">
            <span>{orders.length}</span> {t(orders.length === 1 ? 'order' : 'orders')}
          </div>
          <BackToAccountButton />
        </div>
      </div>
      {orders.length ? (
        <div className="orders-list grid gap-3">
          {orders.map((order, index) => (
            <Link key={order.id} href={`/order/${order.id}`} className="order-row group">
              <div className="order-index">{String(index + 1).padStart(2, '0')}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold tracking-[0.18em] text-[var(--muted)]">
                    {order.number}
                  </span>
                  <span className="order-status">{t(order.status.replaceAll('_', ' '))}</span>
                </div>
                <div className="mt-3 text-sm text-[var(--text-secondary)]">
                  {formatOrderDate(order.createdAt, locale)}
                </div>
              </div>
              <div className="order-meta hidden text-right text-xs text-[var(--text-secondary)] sm:block">
                <div>
                  {t('Payment status')}: <span>{t(order.paymentStatus ?? 'pending')}</span>
                </div>
                <div className="mt-1">
                  {t('Payment method')}: <span>{t(order.paymentMethod ?? 'cash_on_delivery')}</span>
                </div>
              </div>
              <div className="order-total">
                <span>{formatMoney(order.total, order.currency)}</span>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </div>
              <div className="order-mobile-meta mt-2 w-full text-xs text-[var(--text-secondary)] sm:hidden">
                {t('Payment status')}: {t(order.paymentStatus ?? 'pending')}
              </div>
              <div className="order-row-arrow">
                <ArrowLeft className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t('No orders yet.')}
          body={t(
            'When you place your first Puff Jo order, its delivery updates will show up here.'
          )}
          actionHref="/shop"
          actionLabel={t('SHOP NOW')}
        />
      )}
    </Container>
  );
}

export function OrderDetailPageView({ order }: { order: OrderView | null }) {
  const { t, locale } = useLocale();

  if (!order) {
    return (
      <Container className="py-8 md:py-14">
        <EmptyState
          title={t('Order not found.')}
          body={t('This order does not belong to the current account or is no longer available.')}
          actionHref="/orders"
          actionLabel={t('BACK TO ORDERS')}
        />
      </Container>
    );
  }

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title={order.number}
        description={t('Order details, payment state, and delivery information.')}
        action={<BackButton href="/account" label={t('BACK TO ACCOUNT')} />}
      />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <SurfacePanel title={t('Order status')}>
          <DetailRow label={t('Status')} value={t(order.status.replaceAll('_', ' '))} />
          <DetailRow label={t('Payment status')} value={t(order.paymentStatus ?? 'pending')} />
          <DetailRow
            label={t('Payment method')}
            value={t(order.paymentMethod ?? 'cash_on_delivery')}
          />
          <DetailRow label={t('Placed on')} value={formatOrderDate(order.createdAt, locale)} />
          <DetailRow label={t('Total')} value={formatMoney(order.total, order.currency)} />
        </SurfacePanel>
        <SurfacePanel title={t('Delivery')}>
          <DetailRow label={t('Customer name')} value={order.customerName ?? '-'} />
          <DetailRow label={t('Customer phone')} value={order.customerPhone ?? '-'} />
          <DetailRow label={t('Tracking number')} value={order.trackingNumber ?? '-'} />
          <DetailRow label={t('Shipping carrier')} value={order.shippingCarrier ?? '-'} />
          <DetailRow label={t('Notes')} value={order.notes ?? '-'} />
        </SurfacePanel>
      </div>
      <div className="mt-4">
        <SurfacePanel title={t('Order items')}>
          {order.items?.length ? (
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-[24px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--card)_84%,var(--background)_16%)] p-4 md:flex-row"
                >
                  <img
                    src={item.imageUrl || '/products/puff-jo-product-default.png'}
                    alt={item.productName}
                    className="h-32 w-full rounded-[18px] bg-[var(--background-secondary)] object-contain p-2 md:w-24"
                  />
                  <div className="flex-1">
                    <div className="text-lg font-medium">{t(item.productName)}</div>
                    <div className="mt-2 grid gap-2 text-sm text-[var(--text-secondary)] md:grid-cols-2">
                      <div>
                        {t('Size')}: {item.sizeName ?? '-'}
                      </div>
                      <div>
                        {t('Quantity')}: {item.quantity}
                      </div>
                      <div>
                        {t('SKU')}: {item.sku ?? '-'}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4 text-sm">
                      <div>
                        {t('Unit price')}:{' '}
                        <span className="text-[var(--text)]">
                          {formatMoney(item.unitPrice, order.currency)}
                        </span>
                      </div>
                      <div>
                        {t('Line total')}:{' '}
                        <span className="text-[var(--text)]">
                          {formatMoney(item.lineTotal, order.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-[var(--text-secondary)]">{t('No order items found.')}</div>
          )}
        </SurfacePanel>
      </div>
    </Container>
  );
}

export function FavoritesPageView({ products }: { products: StoreProduct[] }) {
  const { t } = useLocale();
  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title={t('FAVORITES')}
        description={t('The Puff Jo gear and flavors you saved for your next order.')}
        action={<BackToAccountButton />}
      />
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState
          title={t('Nothing saved yet.')}
          body={t(
            'Nothing saved yet. Tap the heart on a device or flavor to find it here next time.'
          )}
          actionHref="/shop"
          actionLabel={t('VIEW MENU')}
        />
      )}
    </Container>
  );
}

export function AddressesPageView({ addresses }: { addresses: AddressView[] }) {
  const { t } = useLocale();
  const router = useRouter();
  const [deletingAddressId, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState('');

  function handleDelete(addressId: string) {
    setDeleteError('');
    startDeleteTransition(async () => {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setDeleteError(t(payload?.error ?? 'Something went wrong'));
        return;
      }

      router.refresh();
    });
  }

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title={t('ADDRESSES')}
        description={t('Review the delivery details saved to your customer account.')}
        action={
          <ActionRow>
            <BackToAccountButton />
            <PrimaryLink href="/addresses/new" label={t('ADD ADDRESS')} />
          </ActionRow>
        }
      />
      {deleteError ? (
        <div className="mb-4 rounded-[20px] border border-[var(--error)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--error)]">
          {deleteError}
        </div>
      ) : null}
      {addresses.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className={accountPanelClassName}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold uppercase">{address.label}</div>
                {address.isDefault ? (
                  <div className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                    {t('Default')}
                  </div>
                ) : null}
              </div>
              <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                <div>{address.fullName}</div>
                <div>{address.phone}</div>
                <div>
                  {address.city}
                  {address.area ? `, ${address.area}` : ''}
                </div>
                {address.street ? <div>{address.street}</div> : null}
                {address.building ? <div>{address.building}</div> : null}
              </div>
              <div className="mt-5 flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
                <Link href={`/address/${address.id}/edit`} className={secondaryButtonClassName}>
                  <span className="inline-flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    {t('EDIT')}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(address.id)}
                  disabled={deletingAddressId}
                  className={secondaryButtonClassName}
                >
                  <span className="inline-flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    {deletingAddressId ? t('PLEASE WAIT') : t('REMOVE')}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t('No saved addresses.')}
          body={t('Add your first address so checkout and delivery details are ready.')}
          actionHref="/addresses/new"
          actionLabel={t('ADD ADDRESS')}
        />
      )}
    </Container>
  );
}

export function ProfilePageView({ session }: { session: CustomerSessionView }) {
  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title="PROFILE"
        description="Account identity and contact details linked to this customer session."
        action={<BackToAccountButton />}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <SurfacePanel title="Full name">
          <p className="text-lg">{session.fullName}</p>
        </SurfacePanel>
        <SurfacePanel title="Email">
          <p className="text-lg">{session.email}</p>
        </SurfacePanel>
        <SurfacePanel title="Phone">
          <p className="text-lg">{session.phone || '-'}</p>
        </SurfacePanel>
      </div>
    </Container>
  );
}

export function SettingsPageView({ session }: { session: CustomerSessionView }) {
  const { t } = useLocale();

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title="SETTINGS"
        description="Customer account controls, recovery, and communication preferences."
        action={
          <ActionRow>
            <BackToAccountButton />
            <LogoutButton />
          </ActionRow>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <SurfacePanel title="Security">
          <p className="text-sm leading-7 text-[var(--text-secondary)]">
            {t('Password resets are handled through the forgot password flow for this account.')}
          </p>
          <Link href="/forgot-password" className={secondaryButtonClassName}>
            {t('RESET PASSWORD')}
          </Link>
        </SurfacePanel>
        <SurfacePanel title="Profile status">
          <DetailRow label="Email" value={session.email} />
          <DetailRow label="Role" value={t(session.role ?? 'customer')} />
          <DetailRow label="Status" value={t('Active')} />
        </SurfacePanel>
      </div>
    </Container>
  );
}

export function NotificationsPageView() {
  const { t } = useLocale();
  const notifications = [
    'Your latest order status updates appear here.',
    'Favorites can trigger reminders when inventory gets low.',
    'Future shipping, payment, and delivery events can be listed here.',
  ];

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title="NOTIFICATIONS"
        description="A single stream for customer account and order events."
        action={<BackToAccountButton />}
      />
      <div className="space-y-4">
        {notifications.map((item) => (
          <div
            key={item}
            className={`${accountPanelClassName} text-sm text-[var(--text-secondary)]`}
          >
            {t(item)}
          </div>
        ))}
      </div>
    </Container>
  );
}

export function ReviewsPageView({ reviews }: { reviews: ReviewView[] }) {
  const { t } = useLocale();

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title="REVIEWS"
        description="Your product feedback and submitted ratings."
        action={<BackToAccountButton />}
      />
      {reviews.length ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className={accountPanelClassName}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold uppercase">{review.productName}</div>
                <div className="flex items-center gap-1 text-[var(--muted)]">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                {t(review.body)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No reviews yet."
          body="Submitted product feedback will appear here after review creation is connected."
          actionHref="/shop"
          actionLabel="SHOP NOW"
        />
      )}
    </Container>
  );
}

export function CreateAddressPageView({
  initialAddress,
  addressId,
  deliveryZones,
}: {
  initialAddress?: Partial<AddressView>;
  addressId?: string;
  deliveryZones: DeliveryZone[];
}) {
  const { t, localize } = useLocale();
  const { isDark } = useThemeMode();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const isEditMode = Boolean(addressId);
  const schema = z.object({
    label: z.string().min(2, 'This field is required'),
    fullName: z.string().min(2, 'This field is required'),
    phone: z.string().min(6, 'This field is required'),
    country: z.string().min(2, 'This field is required'),
    city: z.string().min(2, 'This field is required'),
    area: z.string().min(2, 'This field is required'),
    street: z.string().optional(),
    building: z.string().optional(),
    isDefault: z.boolean().optional(),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: initialAddress?.label ?? '',
      fullName: initialAddress?.fullName ?? '',
      phone: initialAddress?.phone ?? '',
      country: initialAddress?.country ?? '',
      city: initialAddress?.city ?? '',
      area: initialAddress?.area ?? '',
      street: initialAddress?.street ?? '',
      building: initialAddress?.building ?? '',
      isDefault: initialAddress?.isDefault ?? false,
    },
  });
  const selectedCountry = watch('country');
  const selectedCity = watch('city');
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
        .filter((zone) => zone.country === selectedCountry && zone.city)
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
    [deliveryZones, localize, selectedCountry]
  );

  useEffect(() => {
    if (!selectedCountry || cityOptions.length === 0) {
      return;
    }

    if (cityOptions.some((option) => option.value === selectedCity)) {
      return;
    }

    setValue('city', cityOptions[0]?.value ?? '', { shouldValidate: true });
  }, [cityOptions, selectedCity, selectedCountry, setValue]);

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title={isEditMode ? 'EDIT ADDRESS' : 'ADD ADDRESS'}
        description={
          isEditMode
            ? 'Update a saved delivery address for your account.'
            : 'Create a saved delivery address for your account.'
        }
        action={<BackButton href="/addresses" label="BACK TO ADDRESSES" />}
      />
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="relative overflow-hidden rounded-[34px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--card)_88%,var(--accent)_5%)] p-6 md:p-8">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: isDark
                ? 'radial-gradient(circle at top left, rgba(255,255,255,0.12), transparent 38%)'
                : 'radial-gradient(circle at top left, rgba(23,23,23,0.08), transparent 38%)',
            }}
          />
          <div className="relative">
            <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--muted)]">
              {t('Delivery')}
            </div>
            <h2 className="mt-4 font-display text-4xl uppercase leading-none md:text-5xl">
              {t(isEditMode ? 'Edit address details' : 'Address details')}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--text-secondary)]">
              {t(
                isEditMode
                  ? 'Update delivery details here so future checkout stays accurate and fast.'
                  : 'Save a complete delivery location so future checkout feels instant and accurate.'
              )}
            </p>
            <div className="mt-8 space-y-3">
              {[
                'Choose a clear label for home, office, or studio.',
                'Keep phone and area details accurate for delivery calls.',
                'Set one address as default to speed up checkout.',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-secondary)]"
                >
                  {t(item)}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-[34px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.12)] md:p-8">
          <form
            onSubmit={handleSubmit((values) =>
              startTransition(async () => {
                setServerError(null);
                const response = await fetch(
                  isEditMode ? `/api/addresses/${addressId}` : '/api/addresses',
                  {
                    method: isEditMode ? 'PATCH' : 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                  }
                );

                const payload = (await response.json()) as { error?: string };

                if (!response.ok) {
                  setServerError(payload.error ?? 'Something went wrong');
                  return;
                }

                // The addresses page is server-rendered, so replacing the form route
                // ensures the newly created address is loaded from Supabase.
                router.replace('/addresses');
                router.refresh();
              })
            )}
            className="grid gap-5"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label={t('Label')}
                error={errors.label?.message ? t(errors.label.message) : undefined}
              >
                <input
                  {...register('label')}
                  className={inputClassName}
                  placeholder={t('Home, Studio, Office')}
                />
              </Field>
              <Field
                label={t('Full Name')}
                error={errors.fullName?.message ? t(errors.fullName.message) : undefined}
              >
                <input
                  {...register('fullName')}
                  className={inputClassName}
                  placeholder={t('Full recipient name')}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label={t('Phone')}
                error={errors.phone?.message ? t(errors.phone.message) : undefined}
              >
                <input
                  {...register('phone')}
                  className={inputClassName}
                  placeholder={t('+962...')}
                />
              </Field>
              <Field
                label={t('Country')}
                error={errors.country?.message ? t(errors.country.message) : undefined}
              >
                <select
                  {...register('country')}
                  className={inputClassName}
                  onChange={(event) => {
                    setValue('country', event.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    setValue('city', '', {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                >
                  <option value="">{t('Select a country')}</option>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label={t('City')}
                error={errors.city?.message ? t(errors.city.message) : undefined}
              >
                <select {...register('city')} className={inputClassName}>
                  <option value="">{t('Select a city')}</option>
                  {cityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={t('Area')}
                error={errors.area?.message ? t(errors.area.message) : undefined}
              >
                <input {...register('area')} className={inputClassName} placeholder={t('Area')} />
              </Field>
              <Field
                label={t('Street')}
                error={errors.street?.message ? t(errors.street.message) : undefined}
              >
                <input
                  {...register('street')}
                  className={inputClassName}
                  placeholder={t('Street')}
                />
              </Field>
            </div>
            <Field
              label={t('Building')}
              error={errors.building?.message ? t(errors.building.message) : undefined}
            >
              <input
                {...register('building')}
                className={inputClassName}
                placeholder={t('Building, floor, apartment')}
              />
            </Field>
            <label className="flex items-center gap-3 rounded-[24px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--background)_80%,transparent)] px-4 py-4 text-sm text-[var(--text)]">
              <input
                type="checkbox"
                {...register('isDefault')}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span>{t('DefaultAddressSwitch')}</span>
            </label>
            {serverError ? <p className="text-sm text-[var(--error)]">{t(serverError)}</p> : null}
            <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-2">
              <BackButton href="/addresses" label="CANCEL" />
              <button
                type="submit"
                disabled={isSubmitting}
                className={primaryButtonClassName}
                style={getPrimaryButtonStyle(isDark)}
              >
                {isSubmitting ? t('PLEASE WAIT') : t(isEditMode ? 'SAVE CHANGES' : 'SAVE ADDRESS')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
}

function LogoutButton() {
  const { t } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/login');
          router.refresh();
        })
      }
      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50"
      disabled={isPending}
    >
      <span className="flex items-center justify-center gap-2 leading-none">
        <LogOut className="h-4 w-4 shrink-0" />
        <span>{isPending ? t('PLEASE WAIT') : t('SIGN OUT')}</span>
      </span>
    </button>
  );
}

function ActionRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

function BackToAccountButton() {
  return <BackButton href="/account" label="BACK TO ACCOUNT" />;
}

function BackButton({ href, label }: { href: string; label: string }) {
  const { t } = useLocale();
  const { isDark } = useThemeMode();

  return (
    <Link href={href} className={secondaryButtonClassName} style={getSecondaryButtonStyle(isDark)}>
      <ArrowLeft className="h-4 w-4" />
      {t(label)}
    </Link>
  );
}

function PrimaryLink({ href, label }: { href: string; label: string }) {
  const { t } = useLocale();
  const { isDark } = useThemeMode();

  return (
    <Link href={href} className={primaryButtonClassName} style={getPrimaryButtonStyle(isDark)}>
      {t(label)}
    </Link>
  );
}

function AccountLinkCard({
  href,
  title,
  body,
  icon,
}: {
  href: string;
  title: string;
  body: string;
  icon: ReactNode;
}) {
  const { t } = useLocale();

  return (
    <Link
      href={href}
      className="group rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_42px_rgba(24,18,17,0.06)] transition hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[0_24px_56px_rgba(24,18,17,0.1)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-2xl font-bold text-[var(--text)]">{t(title)}</div>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)] transition group-hover:bg-[var(--accent)] group-hover:text-white">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{t(body)}</p>
    </Link>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  const { t } = useLocale();

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_16px_42px_rgba(24,18,17,0.06)]">
      <div className="flex items-center justify-between gap-3 text-[var(--muted)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em]">{t(label)}</div>
        <div className="text-[var(--accent)]">{icon}</div>
      </div>
      <div className="mt-4 text-4xl font-bold text-[var(--text)]">{value}</div>
    </div>
  );
}

function SurfacePanel({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useLocale();

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_16px_42px_rgba(24,18,17,0.06)]">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {t(title)}
      </div>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const { t } = useLocale();

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3 text-sm last:border-b-0">
      <span className="text-[var(--text-secondary)]">{t(label)}</span>
      <span className="text-right font-semibold text-[var(--text)]">{value}</span>
    </div>
  );
}

function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
}) {
  const { t } = useLocale();
  const { isDark } = useThemeMode();

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-10 text-center shadow-[0_18px_48px_rgba(24,18,17,0.06)]">
      <div className="text-4xl font-bold text-[var(--text)]">{t(title)}</div>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">{t(body)}</p>
      <Link
        href={actionHref}
        className={`mt-6 inline-flex ${primaryButtonClassName}`}
        style={getPrimaryButtonStyle(isDark)}
      >
        {t(actionLabel)}
      </Link>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs tracking-[0.24em] text-[var(--muted)]">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs text-[var(--error)]">{error}</span> : null}
    </label>
  );
}

function formatMoney(amount: number, currency = 'JOD') {
  return new Intl.NumberFormat('en-JO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatOrderDate(value: string, locale: 'en' | 'ar') {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-JO', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

const inputClassName =
  'h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]';

const primaryButtonClassName =
  'inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50';

const secondaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]';

function getPrimaryButtonStyle(isDark: boolean) {
  return {
    backgroundColor: isDark ? '#111111' : '#111111',
    color: '#ffffff',
  };
}

function getSecondaryButtonStyle(isDark: boolean) {
  return {
    backgroundColor: isDark ? 'var(--card)' : 'var(--card)',
    color: isDark ? 'var(--text)' : 'var(--text)',
  };
}

const accountPanelClassName =
  'rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_16px_42px_rgba(24,18,17,0.06)] transition hover:border-[var(--accent)]';
