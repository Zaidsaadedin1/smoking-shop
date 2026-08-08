'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Bell, Heart, LogOut, MapPin, Package, Settings, ShieldCheck, Star, User2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLocale } from '@/components/storefront/locale-provider';
import { useThemeMode } from '@/components/storefront/theme-provider';
import { Container, ProductGrid, SectionHeading } from '@/components/storefront/storefront-sections';
import { StoreProduct } from '@/lib/commerce-types';

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

export function AuthPageView({
  mode,
}: {
  mode: 'login' | 'register' | 'forgot-password';
}) {
  const { t } = useLocale();
  const { isDark } = useThemeMode();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const schema = z.object({
    fullName: mode === 'register' ? z.string().min(2, 'This field is required') : z.string().optional(),
    phone: mode === 'register' ? z.string().min(6, 'This field is required') : z.string().optional(),
    email: z.string().email('Enter a valid email'),
    password: mode === 'forgot-password' ? z.string().optional() : z.string().min(6, 'Password must be at least 6 characters'),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <Container className="flex min-h-[70vh] items-center py-10">
      <div className="mx-auto w-full max-w-xl rounded-[36px] border border-white/8 bg-white/3 p-8 md:p-10">
        <div className="text-xs tracking-[0.25em] text-[var(--muted)]">{t('CUSTOMER ACCESS')}</div>
        <h1 className="mt-3 font-display text-5xl uppercase">
          {mode === 'login' ? t('LOG IN') : mode === 'register' ? t('CREATE ACCOUNT') : t('RESET PASSWORD')}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          {mode === 'login'
            ? t('Sign in to keep your bag, favorites, and orders in sync.')
            : mode === 'register'
              ? t('Create a customer account for orders, favorites, addresses, and faster checkout.')
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

            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(values),
            });

            const payload = (await response.json()) as { error?: string; requiresEmailConfirmation?: boolean };

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
              router.push('/login');
              return;
            }

            router.push('/account');
            router.refresh();
          })}
          className="mt-8 space-y-4"
        >
          {mode === 'register' ? (
            <>
              <Field label={t('Full Name')} error={errors.fullName?.message ? t(errors.fullName.message) : undefined}>
                <input {...register('fullName')} className={inputClassName} />
              </Field>
              <Field label={t('Phone')} error={errors.phone?.message ? t(errors.phone.message) : undefined}>
                <input {...register('phone')} className={inputClassName} />
              </Field>
            </>
          ) : null}
          <Field label={t('Email')} error={errors.email?.message ? t(errors.email.message) : undefined}>
            <input {...register('email')} className={inputClassName} />
          </Field>
          {mode !== 'forgot-password' ? (
            <Field label={t('Password')} error={errors.password?.message ? t(errors.password.message) : undefined}>
              <input type="password" {...register('password')} className={inputClassName} />
            </Field>
          ) : null}
          {serverError ? <p className="text-sm text-[var(--blush)]">{t(serverError)}</p> : null}
          {serverMessage ? <p className="text-sm text-[var(--blush)]">{t(serverMessage)}</p> : null}
          <button type="submit" disabled={isSubmitting} className={primaryButtonClassName} style={getPrimaryButtonStyle(isDark)}>
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
          {mode !== 'login' ? <Link href="/login">{t('Already have an account? Sign in')}</Link> : null}
          {mode === 'login' ? <Link href="/register">{t('Create account')}</Link> : null}
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
    <Container className="py-8 md:py-14">
      <SectionHeading
        eyebrow="CUSTOMER DASHBOARD"
        title="ACCOUNT"
        description="Your profile, saved pieces, delivery details, and order history are all in one place."
        action={<LogoutButton />}
      />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[30px] border border-white/8 bg-white/3 p-6">
          <div className="text-xs tracking-[0.24em] text-[var(--muted)]">{t('Signed in as')}</div>
          <div className="mt-3 font-display text-4xl uppercase">{session.fullName}</div>
          <div className="mt-2 text-sm text-[var(--text-secondary)]">{session.email}</div>
          {session.phone ? <div className="mt-1 text-sm text-[var(--text-secondary)]">{session.phone}</div> : null}
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <MetricCard label="Orders" value={String(orderCount)} icon={<Package className="h-4 w-4" />} />
            <MetricCard label="Favorites" value={String(favoriteCount)} icon={<Heart className="h-4 w-4" />} />
            <MetricCard label="Addresses" value={String(addressCount)} icon={<MapPin className="h-4 w-4" />} />
          </div>
        </div>
        <div className="rounded-[30px] border border-white/8 bg-white/3 p-6">
          <div className="text-xs tracking-[0.24em] text-[var(--muted)]">{t('Account status')}</div>
          <div className="mt-3 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <ShieldCheck className="h-4 w-4" />
            {t('Customer account is active and ready for orders.')}
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AccountLinkCard href="/profile" title="Profile" body="Update your contact details and account identity." icon={<User2 className="h-5 w-5" />} />
        <AccountLinkCard href="/orders" title="My Orders" body="Track placed orders, payment state, and delivery progress." icon={<Package className="h-5 w-5" />} />
        <AccountLinkCard href="/favorites" title="Favorites" body="Open your saved wishlist and revisit the products you marked." icon={<Heart className="h-5 w-5" />} />
        <AccountLinkCard href="/addresses" title="Addresses" body="Review your saved delivery addresses for faster checkout." icon={<MapPin className="h-5 w-5" />} />
        <AccountLinkCard href="/settings" title="Settings" body="Manage password recovery, communication preferences, and account actions." icon={<Settings className="h-5 w-5" />} />
        <AccountLinkCard href="/notifications" title="Notifications" body="See account events, order updates, and wishlist reminders." icon={<Bell className="h-5 w-5" />} />
      </div>
    </Container>
  );
}

