'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Bell,
  Pencil,
  Heart,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  Settings,
  Star,
  Trash2,
  UserRound,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Alert,
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  Grid,
  Group,
  Image,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useLocale } from '@/components/storefront/locale-provider';
import { useThemeMode } from '@/components/storefront/theme-provider';
import {
  StorePasswordInput,
  StoreSelect,
  StoreTextInput,
} from '@/components/storefront/ui/store-form-controls';
import { StorePageContainer, StorePageHeader } from '@/components/storefront/ui/store-layout';
import {
  DashboardBackButton,
  DashboardDetailRow,
  DashboardEmptyState,
  DashboardLinkCard,
  DashboardMetric,
  DashboardPage,
  DashboardPanel,
  DashboardPrimaryButton,
} from '@/components/storefront/ui/dashboard-ui';
import { ProductGrid } from '@/components/storefront/storefront-sections';
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
    identifier:
      mode === 'login'
        ? z
            .string()
            .trim()
            .min(1, 'Enter your email or phone number')
            .max(254, 'Email or phone number is too long')
        : z.string().optional(),
    email:
      mode === 'login'
        ? z.string().optional()
        : z.string().trim().email('Enter a valid email').max(254, 'Email is too long'),
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phoneCountry: '+962' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  return (
    <StorePageContainer size="xs" py={{ base: 40, sm: 64 }}>
      <Paper
        radius={32}
        p={{ base: 24, sm: 40 }}
        withBorder
        shadow="lg"
        w="100%"
        maw={480}
        mx="auto"
      >
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

            const { phoneCountry, phone, identifier, ...submissionValues } = values;

            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...submissionValues,
                ...(mode === 'login' ? { identifier } : {}),
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
          style={{ maxWidth: 440 }}
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
                  <Controller
                    name="phoneCountry"
                    control={control}
                    render={({ field }) => (
                      <StoreSelect
                        label={t('Country code')}
                        aria-label={t('Country code')}
                        data={phoneCountries.map((country) => ({
                          value: country.code,
                          label: `${country.code} · ${locale === 'ar' ? country.nameAr : country.name}`,
                        }))}
                        value={field.value ?? '+962'}
                        onChange={(value) => field.onChange(value ?? '+962')}
                        onBlur={field.onBlur}
                        error={
                          errors.phoneCountry?.message ? t(errors.phoneCountry.message) : undefined
                        }
                        style={{ width: 172, flexShrink: 0 }}
                      />
                    )}
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
              label={t(mode === 'login' ? 'Email or phone number' : 'Email')}
              error={
                (errors.identifier?.message ?? errors.email?.message)
                  ? t((errors.identifier?.message ?? errors.email?.message) as string)
                  : undefined
              }
              {...register(mode === 'login' ? 'identifier' : 'email')}
              type={mode === 'login' ? 'text' : 'email'}
              autoComplete={mode === 'login' ? 'username' : 'email'}
              maxLength={254}
              placeholder={mode === 'login' ? t('Email or phone number') : undefined}
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
  const { t, locale, dir } = useLocale();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowLeft;

  const initials = session.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const accountLinks = [
    {
      href: '/orders',
      title: t('My Orders'),
      body: t('View your orders and track their current status.'),
      icon: <Package size={19} />,
    },
    {
      href: '/favorites',
      title: t('Favorites'),
      body: t('View products you saved for later.'),
      icon: <Heart size={19} />,
    },
    {
      href: '/addresses',
      title: t('Addresses'),
      body: t('Manage your saved delivery addresses.'),
      icon: <MapPin size={19} />,
    },
    {
      href: '/profile',
      title: t('Profile'),
      body: t('View your personal and contact information.'),
      icon: <UserRound size={19} />,
    },
    {
      href: '/notifications',
      title: t('Notifications'),
      body: t('View updates related to your account and orders.'),
      icon: <Bell size={19} />,
    },
    {
      href: '/reviews',
      title: t('Reviews'),
      body: t('View and manage your product reviews.'),
      icon: <Star size={19} />,
    },
    {
      href: '/settings',
      title: t('Settings'),
      body: t('Manage your account preferences and security.'),
      icon: <Settings size={19} />,
    },
  ];

  return (
    <DashboardPage
      title={t('My Account')}
      description={t('Manage your orders, favorites, addresses, and account details.')}
      action={<DashboardPrimaryButton href="/shop" label={t('Continue Shopping')} />}
    >
      {/* Account header */}
      <Paper withBorder radius="md" p={{ base: 'md', sm: 'lg' }}>
        <Group justify="space-between" align="center" gap="lg" wrap="wrap">
          <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
            <Avatar size={58} radius="xl" color="gray" variant="light">
              {initials}
            </Avatar>

            <Box style={{ minWidth: 0 }}>
              <Text size="xs" c="dimmed" mb={3}>
                {t('Welcome back')}
              </Text>

              <Title order={2} fz={{ base: 20, sm: 22 }} fw={700} lineClamp={1}>
                {session.fullName}
              </Title>

              <Text mt={3} size="sm" c="dimmed" lineClamp={1} style={{ overflowWrap: 'anywhere' }}>
                {session.email}
              </Text>
            </Box>
          </Group>

          <LogoutButton />
        </Group>
      </Paper>

      {/* Stats */}
      <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="sm" mt="md">
        <Paper withBorder radius="md" p="md">
          <Group justify="space-between" wrap="nowrap">
            <Box>
              <Text size="xs" c="dimmed">
                {t('Orders')}
              </Text>

              <Text mt={4} fw={700} fz={22}>
                {orderCount}
              </Text>
            </Box>

            <Box
              w={36}
              h={36}
              style={{
                display: 'grid',
                placeItems: 'center',
                borderRadius: 'var(--mantine-radius-md)',
                background: 'var(--mantine-color-default-hover)',
              }}
            >
              <Package size={17} />
            </Box>
          </Group>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Group justify="space-between" wrap="nowrap">
            <Box>
              <Text size="xs" c="dimmed">
                {t('Favorites')}
              </Text>

              <Text mt={4} fw={700} fz={22}>
                {favoriteCount}
              </Text>
            </Box>

            <Box
              w={36}
              h={36}
              style={{
                display: 'grid',
                placeItems: 'center',
                borderRadius: 'var(--mantine-radius-md)',
                background: 'var(--mantine-color-default-hover)',
              }}
            >
              <Heart size={17} />
            </Box>
          </Group>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Group justify="space-between" wrap="nowrap">
            <Box>
              <Text size="xs" c="dimmed">
                {t('Addresses')}
              </Text>

              <Text mt={4} fw={700} fz={22}>
                {addressCount}
              </Text>
            </Box>

            <Box
              w={36}
              h={36}
              style={{
                display: 'grid',
                placeItems: 'center',
                borderRadius: 'var(--mantine-radius-md)',
                background: 'var(--mantine-color-default-hover)',
              }}
            >
              <MapPin size={17} />
            </Box>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Account navigation */}
      <Box mt={{ base: 28, sm: 32 }}>
        <Title order={2} fz={19} fw={700} mb="md">
          {t('Account')}
        </Title>

        <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
          <Stack gap={0}>
            {accountLinks.map((item, index) => (
              <Box
                key={item.href}
                component={Link}
                href={item.href}
                px={{ base: 'md', sm: 'lg' }}
                py="md"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  borderBottom:
                    index < accountLinks.length - 1
                      ? '1px solid var(--mantine-color-default-border)'
                      : undefined,
                  transition: 'background 150ms ease',
                }}
                className="hover:bg-[var(--mantine-color-default-hover)]"
              >
                <Group justify="space-between" align="center" wrap="nowrap" gap="md">
                  <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
                    <Box
                      w={38}
                      h={38}
                      style={{
                        flexShrink: 0,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 'var(--mantine-radius-md)',
                        background: 'var(--mantine-color-default-hover)',
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Box style={{ minWidth: 0 }}>
                      <Text fw={600} size="sm">
                        {item.title}
                      </Text>

                      <Text mt={2} size="xs" c="dimmed" lineClamp={1}>
                        {item.body}
                      </Text>
                    </Box>
                  </Group>

                  <Arrow size={17} />
                </Group>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Box>
    </DashboardPage>
  );
}

export function OrdersPageView({ orders }: { orders: OrderView[] }) {
  const { t, locale, dir } = useLocale();

  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <DashboardPage
      title={t('My Orders')}
      description={t('View your previous orders and track their payment and delivery status.')}
      action={
        <Group gap="sm">
          <Badge variant="light" color="gray" radius="sm">
            {orders.length} {t(orders.length === 1 ? 'order' : 'orders')}
          </Badge>

          <DashboardBackButton />
        </Group>
      }
    >
      {orders.length ? (
        <Paper
          withBorder
          radius="md"
          style={{
            overflow: 'hidden',
          }}
        >
          <Stack gap={0}>
            {orders.map((order, index) => (
              <Box
                key={order.id}
                component={Link}
                href={`/order/${order.id}`}
                px={{ base: 'md', sm: 'lg' }}
                py={{ base: 'md', sm: 18 }}
                style={{
                  display: 'block',
                  color: 'inherit',
                  textDecoration: 'none',
                  borderBottom:
                    index < orders.length - 1
                      ? '1px solid var(--mantine-color-default-border)'
                      : undefined,
                  transition: 'background-color 150ms ease',
                }}
                className="hover:bg-[var(--mantine-color-default-hover)]"
              >
                <Group justify="space-between" align="center" gap="lg" wrap="nowrap">
                  {/* Main order information */}
                  <Box
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Group gap="sm" align="center" wrap="wrap">
                      <Text fw={700} fz={{ base: 14, sm: 15 }}>
                        {order.number}
                      </Text>

                      <Badge size="sm" radius="sm" variant="light" color="gray" tt="capitalize">
                        {t(order.status.replaceAll('_', ' '))}
                      </Badge>
                    </Group>

                    <Text mt={4} size="xs" c="dimmed">
                      {formatOrderDate(order.createdAt, locale)}
                    </Text>

                    <Group mt="sm" wrap="wrap">
                      <Group gap={5}>
                        <Text size="xs" c="dimmed">
                          {t('Payment')}:
                        </Text>

                        <Text size="xs" fw={500}>
                          {t((order.paymentStatus ?? 'pending').replaceAll('_', ' '))}
                        </Text>
                      </Group>

                      <Group gap={5}>
                        <Text size="xs" c="dimmed">
                          {t('Method')}:
                        </Text>

                        <Text size="xs" fw={500}>
                          {t((order.paymentMethod ?? 'cash_on_delivery').replaceAll('_', ' '))}
                        </Text>
                      </Group>
                    </Group>
                  </Box>

                  {/* Price */}
                  <Stack
                    gap={5}
                    align="flex-end"
                    style={{
                      flexShrink: 0,
                    }}
                  >
                    <Text fw={700} fz={{ base: 14, sm: 16 }}>
                      {formatMoney(order.total, order.currency, locale)}
                    </Text>

                    <Group gap={4} c="dimmed" wrap="nowrap">
                      <Text size="xs" visibleFrom="sm">
                        {t('View order')}
                      </Text>

                      <Arrow size={15} strokeWidth={1.8} />
                    </Group>
                  </Stack>
                </Group>
              </Box>
            ))}
          </Stack>
        </Paper>
      ) : (
        <Paper withBorder radius="md" py={{ base: 48, sm: 64 }} px="lg">
          <Stack align="center" ta="center" gap="md">
            <Box
              w={54}
              h={54}
              style={{
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                background: 'var(--mantine-color-default-hover)',
              }}
            >
              <Package size={22} strokeWidth={1.5} />
            </Box>

            <Box>
              <Title order={2} fz={{ base: 20, sm: 22 }}>
                {t('No orders yet')}
              </Title>

              <Text mt={6} size="sm" c="dimmed" maw={360}>
                {t('Your orders will appear here after you complete your first purchase.')}
              </Text>
            </Box>

            <Button component={Link} href="/shop" radius="md" color="dark" mt="xs">
              {t('Start Shopping')}
            </Button>
          </Stack>
        </Paper>
      )}
    </DashboardPage>
  );
}

export function OrderDetailPageView({ order }: { order: OrderView | null }) {
  const { t, locale } = useLocale();

  if (!order) {
    return (
      <DashboardPage title={t('Order not found')}>
        <Paper withBorder radius="md" py={{ base: 48, sm: 64 }} px="lg">
          <Stack align="center" ta="center" gap="md">
            <Box
              w={54}
              h={54}
              style={{
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                background: 'var(--mantine-color-default-hover)',
              }}
            >
              <Package size={22} strokeWidth={1.5} />
            </Box>

            <Box>
              <Title order={2} fz={{ base: 20, sm: 22 }}>
                {t('Order not found')}
              </Title>

              <Text mt={6} size="sm" c="dimmed" maw={380}>
                {t('This order does not belong to the current account or is no longer available.')}
              </Text>
            </Box>

            <Button component={Link} href="/orders" radius="md" color="dark">
              {t('Back to Orders')}
            </Button>
          </Stack>
        </Paper>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title={order.number}
      description={t(
        'View your order status, payment details, delivery information, and purchased items.'
      )}
      action={<DashboardBackButton />}
    >
      {/* Order overview */}
      <Paper withBorder radius="md" p={{ base: 'md', sm: 'lg' }} mb="md">
        <Group justify="space-between" align="flex-start" gap="lg" wrap="wrap">
          <Box>
            <Text size="xs" c="dimmed">
              {t('Placed on')}
            </Text>

            <Text mt={3} size="sm" fw={600}>
              {formatOrderDate(order.createdAt, locale)}
            </Text>
          </Box>

          <Group gap="xs" wrap="wrap">
            <Badge variant="light" color="gray" radius="sm" tt="capitalize">
              {t(order.status.replaceAll('_', ' '))}
            </Badge>

            <Badge
              variant="light"
              color={
                order.paymentStatus === 'paid'
                  ? 'green'
                  : order.paymentStatus === 'failed'
                    ? 'red'
                    : 'yellow'
              }
              radius="sm"
              tt="capitalize"
            >
              {t((order.paymentStatus ?? 'pending').replaceAll('_', ' '))}
            </Badge>
          </Group>
        </Group>
      </Paper>

      <Grid align="flex-start">
        {/* Main content */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="md">
            {/* Items */}
            <Paper withBorder radius="md">
              <Box
                px={{ base: 'md', sm: 'lg' }}
                py="md"
                style={{
                  borderBottom: '1px solid var(--mantine-color-default-border)',
                }}
              >
                <Title order={2} fz={17}>
                  {t('Order Items')}
                </Title>
              </Box>

              {order.items?.length ? (
                <Stack gap={0}>
                  {order.items.map((item, index) => (
                    <Box
                      key={item.id}
                      px={{ base: 'md', sm: 'lg' }}
                      py="md"
                      style={{
                        borderBottom:
                          index < order.items!.length - 1
                            ? '1px solid var(--mantine-color-default-border)'
                            : undefined,
                      }}
                    >
                      <Group align="flex-start" wrap="nowrap" gap="md">
                        <Image
                          src={item.imageUrl || '/products/puff-jo-product-default.png'}
                          alt={item.productName}
                          w={{ base: 74, sm: 92 }}
                          h={{ base: 74, sm: 92 }}
                          radius="sm"
                          fit="contain"
                          p={6}
                          fallbackSrc="/products/puff-jo-product-default.png"
                          style={{
                            flexShrink: 0,
                            background: 'var(--mantine-color-default-hover)',
                          }}
                        />

                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Group justify="space-between" align="flex-start" gap="md" wrap="nowrap">
                            <Box style={{ minWidth: 0 }}>
                              <Text fw={600} size="sm" lineClamp={2}>
                                {t(item.productName)}
                              </Text>

                              <Group mt={5} gap="sm" wrap="wrap">
                                {item.sizeName?.trim() ? (
                                  <Text size="xs" c="dimmed">
                                    {t('Size')}: {item.sizeName}
                                  </Text>
                                ) : null}

                                {item.colorName?.trim() ? (
                                  <Text size="xs" c="dimmed">
                                    {t('Color')}: {item.colorName}
                                  </Text>
                                ) : null}

                                {item.sku?.trim() ? (
                                  <Text size="xs" c="dimmed">
                                    {t('SKU')}: {item.sku}
                                  </Text>
                                ) : null}
                              </Group>

                              <Text mt={5} size="xs" c="dimmed">
                                {t('Quantity')}: {item.quantity}
                              </Text>
                            </Box>

                            <Text fw={700} size="sm" style={{ flexShrink: 0 }}>
                              {formatMoney(item.lineTotal, order.currency, locale)}
                            </Text>
                          </Group>

                          <Text mt="sm" size="xs" c="dimmed">
                            {formatMoney(item.unitPrice, order.currency, locale)} × {item.quantity}
                          </Text>
                        </Box>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box p="lg">
                  <Text size="sm" c="dimmed">
                    {t('No order items found.')}
                  </Text>
                </Box>
              )}
            </Paper>

            {/* Delivery information */}
            <Paper withBorder radius="md">
              <Box
                px={{ base: 'md', sm: 'lg' }}
                py="md"
                style={{
                  borderBottom: '1px solid var(--mantine-color-default-border)',
                }}
              >
                <Title order={2} fz={17}>
                  {t('Delivery Information')}
                </Title>
              </Box>

              <Stack gap={0} px={{ base: 'md', sm: 'lg' }}>
                <Box
                  py="md"
                  style={{
                    borderBottom: '1px solid var(--mantine-color-default-border)',
                  }}
                >
                  <Text size="xs" c="dimmed" mb={4}>
                    {t('Customer name')}
                  </Text>
                  <Text size="sm" fw={600}>
                    {order.customerName || '-'}
                  </Text>
                </Box>

                <Box
                  py="md"
                  style={{
                    borderBottom: '1px solid var(--mantine-color-default-border)',
                  }}
                >
                  <Text size="xs" c="dimmed" mb={4}>
                    {t('Customer phone')}
                  </Text>
                  <Text size="sm" fw={600}>
                    {order.customerPhone || '-'}
                  </Text>
                </Box>

                {order.trackingNumber ? (
                  <Box
                    py="md"
                    style={{
                      borderBottom: '1px solid var(--mantine-color-default-border)',
                    }}
                  >
                    <Text size="xs" c="dimmed" mb={4}>
                      {t('Tracking number')}
                    </Text>
                    <Text size="sm" fw={600}>
                      {order.trackingNumber}
                    </Text>
                  </Box>
                ) : null}

                {order.shippingCarrier ? (
                  <Box
                    py="md"
                    style={{
                      borderBottom: order.notes
                        ? '1px solid var(--mantine-color-default-border)'
                        : undefined,
                    }}
                  >
                    <Text size="xs" c="dimmed" mb={4}>
                      {t('Shipping carrier')}
                    </Text>
                    <Text size="sm" fw={600}>
                      {order.shippingCarrier}
                    </Text>
                  </Box>
                ) : null}

                {order.notes ? (
                  <Box py="md">
                    <Text size="xs" c="dimmed" mb={4}>
                      {t('Notes')}
                    </Text>
                    <Text size="sm">{order.notes}</Text>
                  </Box>
                ) : null}
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        {/* Summary */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper
            withBorder
            radius="md"
            p={{ base: 'md', sm: 'lg' }}
            style={{
              position: 'sticky',
              top: 88,
            }}
          >
            <Title order={2} fz={17} mb="lg">
              {t('Order Summary')}
            </Title>

            <Stack gap="md">
              <Box>
                <Text size="xs" c="dimmed">
                  {t('Order number')}
                </Text>
                <Text mt={4} size="sm" fw={600}>
                  {order.number}
                </Text>
              </Box>

              <Box>
                <Text size="xs" c="dimmed">
                  {t('Payment method')}
                </Text>
                <Text mt={4} size="sm" fw={600}>
                  {t((order.paymentMethod ?? 'cash_on_delivery').replaceAll('_', ' '))}
                </Text>
              </Box>

              <Box>
                <Text size="xs" c="dimmed">
                  {t('Payment status')}
                </Text>
                <Text mt={4} size="sm" fw={600}>
                  {t((order.paymentStatus ?? 'pending').replaceAll('_', ' '))}
                </Text>
              </Box>

              <Box
                pt="md"
                style={{
                  borderTop: '1px solid var(--mantine-color-default-border)',
                }}
              >
                <Group justify="space-between">
                  <Text fw={600}>{t('Total')}</Text>

                  <Text fw={700} fz={18}>
                    {formatMoney(order.total, order.currency, locale)}
                  </Text>
                </Group>
              </Box>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </DashboardPage>
  );
}

export function FavoritesPageView({ products }: { products: StoreProduct[] }) {
  const { t } = useLocale();
  return (
    <DashboardPage
      title={t('FAVORITES')}
      description={t('The Puff Jo gear and flavors you saved for your next order.')}
      action={<DashboardBackButton />}
    >
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <DashboardEmptyState
          title={t('Nothing saved yet.')}
          body={t(
            'Nothing saved yet. Tap the heart on a device or flavor to find it here next time.'
          )}
          actionHref="/shop"
          actionLabel={t('VIEW MENU')}
        />
      )}
    </DashboardPage>
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
    <DashboardPage
      title={t('ADDRESSES')}
      description={t('Review the delivery details saved to your customer account.')}
      action={
        <Group>
          <DashboardBackButton />
          <DashboardPrimaryButton href="/addresses/new" label="ADD ADDRESS" />
        </Group>
      }
    >
      {deleteError ? (
        <Alert color="red" mb="md">
          {deleteError}
        </Alert>
      ) : null}
      {addresses.length ? (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {addresses.map((address) => (
            <DashboardPanel key={address.id}>
              <Group justify="space-between">
                <Title order={3} fz="lg">
                  {address.label}
                </Title>
                {address.isDefault ? <Badge variant="light">{t('Default')}</Badge> : null}
              </Group>
              <Stack gap={4} mt="md">
                <Text size="sm">{address.fullName}</Text>
                <Text size="sm" c="dimmed">
                  {address.phone}
                </Text>
                <Text size="sm" c="dimmed">
                  {[address.city, address.area, address.street, address.building]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              </Stack>
              <Group
                mt="lg"
                pt="md"
                style={{
                  borderTop: '1px solid var(--mantine-color-default-border)',
                }}
              >
                <Button
                  component={Link}
                  href={`/address/${address.id}/edit`}
                  variant="default"
                  radius="xl"
                  leftSection={<Pencil size={16} />}
                >
                  {t('EDIT')}
                </Button>
                <Button
                  variant="subtle"
                  color="red"
                  radius="xl"
                  leftSection={<Trash2 size={16} />}
                  onClick={() => handleDelete(address.id)}
                  loading={deletingAddressId}
                >
                  {t('REMOVE')}
                </Button>
              </Group>
            </DashboardPanel>
          ))}
        </SimpleGrid>
      ) : (
        <DashboardEmptyState
          title={t('No saved addresses.')}
          body={t('Add your first address so checkout and delivery details are ready.')}
          actionHref="/addresses/new"
          actionLabel={t('ADD ADDRESS')}
        />
      )}
    </DashboardPage>
  );
}

export function ProfilePageView({ session }: { session: CustomerSessionView }) {
  const { t } = useLocale();

  const initials = session.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <DashboardPage
      title={t('Profile')}
      description={t('Manage the personal and contact information connected to your account.')}
      action={<DashboardBackButton />}
    >
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing={{ base: 'md', md: 'lg' }}>
        {/* Profile summary */}
        <Paper withBorder radius="md" p="lg">
          <Stack align="center" gap="sm" ta="center">
            <Box
              w={72}
              h={72}
              style={{
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                background: 'var(--mantine-color-default-hover)',
                border: '1px solid var(--mantine-color-default-border)',
              }}
            >
              <Text fw={700} fz={22}>
                {initials || 'U'}
              </Text>
            </Box>

            <Box>
              <Text fw={700} fz={18}>
                {session.fullName}
              </Text>

              <Text
                mt={3}
                size="sm"
                c="dimmed"
                style={{
                  overflowWrap: 'anywhere',
                }}
              >
                {session.email}
              </Text>
            </Box>
          </Stack>
        </Paper>

        {/* Account details */}
        <Paper
          withBorder
          radius="md"
          p={{ base: 'md', sm: 'lg' }}
          style={{
            gridColumn: 'span 2',
          }}
        >
          <Text fw={700} fz={17} mb="lg">
            {t('Account details')}
          </Text>

          <Stack gap={0}>
            <Box
              py="md"
              style={{
                borderBottom: '1px solid var(--mantine-color-default-border)',
              }}
            >
              <Text size="xs" c="dimmed" mb={5}>
                {t('Full name')}
              </Text>

              <Text fw={600} size="sm">
                {session.fullName}
              </Text>
            </Box>

            <Box
              py="md"
              style={{
                borderBottom: '1px solid var(--mantine-color-default-border)',
              }}
            >
              <Text size="xs" c="dimmed" mb={5}>
                {t('Email address')}
              </Text>

              <Text
                fw={600}
                size="sm"
                style={{
                  overflowWrap: 'anywhere',
                }}
              >
                {session.email}
              </Text>
            </Box>

            <Box py="md">
              <Text size="xs" c="dimmed" mb={5}>
                {t('Phone number')}
              </Text>

              <Text fw={600} size="sm" c={session.phone ? undefined : 'dimmed'}>
                {session.phone || t('Not added')}
              </Text>
            </Box>
          </Stack>
        </Paper>
      </SimpleGrid>
    </DashboardPage>
  );
}

export function SettingsPageView({ session }: { session: CustomerSessionView }) {
  const { t } = useLocale();

  return (
    <DashboardPage
      title={t('SETTINGS')}
      description={t('Customer account controls, recovery, and communication preferences.')}
      action={
        <Group>
          <DashboardBackButton />
          <LogoutButton />
        </Group>
      }
    >
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <DashboardPanel title={t('Security')}>
          <Text size="sm" c="dimmed" lh={1.7} mb="md">
            {t('Password resets are handled through the forgot password flow for this account.')}
          </Text>
          <Button component={Link} href="/forgot-password" variant="default" radius="xl">
            {t('RESET PASSWORD')}
          </Button>
        </DashboardPanel>
        <DashboardPanel title={t('Profile status')}>
          <DashboardDetailRow label={t('Email')} value={session.email} />
          <DashboardDetailRow label={t('Role')} value={t(session.role ?? 'customer')} />
          <DashboardDetailRow label={t('Status')} value={t('Active')} />
        </DashboardPanel>
      </SimpleGrid>
    </DashboardPage>
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
    <DashboardPage
      title={t('NOTIFICATIONS')}
      description={t('A single stream for customer account and order events.')}
      action={<DashboardBackButton />}
    >
      <Stack gap="md">
        {notifications.map((item) => (
          <DashboardPanel key={item}>
            <Text size="sm" c="dimmed">
              {t(item)}
            </Text>
          </DashboardPanel>
        ))}
      </Stack>
    </DashboardPage>
  );
}

export function ReviewsPageView({ reviews }: { reviews: ReviewView[] }) {
  const { t } = useLocale();

  return (
    <DashboardPage
      title={t('REVIEWS')}
      description={t('Your product feedback and submitted ratings.')}
      action={<DashboardBackButton />}
    >
      {reviews.length ? (
        <Stack gap="md">
          {reviews.map((review) => (
            <DashboardPanel key={review.id}>
              <Group justify="space-between">
                <Title order={3} fz="lg">
                  {review.productName}
                </Title>
                <Group gap={4} c="yellow.6">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} size={16} fill="currentColor" />
                  ))}
                </Group>
              </Group>
              <Text mt="md" size="sm" c="dimmed" lh={1.7}>
                {t(review.body)}
              </Text>
            </DashboardPanel>
          ))}
        </Stack>
      ) : (
        <DashboardEmptyState
          title={t('No reviews yet.')}
          body={t(
            'Submitted product feedback will appear here after review creation is connected.'
          )}
          actionHref="/shop"
          actionLabel="SHOP NOW"
        />
      )}
    </DashboardPage>
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
    control,
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
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <StoreSelect
                          label={t('Country')}
                          error={errors.country?.message ? t(errors.country.message) : undefined}
                          data={countryOptions}
                          placeholder={t('Select a country')}
                          value={field.value || null}
                          onBlur={field.onBlur}
                          onChange={(value) => {
                            field.onChange(value ?? '');
                            setValue('city', '', {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                        />
                      )}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <StoreSelect
                          label={t('City')}
                          error={errors.city?.message ? t(errors.city.message) : undefined}
                          data={cityOptions}
                          placeholder={t('Select a city')}
                          value={field.value || null}
                          onBlur={field.onBlur}
                          onChange={(value) => field.onChange(value ?? '')}
                          disabled={!selectedCountry || cityOptions.length === 0}
                        />
                      )}
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
    <Button
      variant="default"
      radius="xl"
      leftSection={<LogOut size={16} />}
      onClick={() =>
        startTransition(async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/login');
          router.refresh();
        })
      }
      loading={isPending}
    >
      {t('SIGN OUT')}
    </Button>
  );
}

function formatMoney(amount: number, currency = 'JOD', locale: 'en' | 'ar' = 'en') {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-JO', {
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
