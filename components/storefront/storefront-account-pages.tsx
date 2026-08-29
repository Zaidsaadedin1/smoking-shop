'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
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
import { ReactNode, useEffect, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Alert,
  Anchor,
  Box,
  Button,
  Checkbox,
  Grid,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useLocale } from '@/components/storefront/locale-provider';
import { useThemeMode } from '@/components/storefront/theme-provider';
import {
  StoreNativeSelect,
  StorePasswordInput,
  StoreTextInput,
} from '@/components/storefront/ui/store-form-controls';
import { StorePageContainer, StorePageHeader } from '@/components/storefront/ui/store-layout';
import {
  Container,
  ProductGrid,
  SectionHeading,
} from '@/components/storefront/storefront-sections';
import { DeliveryZone, StoreProduct } from '@/lib/commerce-types';
import { translateAuthError } from '@/lib/i18n';

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

export function AuthPageView({
  mode,
  nextPath = '/account',
}: {
  mode: 'login' | 'register' | 'forgot-password';
  nextPath?: string;
}) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

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
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phoneCountry: '+962' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  return (
    <StorePageContainer size="xs" py={{ base: 40, sm: 64 }}>
      <Paper radius={32} p={{ base: 24, sm: 40 }} withBorder shadow="lg" w="100%">
        <Text size="xs" c="dimmed" tt="uppercase" lts="0.25em">
          {t('CUSTOMER ACCESS')}
        </Text>
        <Title order={1} mt={12} fz={{ base: 38, sm: 50 }} tt="uppercase">
          {mode === 'login'
            ? t('LOG IN')
            : mode === 'register'
              ? t('CREATE ACCOUNT')
              : t('RESET PASSWORD')}
        </Title>
        <Text mt={12} size="sm" c="dimmed" lh={1.8}>
          {mode === 'login'
            ? t('Sign in to keep your bag, favorites, and orders in sync.')
            : mode === 'register'
              ? t(
                  'Create a customer account for orders, favorites, addresses, and faster checkout.'
                )
              : t('Send a password reset email to your account.')}
        </Text>
        <Box
          component="form"
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
              setServerError(
                payload.error
                  ? translateAuthError(payload.error, locale)
                  : t('Something went wrong')
              );
              return;
            }

            if (mode === 'forgot-password') {
              setServerMessage(t('Password reset email sent.'));
              return;
            }

            if (mode === 'register' && payload.requiresEmailConfirmation) {
              setServerMessage(t('Account created. Confirm your email, then sign in.'));
              router.push(`/login?next=${encodeURIComponent(nextPath)}`);
              return;
            }

            router.push(nextPath);
            router.refresh();
          })}
          mt={32}
        >
          <Stack gap="md">
            {mode === 'register' ? (
              <>
                <StoreTextInput
                  label={t('Full Name')}
                  error={errors.fullName?.message ? t(errors.fullName.message) : undefined}
                  {...register('fullName')}
                  autoComplete="name"
                  maxLength={80}
                  required
                />
                <Group align="flex-start" gap="sm" wrap="nowrap" dir="ltr">
                  <StoreNativeSelect
                    label={t('Country code')}
                    aria-label={t('Country code')}
                    data={phoneCountries.map((country) => ({
                      value: country.code,
                      label: `${country.code} · ${locale === 'ar' ? country.nameAr : country.name}`,
                    }))}
                    {...register('phoneCountry')}
                    error={
                      errors.phoneCountry?.message ? t(errors.phoneCountry.message) : undefined
                    }
                    styles={{ root: { width: 172, flexShrink: 0 } }}
                  />
                  <StoreTextInput
                    label={t('Phone')}
                    {...register('phone')}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={12}
                    placeholder={t('Phone number')}
                    error={errors.phone?.message ? t(errors.phone.message) : undefined}
                    styles={{ root: { flex: 1, minWidth: 0 } }}
                  />
                </Group>
              </>
            ) : null}
            <StoreTextInput
              label={t('Email')}
              error={errors.email?.message ? t(errors.email.message) : undefined}
              {...register('email')}
              type="email"
              autoComplete="email"
              maxLength={254}
              required
            />
            {mode !== 'forgot-password' ? (
              <StorePasswordInput
                label={t('Password')}
                error={errors.password?.message ? t(errors.password.message) : undefined}
                {...register('password')}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                minLength={8}
                maxLength={72}
                required
              />
            ) : null}
            {serverError ? (
              <Alert color="red" radius="md">
                {t(serverError)}
              </Alert>
            ) : null}
            {serverMessage ? (
              <Alert color="green" radius="md">
                {t(serverMessage)}
              </Alert>
            ) : null}
            <Button
              type="submit"
              loading={isSubmitting}
              fullWidth
              size="md"
              radius="xl"
              color="dark"
              tt="uppercase"
              lts="0.12em"
            >
              {isSubmitting
                ? t('PLEASE WAIT')
                : mode === 'login'
                  ? t('LOG IN')
                  : mode === 'register'
                    ? t('CREATE ACCOUNT')
                    : t('SEND RESET LINK')}
            </Button>
          </Stack>
        </Box>
        <Group mt={24} gap="md" wrap="wrap">
          {mode !== 'login' ? (
            <Anchor
              component={Link}
              size="xs"
              c="dimmed"
              tt="uppercase"
              lts="0.12em"
              href={`/login?next=${encodeURIComponent(nextPath)}`}
            >
              {t('Already have an account? Sign in')}
            </Anchor>
          ) : null}
          {mode === 'login' ? (
            <Anchor
              component={Link}
              size="xs"
              c="dimmed"
              tt="uppercase"
              lts="0.12em"
              href={`/register?next=${encodeURIComponent(nextPath)}`}
            >
              {t('Create account')}
            </Anchor>
          ) : null}
          {mode === 'login' ? (
            <Anchor
              component={Link}
              size="xs"
              c="dimmed"
              tt="uppercase"
              lts="0.12em"
              href="/forgot-password"
            >
              {t('Forgot password?')}
            </Anchor>
          ) : null}
        </Group>
      </Paper>
    </StorePageContainer>
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
    <Box component="div" className="bg-[var(--background)] text-[var(--text)]">
      <Container className="py-8 md:py-14">
        <Box
          component="section"
          className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[0_24px_70px_rgba(24,18,17,0.08)]"
        >
          <Box component="div" className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
            <Box
              component="div"
              className="relative overflow-hidden bg-black p-6 text-white md:p-8"
            >
              <Box
                component="div"
                className="absolute -right-20 -top-24 h-64 w-64 rounded-full border-[36px] border-white/10"
              />
              <Box
                component="div"
                className="absolute -bottom-28 left-1/2 h-72 w-72 rounded-full bg-black/10"
              />
              <Box component="div" className="relative">
                <Box
                  component="div"
                  className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80"
                >
                  {t('CUSTOMER DASHBOARD')}
                </Box>
                <Box component="h1" className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
                  {t('Welcome back')}, {session.fullName}
                </Box>
                <Box component="p" className="mt-4 max-w-2xl text-base leading-8 text-white/78">
                  {t(
                    'Reorder your favorite devices and flavors, manage delivery addresses, and track every order from one place.'
                  )}
                </Box>
                <Box component="div" className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center rounded-full border border-white bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5"
                    style={{ color: '#111111' }}
                  >
                    {t('ORDER NOW')}
                  </Link>
                  <LogoutButton />
                </Box>
              </Box>
            </Box>
            <Box
              component="div"
              className="bg-[color:color-mix(in_srgb,var(--card)_86%,var(--accent)_8%)] p-6 md:p-8"
            >
              <Box
                component="div"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
              >
                {t('Signed in as')}
              </Box>
              <Box component="div" className="mt-3 text-2xl font-bold text-[var(--text)]">
                {session.email}
              </Box>
              {session.phone ? (
                <Box component="div" className="mt-2 text-sm text-[var(--text-secondary)]">
                  {session.phone}
                </Box>
              ) : null}
              <Box
                component="div"
                className="mt-7 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <Box
                  component="div"
                  className="flex items-center gap-3 text-sm font-semibold text-[var(--text-secondary)]"
                >
                  <Box
                    component="span"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]"
                  >
                    <ShieldCheck className="h-5 w-5" />
                  </Box>
                  {t('Customer account is active and ready for orders.')}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box component="div" className="mt-6 grid gap-4 md:grid-cols-3">
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
        </Box>

        <Box component="div" className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        </Box>
      </Container>
    </Box>
  );
}