export function OrdersPageView({ orders }: { orders: OrderView[] }) {
  const { t } = useLocale();

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title="MY ORDERS"
        description="Track every purchase, payment state, and delivery handoff."
        action={<BackToAccountButton />}
      />
      {orders.length ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/order/${order.id}`} className="block rounded-[28px] border border-white/8 bg-white/3 p-5 transition hover:border-white/20">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs tracking-[0.24em] text-[var(--muted)]">{order.number}</div>
                  <div className="mt-2 text-2xl font-semibold uppercase">{t(order.status.replaceAll('_', ' '))}</div>
                  <div className="mt-2 text-sm text-[var(--text-secondary)]">{order.createdAt}</div>
                </div>
                <div className="grid gap-2 text-sm text-[var(--text-secondary)] md:text-right">
                  <div>{t('Payment status')}: {t(order.paymentStatus ?? 'pending')}</div>
                  <div>{t('Payment method')}: {t(order.paymentMethod ?? 'cash_on_delivery')}</div>
                  <div className="text-white">{formatMoney(order.total, order.currency)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No orders yet." body="Your first order will appear here after checkout." actionHref="/shop" actionLabel="SHOP NOW" />
      )}
    </Container>
  );
}

export function OrderDetailPageView({ order }: { order: OrderView | null }) {
  const { t } = useLocale();

  if (!order) {
    return (
      <Container className="py-8 md:py-14">
        <EmptyState title="Order not found." body="This order does not belong to the current account or is no longer available." actionHref="/orders" actionLabel="BACK TO ORDERS" />
      </Container>
    );
  }

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title={order.number}
        description="Order details, payment state, and delivery information."
        action={<BackButton href="/account" label="BACK TO ACCOUNT" />}
      />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <SurfacePanel title="Order status">
          <DetailRow label="Status" value={t(order.status.replaceAll('_', ' '))} />
          <DetailRow label="Payment status" value={t(order.paymentStatus ?? 'pending')} />
          <DetailRow label="Payment method" value={t(order.paymentMethod ?? 'cash_on_delivery')} />
          <DetailRow label="Placed on" value={order.createdAt} />
          <DetailRow label="Total" value={formatMoney(order.total, order.currency)} />
        </SurfacePanel>
        <SurfacePanel title="Delivery">
          <DetailRow label="Customer name" value={order.customerName ?? '-'} />
          <DetailRow label="Customer phone" value={order.customerPhone ?? '-'} />
          <DetailRow label="Tracking number" value={order.trackingNumber ?? '-'} />
          <DetailRow label="Shipping carrier" value={order.shippingCarrier ?? '-'} />
          <DetailRow label="Notes" value={order.notes ?? '-'} />
        </SurfacePanel>
      </div>
      <div className="mt-4">
        <SurfacePanel title="Order items">
          {order.items?.length ? (
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 rounded-[24px] border border-white/8 bg-black/10 p-4 md:flex-row">
                  <img
                    src={item.imageUrl || '/products/product-placeholder.svg'}
                    alt={item.productName}
                    className="h-32 w-full rounded-[18px] object-cover md:w-24"
                  />
                  <div className="flex-1">
                    <div className="text-lg font-medium">{t(item.productName)}</div>
                    <div className="mt-2 grid gap-2 text-sm text-[var(--text-secondary)] md:grid-cols-2">
                      <div>{t('Color')}: {item.colorName ?? '-'}</div>
                      <div>{t('Size')}: {item.sizeName ?? '-'}</div>
                      <div>{t('Quantity')}: {item.quantity}</div>
                      <div>{t('SKU')}: {item.sku ?? '-'}</div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4 text-sm">
                      <div>{t('Unit price')}: <span className="text-[var(--text)]">{formatMoney(item.unitPrice, order.currency)}</span></div>
                      <div>{t('Line total')}: <span className="text-[var(--text)]">{formatMoney(item.lineTotal, order.currency)}</span></div>
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
  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title="FAVORITES"
        description="Saved products connected to your customer account."
        action={<BackToAccountButton />}
      />
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState title="Nothing saved yet." body="Tap the heart on any product to start building your wishlist." actionHref="/shop" actionLabel="VIEW PRODUCTS" />
      )}
    </Container>
  );
}

export function AddressesPageView({ addresses }: { addresses: AddressView[] }) {
  const { t } = useLocale();

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title="ADDRESSES"
        description="Review the shipping details saved to your customer account."
        action={
          <ActionRow>
            <BackToAccountButton />
            <PrimaryLink href="/addresses/new" label="ADD ADDRESS" />
          </ActionRow>
        }
      />
      {addresses.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-[28px] border border-white/8 bg-white/3 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold uppercase">{address.label}</div>
                {address.isDefault ? <div className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">{t('Default')}</div> : null}
              </div>
              <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                <div>{address.fullName}</div>
                <div>{address.phone}</div>
                <div>{address.city}{address.area ? `, ${address.area}` : ''}</div>
                {address.street ? <div>{address.street}</div> : null}
                {address.building ? <div>{address.building}</div> : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No saved addresses."
          body="Add your first address so checkout and delivery details are ready."
          actionHref="/addresses/new"
          actionLabel="ADD ADDRESS"
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
          <p className="text-sm leading-7 text-[var(--text-secondary)]">{t('Password resets are handled through the forgot password flow for this account.')}</p>
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
          <div key={item} className="rounded-[28px] border border-white/8 bg-white/3 p-5 text-sm text-[var(--text-secondary)]">
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
            <div key={review.id} className="rounded-[28px] border border-white/8 bg-white/3 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold uppercase">{review.productName}</div>
                <div className="flex items-center gap-1 text-[var(--muted)]">
                  {Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{t(review.body)}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No reviews yet." body="Submitted product feedback will appear here after review creation is connected." actionHref="/shop" actionLabel="SHOP NOW" />
      )}
    </Container>
  );
}

export function CreateAddressPageView() {
  const { t } = useLocale();
  const { isDark } = useThemeMode();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const schema = z.object({
    label: z.string().min(2, 'This field is required'),
    fullName: z.string().min(2, 'This field is required'),
    phone: z.string().min(6, 'This field is required'),
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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: '',
      fullName: '',
      phone: '',
      city: '',
      area: '',
      street: '',
      building: '',
      isDefault: false,
    },
  });

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        title="ADD ADDRESS"
        description="Create a saved delivery address for your account."
        action={<BackButton href="/addresses" label="BACK TO ADDRESSES" />}
      />
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="relative overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6 md:p-8">
          <div className="absolute inset-0 opacity-40" style={{ background: isDark ? 'radial-gradient(circle at top left, rgba(255,255,255,0.12), transparent 38%)' : 'radial-gradient(circle at top left, rgba(23,23,23,0.08), transparent 38%)' }} />
          <div className="relative">
            <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--muted)]">{t('Delivery')}</div>
            <h2 className="mt-4 font-display text-4xl uppercase leading-none md:text-5xl">{t('Address details')}</h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--text-secondary)]">
              {t('Save a complete delivery location so future checkout feels instant and accurate.')}
            </p>
            <div className="mt-8 space-y-3">
              {[
                'Choose a clear label for home, office, or studio.',
                'Keep phone and area details accurate for delivery calls.',
                'Set one address as default to speed up checkout.',
              ].map((item) => (
                <div key={item} className="rounded-[22px] border border-white/8 bg-black/15 px-4 py-3 text-sm text-[var(--text-secondary)]">
                  {t(item)}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-[34px] border border-white/8 bg-white/3 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.12)] md:p-8">
          <form
            onSubmit={handleSubmit((values) =>
              startTransition(async () => {
                setServerError(null);
                const response = await fetch('/api/addresses', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(values),
                });

                const payload = (await response.json()) as { error?: string };

                if (!response.ok) {
                  setServerError(payload.error ?? 'Something went wrong');
                  return;
                }

                router.push('/addresses');
                router.refresh();
              })
            )}
            className="grid gap-5"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('Label')} error={errors.label?.message ? t(errors.label.message) : undefined}>
                <input {...register('label')} className={inputClassName} placeholder={t('Home, Studio, Office')} />
              </Field>
              <Field label={t('Full Name')} error={errors.fullName?.message ? t(errors.fullName.message) : undefined}>
                <input {...register('fullName')} className={inputClassName} placeholder={t('Full recipient name')} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('Phone')} error={errors.phone?.message ? t(errors.phone.message) : undefined}>
                <input {...register('phone')} className={inputClassName} placeholder={t('+962...')} />
              </Field>
              <Field label={t('City')} error={errors.city?.message ? t(errors.city.message) : undefined}>
                <input {...register('city')} className={inputClassName} placeholder={t('City')} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('Area')} error={errors.area?.message ? t(errors.area.message) : undefined}>
                <input {...register('area')} className={inputClassName} placeholder={t('Area')} />
              </Field>
              <Field label={t('Street')} error={errors.street?.message ? t(errors.street.message) : undefined}>
                <input {...register('street')} className={inputClassName} placeholder={t('Street')} />
              </Field>
            </div>
            <Field label={t('Building')} error={errors.building?.message ? t(errors.building.message) : undefined}>
              <input {...register('building')} className={inputClassName} placeholder={t('Building, floor, apartment')} />
            </Field>
            <label className="flex items-center gap-3 rounded-[24px] border border-white/8 bg-[color:color-mix(in_srgb,var(--background)_80%,transparent)] px-4 py-4 text-sm text-[var(--text)]">
              <input type="checkbox" {...register('isDefault')} className="h-4 w-4 accent-[var(--text)]" />
              <span>{t('DefaultAddressSwitch')}</span>
            </label>
            {serverError ? <p className="text-sm text-[var(--blush)]">{t(serverError)}</p> : null}
            <div className="flex flex-wrap gap-3 border-t border-white/8 pt-2">
              <BackButton href="/addresses" label="CANCEL" />
              <button type="submit" disabled={isSubmitting} className={primaryButtonClassName} style={getPrimaryButtonStyle(isDark)}>
                {isSubmitting ? t('PLEASE WAIT') : t('SAVE ADDRESS')}
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
  const { isDark } = useThemeMode();
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
      className={`${secondaryButtonClassName} text-xs`}
      style={getSecondaryButtonStyle(isDark)}
      disabled={isPending}
    >
      <LogOut className="h-4 w-4" />
      {isPending ? t('PLEASE WAIT') : t('SIGN OUT')}
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
    <Link href={href} className="rounded-[28px] border border-white/8 bg-white/3 p-6 transition hover:border-white/20">
      <div className="flex items-center justify-between gap-3">
        <div className="font-display text-3xl uppercase">{t(title)}</div>
        <div className="text-[var(--muted)]">{icon}</div>
      </div>
      <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{t(body)}</p>
    </Link>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  const { t } = useLocale();

  return (
    <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3 text-[var(--muted)]">
        <div className="text-[10px] uppercase tracking-[0.2em]">{t(label)}</div>
        {icon}
      </div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function SurfacePanel({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useLocale();

  return (
    <div className="rounded-[28px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 text-xs tracking-[0.24em] text-[var(--muted)]">{t(title)}</div>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const { t } = useLocale();

  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 py-3 text-sm last:border-b-0">
      <span className="text-[var(--text-secondary)]">{t(label)}</span>
      <span className="text-right">{value}</span>
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
    <div className="rounded-[32px] border border-white/8 bg-white/3 p-10 text-center">
      <div className="font-display text-4xl uppercase">{t(title)}</div>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">{t(body)}</p>
      <Link href={actionHref} className={`mt-6 inline-flex ${primaryButtonClassName}`} style={getPrimaryButtonStyle(isDark)}>
        {t(actionLabel)}
      </Link>
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

function formatMoney(amount: number, currency = 'JOD') {
  return new Intl.NumberFormat('en-JO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

const inputClassName =
  'h-12 w-full rounded-full border border-white/10 bg-black/20 px-5 text-sm text-[var(--text)] outline-none';

const primaryButtonClassName =
  'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium tracking-[0.2em] disabled:opacity-50';

const secondaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium tracking-[0.2em]';

function getPrimaryButtonStyle(isDark: boolean) {
  return {
    backgroundColor: isDark ? '#f4f4f4' : '#171717',
    color: isDark ? '#080808' : '#f6f4f1',
  };
}

function getSecondaryButtonStyle(isDark: boolean) {
  return {
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(23,23,23,0.08)',
    color: isDark ? '#f4f4f4' : '#171717',
  };
}