export function OrdersPageView({ orders }: { orders: OrderView[] }) {
  const { t, locale } = useLocale();

  return (
    <Container className="orders-page py-7 md:py-12">
      <Box
        component="div"
        className="orders-hero mb-8 flex flex-col justify-between gap-6 border-b border-[var(--border)] pb-8 md:mb-10 md:flex-row md:items-end"
      >
        <Box component="div">
          <Box
            component="div"
            className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]"
          >
            PUFF JO / {t('ACCOUNT')}
          </Box>
          <Box component="h1" className="font-display text-5xl uppercase leading-none md:text-7xl">
            {t('MY ORDERS')}
          </Box>
          <Box
            component="p"
            className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-secondary)]"
          >
            {t('Keep track of your Puff Jo orders, payment status, and delivery updates.')}
          </Box>
        </Box>
        <Box component="div" className="flex items-center justify-between gap-5 sm:justify-end">
          <Box component="div" className="orders-count">
            <Box component="span">{orders.length}</Box>{' '}
            {t(orders.length === 1 ? 'order' : 'orders')}
          </Box>
          <BackToAccountButton />
        </Box>
      </Box>
      {orders.length ? (
        <Box component="div" className="orders-list grid gap-3">
          {orders.map((order, index) => (
            <Link key={order.id} href={`/order/${order.id}`} className="order-row group">
              <Box component="div" className="order-index">
                {String(index + 1).padStart(2, '0')}
              </Box>
              <Box component="div" className="min-w-0 flex-1">
                <Box component="div" className="flex flex-wrap items-center gap-3">
                  <Box
                    component="span"
                    className="text-xs font-semibold tracking-[0.18em] text-[var(--muted)]"
                  >
                    {order.number}
                  </Box>
                  <Box component="span" className="order-status">
                    {t(order.status.replaceAll('_', ' '))}
                  </Box>
                </Box>
                <Box component="div" className="mt-3 text-sm text-[var(--text-secondary)]">
                  {formatOrderDate(order.createdAt, locale)}
                </Box>
              </Box>
              <Box
                component="div"
                className="order-meta hidden text-right text-xs text-[var(--text-secondary)] sm:block"
              >
                <Box component="div">
                  {t('Payment status')}:{' '}
                  <Box component="span">{t(order.paymentStatus ?? 'pending')}</Box>
                </Box>
                <Box component="div" className="mt-1">
                  {t('Payment method')}:{' '}
                  <Box component="span">{t(order.paymentMethod ?? 'cash_on_delivery')}</Box>
                </Box>
              </Box>
              <Box component="div" className="order-total">
                <Box component="span">{formatMoney(order.total, order.currency)}</Box>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Box>
              <Box
                component="div"
                className="order-mobile-meta mt-2 w-full text-xs text-[var(--text-secondary)] sm:hidden"
              >
                {t('Payment status')}: {t(order.paymentStatus ?? 'pending')}
              </Box>
              <Box component="div" className="order-row-arrow">
                <ArrowLeft className="h-4 w-4" />
              </Box>
            </Link>
          ))}
        </Box>
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
      <Box component="div" className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
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
          {order.trackingNumber ? (
            <DetailRow label={t('Tracking number')} value={order.trackingNumber} />
          ) : null}
          {order.shippingCarrier ? (
            <DetailRow label={t('Shipping carrier')} value={order.shippingCarrier} />
          ) : null}
          {order.notes ? <DetailRow label={t('Notes')} value={order.notes} /> : null}
        </SurfacePanel>
      </Box>
      <Box component="div" className="mt-4">
        <SurfacePanel title={t('Order items')}>
          {order.items?.length ? (
            <Box component="div" className="space-y-4">
              {order.items.map((item) => (
                <Box
                  component="div"
                  key={item.id}
                  className="flex flex-col rounded-[4px] border border-white/10 bg-[var(--background)] p-3 shadow-none transition duration-300 hover:-translate-y-0.5 hover:border-white/25"
                >
                  <Image
                    src={item.imageUrl || '/products/puff-jo-product-default.png'}
                    alt={item.productName}
                    className="h-52 w-full rounded-[3px] bg-[var(--background-secondary)] object-cover"
                  />
                  <Box component="div" className="flex-1 px-1 pb-1 pt-4">
                    <Box component="div" className="text-lg font-medium">
                      {t(item.productName)}
                    </Box>
                    <Box
                      component="div"
                      className="mt-2 grid gap-2 text-sm text-[var(--text-secondary)] md:grid-cols-2"
                    >
                      {item.sizeName?.trim() ? (
                        <Box component="div">
                          {t('Size')}: {item.sizeName}
                        </Box>
                      ) : null}
                      {item.colorName?.trim() ? (
                        <Box component="div">
                          {t('Color')}: {item.colorName}
                        </Box>
                      ) : null}
                      <Box component="div">
                        {t('Quantity')}: {item.quantity}
                      </Box>
                      {item.sku?.trim() ? (
                        <Box component="div">
                          {t('SKU')}: {item.sku}
                        </Box>
                      ) : null}
                    </Box>
                    <Box
                      component="div"
                      className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4 text-sm"
                    >
                      <Box component="div">
                        {t('Unit price')}:{' '}
                        <Box component="span" className="text-[var(--text)]">
                          {formatMoney(item.unitPrice, order.currency)}
                        </Box>
                      </Box>
                      <Box component="div">
                        {t('Line total')}:{' '}
                        <Box component="span" className="text-[var(--text)]">
                          {formatMoney(item.lineTotal, order.currency)}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box component="div" className="text-sm text-[var(--text-secondary)]">
              {t('No order items found.')}
            </Box>
          )}
        </SurfacePanel>
      </Box>
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
        <Box
          component="div"
          className="mb-4 rounded-[20px] border border-[var(--error)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--error)]"
        >
          {deleteError}
        </Box>
      ) : null}
      {addresses.length ? (
        <Box component="div" className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Box component="div" key={address.id} className={accountPanelClassName}>
              <Box component="div" className="flex items-center justify-between gap-3">
                <Box component="div" className="font-semibold uppercase">
                  {address.label}
                </Box>
                {address.isDefault ? (
                  <Box
                    component="div"
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
                  >
                    {t('Default')}
                  </Box>
                ) : null}
              </Box>
              <Box component="div" className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                <Box component="div">{address.fullName}</Box>
                <Box component="div">{address.phone}</Box>
                <Box component="div">
                  {address.city}
                  {address.area ? `, ${address.area}` : ''}
                </Box>
                {address.street ? <Box component="div">{address.street}</Box> : null}
                {address.building ? <Box component="div">{address.building}</Box> : null}
              </Box>
              <Box
                component="div"
                className="mt-5 flex flex-wrap gap-3 border-t border-[var(--border)] pt-4"
              >
                <Link href={`/address/${address.id}/edit`} className={secondaryButtonClassName}>
                  <Box component="span" className="inline-flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    {t('EDIT')}
                  </Box>
                </Link>
                <Box
                  component="button"
                  type="button"
                  onClick={() => handleDelete(address.id)}
                  disabled={deletingAddressId}
                  className={secondaryButtonClassName}
                >
                  <Box component="span" className="inline-flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    {deletingAddressId ? t('PLEASE WAIT') : t('REMOVE')}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
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
      <Box component="div" className="grid gap-4 lg:grid-cols-3">
        <SurfacePanel title="Full name">
          <Box component="p" className="text-lg">
            {session.fullName}
          </Box>
        </SurfacePanel>
        <SurfacePanel title="Email">
          <Box component="p" className="text-lg">
            {session.email}
          </Box>
        </SurfacePanel>
        <SurfacePanel title="Phone">
          <Box component="p" className="text-lg">
            {session.phone || '-'}
          </Box>
        </SurfacePanel>
      </Box>
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
      <Box component="div" className="grid gap-4 lg:grid-cols-2">
        <SurfacePanel title="Security">
          <Box component="p" className="text-sm leading-7 text-[var(--text-secondary)]">
            {t('Password resets are handled through the forgot password flow for this account.')}
          </Box>
          <Link href="/forgot-password" className={secondaryButtonClassName}>
            {t('RESET PASSWORD')}
          </Link>
        </SurfacePanel>
        <SurfacePanel title="Profile status">
          <DetailRow label="Email" value={session.email} />
          <DetailRow label="Role" value={t(session.role ?? 'customer')} />
          <DetailRow label="Status" value={t('Active')} />
        </SurfacePanel>
      </Box>
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
      <Box component="div" className="space-y-4">
        {notifications.map((item) => (
          <Box
            component="div"
            key={item}
            className={`${accountPanelClassName} text-sm text-[var(--text-secondary)]`}
          >
            {t(item)}
          </Box>
        ))}
      </Box>
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
        <Box component="div" className="space-y-4">
          {reviews.map((review) => (
            <Box component="div" key={review.id} className={accountPanelClassName}>
              <Box component="div" className="flex items-center justify-between gap-3">
                <Box component="div" className="font-semibold uppercase">
                  {review.productName}
                </Box>
                <Box component="div" className="flex items-center gap-1 text-[var(--muted)]">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </Box>
              </Box>
              <Box component="p" className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                {t(review.body)}
              </Box>
            </Box>
          ))}
        </Box>
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

  function submitAddress(values: FormValues) {
    startTransition(async () => {
      setServerError(null);
      const response = await fetch(isEditMode ? `/api/addresses/${addressId}` : '/api/addresses', {
        method: isEditMode ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setServerError(payload.error ?? 'Something went wrong');
        return;
      }

      router.replace('/addresses');
      router.refresh();
    });
  }

  return (
    <StorePageContainer>
      <StorePageHeader
        title={t(isEditMode ? 'EDIT ADDRESS' : 'ADD ADDRESS')}
        description={
          isEditMode
            ? t('Update a saved delivery address for your account.')
            : t('Create a saved delivery address for your account.')
        }
        action={
          <Button component={Link} href="/addresses" variant="default" radius="xl">
            {t('BACK TO ADDRESSES')}
          </Button>
        }
      />
      <Grid gap="md">
        <Grid.Col span={{ base: 12, xl: 5 }}>
          <Paper
            radius="xl"
            p={{ base: 'lg', md: 'xl' }}
            withBorder
            h="100%"
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: isDark
                ? 'radial-gradient(circle at top left, rgba(255,255,255,0.1), transparent 42%), var(--mantine-color-dark-8)'
                : 'radial-gradient(circle at top left, rgba(0,0,0,0.06), transparent 42%), var(--mantine-color-white)',
            }}
          >
            <Stack gap="lg" style={{ position: 'relative' }}>
              <Text size="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.3em' }}>
                {t('Delivery')}
              </Text>
              <Title
                order={2}
                tt="uppercase"
                style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', lineHeight: 1 }}
              >
                {t(isEditMode ? 'Edit address details' : 'Address details')}
              </Title>
              <Text size="sm" c="dimmed" maw={420} lh={1.8}>
                {t(
                  isEditMode
                    ? 'Update delivery details here so future checkout stays accurate and fast.'
                    : 'Save a complete delivery location so future checkout feels instant and accurate.'
                )}
              </Text>
              <Stack gap="sm">
                {[
                  'Choose a clear label for home, office, or studio.',
                  'Keep phone and area details accurate for delivery calls.',
                  'Set one address as default to speed up checkout.',
                ].map((item) => (
                  <Paper key={item} radius="md" p="md" withBorder>
                    <Text size="sm" c="dimmed">
                      {t(item)}
                    </Text>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xl: 7 }}>
          <Paper radius="xl" p={{ base: 'md', sm: 'lg', md: 'xl' }} withBorder>
            <Box component="form" onSubmit={handleSubmit(submitAddress)}>
              <Stack gap="md">
                <Grid gap="md">
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <StoreTextInput
                      label={t('Label')}
                      error={errors.label?.message ? t(errors.label.message) : undefined}
                      {...register('label')}
                      placeholder={t('Home, Studio, Office')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <StoreTextInput
                      label={t('Full Name')}
                      error={errors.fullName?.message ? t(errors.fullName.message) : undefined}
                      {...register('fullName')}
                      placeholder={t('Full recipient name')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <StoreTextInput
                      label={t('Phone')}
                      error={errors.phone?.message ? t(errors.phone.message) : undefined}
                      {...register('phone')}
                      placeholder={t('+962...')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <StoreNativeSelect
                      label={t('Country')}
                      error={errors.country?.message ? t(errors.country.message) : undefined}
                      {...register('country')}
                      data={[{ label: t('Select a country'), value: '' }, ...countryOptions]}
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
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <StoreNativeSelect
                      label={t('City')}
                      error={errors.city?.message ? t(errors.city.message) : undefined}
                      {...register('city')}
                      data={[{ label: t('Select a city'), value: '' }, ...cityOptions]}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <StoreTextInput
                      label={t('Area')}
                      error={errors.area?.message ? t(errors.area.message) : undefined}
                      {...register('area')}
                      placeholder={t('Area')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <StoreTextInput
                      label={t('Street')}
                      error={errors.street?.message ? t(errors.street.message) : undefined}
                      {...register('street')}
                      placeholder={t('Street')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <StoreTextInput
                      label={t('Building')}
                      error={errors.building?.message ? t(errors.building.message) : undefined}
                      {...register('building')}
                      placeholder={t('Building, floor, apartment')}
                    />
                  </Grid.Col>
                </Grid>
                <Checkbox
                  {...register('isDefault')}
                  label={t('DefaultAddressSwitch')}
                  radius="sm"
                  size="md"
                />
                {serverError ? <Alert color="red">{t(serverError)}</Alert> : null}
                <Group gap="sm" pt="xs">
                  <Button component={Link} href="/addresses" variant="default" radius="xl">
                    {t('CANCEL')}
                  </Button>
                  <Button type="submit" disabled={isSubmitting} radius="xl" loading={isSubmitting}>
                    {isSubmitting
                      ? t('PLEASE WAIT')
                      : t(isEditMode ? 'SAVE CHANGES' : 'SAVE ADDRESS')}
                  </Button>
                </Group>
              </Stack>
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>
    </StorePageContainer>
  );
}

function LogoutButton() {
  const { t } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Box
      component="button"
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
      <Box component="span" className="flex items-center justify-center gap-2 leading-none">
        <LogOut className="h-4 w-4 shrink-0" />
        <Box component="span">{isPending ? t('PLEASE WAIT') : t('SIGN OUT')}</Box>
      </Box>
    </Box>
  );
}

function ActionRow({ children }: { children: ReactNode }) {
  return (
    <Box component="div" className="flex flex-wrap items-center gap-3">
      {children}
    </Box>
  );
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
      <Box component="div" className="flex items-center justify-between gap-3">
        <Box component="div" className="text-2xl font-bold text-[var(--text)]">
          {t(title)}
        </Box>
        <Box
          component="div"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)] transition group-hover:bg-[var(--accent)] group-hover:text-white"
        >
          {icon}
        </Box>
      </Box>
      <Box component="p" className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
        {t(body)}
      </Box>
    </Link>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  const { t } = useLocale();

  return (
    <Box
      component="div"
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_16px_42px_rgba(24,18,17,0.06)]"
    >
      <Box component="div" className="flex items-center justify-between gap-3 text-[var(--muted)]">
        <Box component="div" className="text-[10px] font-semibold uppercase tracking-[0.18em]">
          {t(label)}
        </Box>
        <Box component="div" className="text-[var(--accent)]">
          {icon}
        </Box>
      </Box>
      <Box component="div" className="mt-4 text-4xl font-bold text-[var(--text)]">
        {value}
      </Box>
    </Box>
  );
}

function SurfacePanel({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useLocale();

  return (
    <Box
      component="div"
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_16px_42px_rgba(24,18,17,0.06)]"
    >
      <Box
        component="div"
        className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
      >
        {t(title)}
      </Box>
      {children}
    </Box>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const { t } = useLocale();

  return (
    <Box
      component="div"
      className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3 text-sm last:border-b-0"
    >
      <Box component="span" className="text-[var(--text-secondary)]">
        {t(label)}
      </Box>
      <Box component="span" className="text-right font-semibold text-[var(--text)]">
        {value}
      </Box>
    </Box>
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
    <Box
      component="div"
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-10 text-center shadow-[0_18px_48px_rgba(24,18,17,0.06)]"
    >
      <Box component="div" className="text-4xl font-bold text-[var(--text)]">
        {t(title)}
      </Box>
      <Box component="p" className="mt-3 text-sm text-[var(--text-secondary)]">
        {t(body)}
      </Box>
      <Link
        href={actionHref}
        className={`mt-6 inline-flex ${primaryButtonClassName}`}
        style={getPrimaryButtonStyle(isDark)}
      >
        {t(actionLabel)}
      </Link>
    </Box>
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
