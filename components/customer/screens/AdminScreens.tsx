'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  Group,
  Image,
  Modal,
  MultiSelect,
  NativeSelect,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import {
  IconAdjustments,
  IconEye,
  IconEyeOff,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { AdminShell } from '@/components/customer/AdminShell';
import { LocaleSwitcher, useLocale } from '@/components/storefront/locale-provider';
import {
  AdminBrandRecord,
  AdminCategoryRecord,
  AdminCouponRecord,
  AdminColorRecord,
  AdminCustomerRecord,
  AdminDeliveryZoneRecord,
  AdminFlashSaleRecord,
  AdminHeroSlideRecord,
  AdminNavigationItemRecord,
  AdminOrderRecord,
  AdminProductOptionGroupLinkRecord,
  AdminProductOptionGroupRecord,
  AdminProductOptionItemRecord,
  AdminProductOptionItemLinkRecord,
  AdminProductRecord,
  AdminProductVariantRecord,
  AdminSizeRecord,
} from '@/lib/admin/data';
import { AdminEnumKey, AdminEnumLabelRow, AdminEnumLabels } from '@/lib/admin/enum-labels';
import { formatCurrency } from '@/lib/commerce-utils';

type AdminSessionInfo = {
  fullName: string;
  email: string;
  role: 'admin' | 'super_admin';
};

type AdminOrderDetail = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: Record<string, unknown>;
  billing_address: Record<string, unknown> | null;
  subtotal: string | number;
  discount_amount: string | number;
  shipping_amount: string | number;
  tax_amount: string | number;
  total_amount: string | number;
  currency: string;
  coupon_code: string | null;
  notes: string | null;
  tracking_number: string | null;
  shipping_carrier: string | null;
  created_at: string;
  items?: Array<{
    id: string;
    product_id?: string | null;
    variant_id?: string | null;
    product_name: string;
    sku: string | null;
    size_name: string | null;
    color_name: string | null;
    image_url: string | null;
    options?: Record<string, unknown> | null;
    unit_price: string | number;
    quantity: number;
    line_total: string | number;
  }>;
};

type AdminEditableOrderItem = NonNullable<AdminOrderDetail['items']>[number];

type Option = {
  label: string;
  value: string;
};

type CrudField = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'switch' | 'file' | 'datetime';
  required?: boolean;
  editableOn?: Array<'create' | 'edit'>;
  options?: Option[];
  placeholder?: string;
  min?: number;
  step?: number;
  multiple?: boolean;
};

type CrudColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
};

type ModalErrorState = {
  title: string;
  messages: string[];
};

type FilePreviewItem = {
  id: string;
  url: string;
  name: string;
  isExisting: boolean;
};

type CrudManagerProps<T extends { id: string }> = {
  title: string;
  description: string;
  records: T[];
  columns: CrudColumn<T>[];
  fields: CrudField[];
  createLabel?: string;
  defaults: Record<string, unknown>;
  createRequest: { url: string; method: 'POST' };
  updateRequest: (id: string) => { url: string; method: 'PATCH' };
  deleteRequest: (id: string) => { url: string; method: 'DELETE' };
  drawerExtras?: (args: {
    mode: 'create' | 'edit' | 'view' | null;
    selected: T | null;
    setFormValue: (name: string, value: unknown) => void;
  }) => ReactNode;
  hideViewFields?: boolean;
  allowCreate?: boolean;
  allowDelete?: boolean;
};

const adminInputStyles = {
  input: {
    minHeight: 48,
    borderRadius: '0.35rem',
    background: 'var(--background)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
    paddingInline: '0.9rem',
    fontWeight: 600,
    transition: 'border-color 180ms ease, box-shadow 180ms ease',
    '&:focus': {
      borderColor: 'var(--accent)',
      boxShadow: '0 0 0 1px var(--accent)',
    },
  },
  label: {
    marginBottom: 8,
    color: 'var(--text)',
    fontSize: '0.7rem',
    fontWeight: 800,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  error: {
    marginTop: 4,
  },
} as const;

const adminSelectStyles = {
  input: {
    minHeight: 48,
    borderRadius: '0.35rem',
    background: 'var(--background)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
    paddingInline: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'border-color 180ms ease, box-shadow 180ms ease',
    '&:focus': {
      borderColor: 'var(--accent)',
      boxShadow: '0 0 0 1px var(--accent)',
    },
  },
  label: {
    marginBottom: 8,
    color: 'var(--text)',
    fontSize: '0.7rem',
    fontWeight: 800,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  section: {
    color: 'var(--muted)',
  },
} as const;

const adminPrimaryButtonStyles = {
  root: {
    background: 'var(--accent)',
    color: 'var(--background)',
    border: '1px solid var(--accent)',
    borderRadius: '999px',
  },
  label: {
    color: 'var(--background)',
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
} as const;

const adminSecondaryButtonStyles = {
  root: {
    background: 'var(--card)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: '999px',
  },
  label: {
    color: 'var(--text)',
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
} as const;

function toSnakeCase(value: string) {
  return value.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}

function getRowFieldValue(row: Record<string, unknown>, fieldName: string) {
  if (fieldName in row) {
    return row[fieldName];
  }

  const snakeCase = toSnakeCase(fieldName);
  if (snakeCase in row) {
    return row[snakeCase];
  }

  return undefined;
}

function formatDate(value: string) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function toDateTimeInputValue(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function buildSchema(fields: CrudField[], t: (value: string) => string) {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    if (field.type === 'file') {
      shape[field.name] = z.any().optional();
      return;
    }

    if (field.type === 'switch') {
      shape[field.name] = z.boolean().default(false);
      return;
    }

    if (field.type === 'number') {
      let schema = z.coerce.number({
        error: () => ({ message: t('Enter a valid number') }),
      });

      if (typeof field.min === 'number') {
        schema = schema.min(field.min, t('Value is too low'));
      }

      shape[field.name] = field.required ? schema : z.union([schema, z.literal('')]).optional();
      return;
    }

    const base = z.string();
    shape[field.name] = field.required
      ? base.trim().min(1, t('This field is required'))
      : base.optional();
  });

  // Order editing stores its product changes in a hidden form field.
  // Keep it in the resolver output so additions, removals, and quantities
  // are included in the PATCH payload.
  shape.items = z.any().optional();

  return z.object(shape);
}

function revokePreviewItems(items: FilePreviewItem[]) {
  items.forEach((item) => {
    if (!item.isExisting) {
      URL.revokeObjectURL(item.url);
    }
  });
}

function collectFormErrorMessages(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === 'object' && 'message' in value && typeof value.message === 'string') {
    return [value.message];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectFormErrorMessages(entry));
  }

  if (typeof value === 'object') {
    return Object.values(value).flatMap((entry) => collectFormErrorMessages(entry));
  }

  return [];
}

function openFieldErrorModal(
  errors: unknown,
  setModalError: (value: ModalErrorState) => void,
  title: string
) {
  const messages = Array.from(new Set(collectFormErrorMessages(errors))).filter(Boolean);

  if (messages.length === 0) {
    setModalError({
      title,
      messages: ['Please review the highlighted fields.'],
    });
    return;
  }

  setModalError({ title, messages });
}

function ErrorModal({ error, onClose }: { error: ModalErrorState | null; onClose: () => void }) {
  const { t } = useLocale();

  return (
    <Modal
      opened={Boolean(error)}
      onClose={onClose}
      centered
      title={error?.title}
      styles={{
        content: {
          background: 'var(--card)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: 8,
        },
        header: {
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
        },
        title: {
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontWeight: 700,
        },
      }}
    >
      <Stack gap="sm">
        {(error?.messages ?? []).map((message, index) => (
          <Text key={`${message}-${index}`} size="sm">
            {t(message)}
          </Text>
        ))}
      </Stack>
    </Modal>
  );
}

function statusBadge(status: string, label?: string) {
  const tone =
    status === 'active' || status === 'delivered' || status === 'paid'
      ? 'teal'
      : status === 'draft' || status === 'pending'
        ? 'yellow'
        : status === 'cancelled' || status === 'failed' || status === 'blocked'
          ? 'red'
          : 'gray';

  return (
    <Badge color={tone} variant="light" radius="sm">
      {label ?? status}
    </Badge>
  );
}

function AdminOrderDetailPanel({
  orderId,
  enumLabels,
  locale,
}: {
  orderId: string;
  enumLabels: AdminEnumLabels;
  locale: 'en' | 'ar';
}) {
  const { t } = useLocale();
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optionLabels, setOptionLabels] = useState<
    Record<string, { name: string; nameAr: string }>
  >({});

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/orders/${orderId}`);
        const payload = (await response.json()) as {
          data?: AdminOrderDetail;
          error?: string;
        };

        if (!response.ok || !payload.data) {
          throw new Error(payload.error ?? 'Something went wrong');
        }

        if (active) {
          setDetail(payload.data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : 'Something went wrong');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [orderId]);

  useEffect(() => {
    if (!detail?.items?.length) return;
    const productIds = Array.from(
      new Set(detail.items.map((item) => item.product_id).filter(Boolean))
    );
    void Promise.all(
      productIds.map(async (productId) => {
        const response = await fetch(`/api/admin/products/${productId}/configuration`);
        const payload = (await response.json()) as {
          data?: { items?: Array<{ id: string; name: string; name_ar: string }> };
        };
        return payload.data?.items ?? [];
      })
    ).then((groups) =>
      setOptionLabels(
        Object.fromEntries(
          groups.flat().map((item) => [item.id, { name: item.name, nameAr: item.name_ar }])
        )
      )
    );
  }, [detail]);

  if (loading) {
    return (
      <Text size="sm" c="dimmed">
        {t('Loading order details...')}
      </Text>
    );
  }

  if (error || !detail) {
    return (
      <Text size="sm" c="red">
        {t(error ?? 'Something went wrong')}
      </Text>
    );
  }

  const shippingAddress = detail.shipping_address ?? {};
  const billingAddress = detail.billing_address ?? {};
  const currency = detail.currency || 'JOD';

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
        <Paper
          p="md"
          radius={0}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
          }}
        >
          <Text size="xs" tt="uppercase" c="dimmed" mb="sm">
            {t('Delivery')}
          </Text>
          <Stack gap={6}>
            <Text size="sm">{detail.customer_name || '—'}</Text>
            <Text size="sm" c="dimmed">
              {detail.customer_phone || '—'}
            </Text>
            <Text size="sm" c="dimmed">
              {detail.customer_email || '—'}
            </Text>
            <Divider my="xs" />
            {Object.entries(shippingAddress).length ? (
              Object.entries(shippingAddress).map(([key, value]) => (
                <Group key={key} justify="space-between" align="start">
                  <Text size="xs" c="dimmed" tt="uppercase">
                    {localizeAdminFieldKey(key, t)}
                  </Text>
                  <Text size="sm" ta="right">
                    {String(value || '—')}
                  </Text>
                </Group>
              ))
            ) : (
              <Text size="sm" c="dimmed">
                —
              </Text>
            )}
          </Stack>
        </Paper>

        <Paper
          p="md"
          radius={0}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
          }}
        >
          <Text size="xs" tt="uppercase" c="dimmed" mb="sm">
            {t('Financial summary')}
          </Text>
          <Stack gap={8}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t('Subtotal')}
              </Text>
              <Text size="sm">{formatCurrency(Number(detail.subtotal), currency)}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t('Discount amount')}
              </Text>
              <Text size="sm">
                {Number(detail.discount_amount) > 0
                  ? `-${formatCurrency(Number(detail.discount_amount), currency)}`
                  : formatCurrency(Number(detail.discount_amount), currency)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t('Shipping amount')}
              </Text>
              <Text size="sm">{formatCurrency(Number(detail.shipping_amount), currency)}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t('Tax amount')}
              </Text>
              <Text size="sm">{formatCurrency(Number(detail.tax_amount), currency)}</Text>
            </Group>
            <Divider my="xs" />
            <Group justify="space-between">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t('Total amount')}
              </Text>
              <Text size="sm" fw={700}>
                {formatCurrency(Number(detail.total_amount), currency)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t('Currency')}
              </Text>
              <Text size="sm">{t(currency)}</Text>
            </Group>
          </Stack>
        </Paper>

        <Paper
          p="md"
          radius={0}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
          }}
        >
          <Text size="xs" tt="uppercase" c="dimmed" mb="sm">
            {t('Billing and operations')}
          </Text>
          <Stack gap={6}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t('Payment method')}
              </Text>
              <Text size="sm">
                {detail.payment_method
                  ? getEnumLabel(enumLabels, 'payment_method', detail.payment_method, locale)
                  : '—'}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t('Payment status')}
              </Text>
              <Text size="sm">
                {detail.payment_status
                  ? getEnumLabel(enumLabels, 'payment_status', detail.payment_status, locale)
                  : '—'}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t('Coupon code')}
              </Text>
              <Text size="sm">{detail.coupon_code || '—'}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t('Tracking number')}
              </Text>
              <Text size="sm">{detail.tracking_number || '—'}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t('Shipping carrier')}
              </Text>
              <Text size="sm">{detail.shipping_carrier || '—'}</Text>
            </Group>
            <Group justify="space-between" align="start">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t('Notes')}
              </Text>
              <Text size="sm" ta="right" maw={220}>
                {detail.notes || '—'}
              </Text>
            </Group>
            <Divider my="xs" />
            {Object.entries(billingAddress).length ? (
              Object.entries(billingAddress).map(([key, value]) => (
                <Group key={key} justify="space-between" align="start">
                  <Text size="xs" c="dimmed" tt="uppercase">
                    {localizeAdminFieldKey(key, t)}
                  </Text>
                  <Text size="sm" ta="right">
                    {String(value || '—')}
                  </Text>
                </Group>
              ))
            ) : (
              <Text size="sm" c="dimmed">
                {t('Same as shipping')}
              </Text>
            )}
          </Stack>
        </Paper>
      </SimpleGrid>

      <Paper
        p="md"
        radius={0}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
        }}
      >
        <Text size="xs" tt="uppercase" c="dimmed" mb="sm">
          {t('Order items')}
        </Text>
        <Stack gap="sm">
          {detail.items?.length ? (
            detail.items.map((item) => (
              <Group
                key={item.id}
                align="start"
                wrap="nowrap"
                style={{
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <Image
                  src={item.image_url || '/products/puff-jo-product-default.png'}
                  alt={item.product_name}
                  w={72}
                  h={92}
                  radius={0}
                  fit="cover"
                />
                <Stack gap={6} style={{ flex: 1 }}>
                  <Text fw={600}>{item.product_name}</Text>
                  {item.color_name ||
                  item.size_name ||
                  item.sku ||
                  (item.options && Object.keys(item.options).length) ? (
                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                      {item.color_name ? (
                        <Text size="sm" c="dimmed">
                          {t('Color')}: {item.color_name}
                        </Text>
                      ) : null}
                      {item.size_name ? (
                        <Text size="sm" c="dimmed">
                          {t('Size')}: {item.size_name}
                        </Text>
                      ) : null}
                      {item.sku ? (
                        <Text size="sm" c="dimmed">
                          {t('SKU')}: {item.sku}
                        </Text>
                      ) : null}
                      {item.options && Object.keys(item.options).length ? (
                        <Text size="sm" c="dimmed">
                          {t('Options')}:{' '}
                          {Object.values(item.options)
                            .flatMap((values) => (Array.isArray(values) ? values : []))
                            .map((option) =>
                              typeof option === 'object' && option
                                ? (optionLabels[
                                    String((option as Record<string, unknown>).id ?? '')
                                  ]?.[locale === 'ar' ? 'nameAr' : 'name'] ??
                                  String(
                                    (locale === 'ar'
                                      ? (option as Record<string, unknown>).nameAr
                                      : (option as Record<string, unknown>).name) ??
                                      (option as Record<string, unknown>).id ??
                                      ''
                                  ))
                                : (optionLabels[String(option)]?.[
                                    locale === 'ar' ? 'nameAr' : 'name'
                                  ] ?? String(option))
                            )
                            .filter(Boolean)
                            .join(', ')}
                        </Text>
                      ) : null}
                    </SimpleGrid>
                  ) : null}
                  <Text size="sm" c="dimmed">
                    {t('Quantity')}: {item.quantity}
                  </Text>
                  <Group justify="space-between">
                    <Text size="sm">
                      {t('Unit price')}: {formatCurrency(Number(item.unit_price), detail.currency)}
                    </Text>
                    <Text size="sm" fw={600}>
                      {t('Line total')}: {formatCurrency(Number(item.line_total), detail.currency)}
                    </Text>
                  </Group>
                </Stack>
              </Group>
            ))
          ) : (
            <Text size="sm" c="dimmed">
              {t('No order items found.')}
            </Text>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

function AdminOrderItemsEditor({
  orderId,
  order,
  products,
  setFormValue,
}: {
  orderId?: string;
  order?: AdminOrderRecord | null;
  products: AdminProductRecord[];
  setFormValue: (name: string, value: unknown) => void;
}) {
  const { t, localize } = useLocale();
  const [items, setItems] = useState<AdminEditableOrderItem[]>([]);
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customizingItem, setCustomizingItem] = useState<AdminEditableOrderItem | null>(null);
  const [configuration, setConfiguration] = useState<Record<string, any> | null>(null);
  const [variantId, setVariantId] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [optionAvailability, setOptionAvailability] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!orderId) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;

    async function loadItems() {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`);
        const payload = (await response.json()) as { data?: AdminOrderDetail; error?: string };
        if (!response.ok || !payload.data) {
          throw new Error(payload.error ?? 'Something went wrong');
        }
        if (active) {
          setItems(payload.data.items ?? []);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : 'Something went wrong');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadItems();
    return () => {
      active = false;
    };
  }, [orderId]);

  useEffect(() => {
    if (loading) return;

    const productIds = Array.from(
      new Set(items.map((item) => item.product_id).filter((id): id is string => Boolean(id)))
    );
    if (!productIds.length) return;

    void Promise.all(
      productIds.map(async (id) => {
        const response = await fetch(`/api/admin/products/${id}/configuration`);
        const payload = (await response.json()) as { data?: Record<string, any> };
        return [
          id,
          Boolean((payload.data?.variants ?? []).length || (payload.data?.groups ?? []).length),
        ] as const;
      })
    ).then((results) =>
      setOptionAvailability((current) => ({ ...current, ...Object.fromEntries(results) }))
    );
  }, [items, loading]);

  useEffect(() => {
    if (loading) return;

    setFormValue(
      'items',
      items.map((item) => ({
        productId: item.product_id,
        variantId: item.variant_id,
        productName: item.product_name,
        sku: item.sku,
        sizeName: item.size_name,
        colorName: item.color_name,
        imageUrl: item.image_url,
        options: item.options ?? {},
        unitPrice: Number(item.unit_price),
        quantity: item.quantity,
        lineTotal: Number(item.line_total),
      }))
    );
    const subtotal = items.reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0);
    setFormValue('subtotal', subtotal);
    setFormValue(
      'totalAmount',
      Math.max(
        0,
        subtotal -
          Number(order?.discount_amount ?? 0) +
          Number(order?.shipping_amount ?? 0) +
          Number(order?.tax_amount ?? 0)
      )
    );
  }, [items, loading, order, setFormValue]);

  function addProduct() {
    const product = products.find((entry) => entry.id === productId);
    if (!product) return;

    setItems((current) => {
      const existing = current.find((item) => item.product_id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                line_total: Number(item.unit_price) * (item.quantity + 1),
              }
            : item
        );
      }

      return [
        ...current,
        {
          id: `new-${product.id}-${Date.now()}`,
          product_id: product.id,
          variant_id: null,
          product_name: product.name,
          sku: null,
          size_name: null,
          color_name: null,
          image_url: product.primary_image_url || null,
          unit_price: product.base_price,
          quantity: 1,
          line_total: product.base_price,
        },
      ];
    });
    setProductId('');
  }

  function updateQuantity(itemId: string, quantity: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? { ...item, quantity, line_total: Number(item.unit_price) * quantity }
          : item
      )
    );
  }

  function removeProduct(itemId: string) {
    const nextItems = items.filter((item) => item.id !== itemId);
    setItems(nextItems);
    setFormValue(
      'items',
      nextItems.map((item) => ({
        productId: item.product_id,
        variantId: item.variant_id,
        productName: item.product_name,
        sku: item.sku,
        sizeName: item.size_name,
        colorName: item.color_name,
        imageUrl: item.image_url,
        options: item.options ?? {},
        unitPrice: Number(item.unit_price),
        quantity: item.quantity,
        lineTotal: Number(item.line_total),
      }))
    );
  }

  async function openCustomization(item: AdminEditableOrderItem) {
    setCustomizingItem(item);
    setVariantId(item.variant_id ?? '');
    setSelectedOptions(
      Object.fromEntries(
        Object.entries(item.options ?? {}).map(([groupId, values]) => [
          groupId,
          (Array.isArray(values) ? values : []).map((value) =>
            typeof value === 'string' ? value : String((value as Record<string, unknown>).id ?? '')
          ),
        ])
      )
    );
    const response = await fetch(`/api/admin/products/${item.product_id}/configuration`);
    const payload = (await response.json()) as { data?: Record<string, any> };
    setConfiguration(payload.data ?? null);
  }

  function saveCustomization() {
    if (!customizingItem || !configuration) return;
    const variant = (configuration.variants ?? []).find((entry: any) => entry.id === variantId);
    const size = (configuration.sizes ?? []).find((entry: any) => entry.id === variant?.size_id);
    const color = (configuration.colors ?? []).find((entry: any) => entry.id === variant?.color_id);
    const optionItems = Object.values(selectedOptions)
      .flat()
      .map((id) => (configuration.items ?? []).find((entry: any) => entry.id === id))
      .filter(Boolean);
    const price =
      Number(variant?.price ?? customizingItem.unit_price) +
      optionItems.reduce((sum, item: any) => sum + Number(item.price_delta ?? 0), 0);
    setItems((current) =>
      current.map((item) =>
        item.id === customizingItem.id
          ? {
              ...item,
              variant_id: variant?.id ?? null,
              size_name: size?.name ?? null,
              color_name: color?.name ?? null,
              unit_price: price,
              line_total: price * item.quantity,
              options: Object.fromEntries(
                Object.entries(selectedOptions).map(([groupId, values]) => [
                  groupId,
                  values.map((id) => {
                    const option = (configuration.items ?? []).find(
                      (entry: any) => entry.id === id
                    );
                    return option
                      ? { id: option.id, name: option.name, nameAr: option.name_ar }
                      : { id };
                  }),
                ])
              ),
            }
          : item
      )
    );
    setCustomizingItem(null);
    setConfiguration(null);
  }

  return (
    <Paper
      p="md"
      radius="sm"
      style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
    >
      <Group justify="space-between" align="center" mb="sm">
        <Text size="xs" tt="uppercase" c="var(--accent)" fw={800} style={{ letterSpacing: 2 }}>
          {t('Order products')}
        </Text>
        <Text size="xs" c="dimmed">
          {items.length} {t('products')}
        </Text>
      </Group>
      <Group align="end" wrap="wrap" mb="md">
        <NativeSelect
          value={productId}
          onChange={(event) => setProductId(event.currentTarget.value)}
          label={t('Select a product')}
          data={[
            { label: t('Select a product'), value: '' },
            ...products.map((product) => ({
              label: `${localize(product.name, product.name_ar)} · ${formatCurrency(product.base_price)}`,
              value: product.id,
            })),
          ]}
          styles={adminSelectStyles}
          style={{ flex: '1 1 220px' }}
        />
        <Button
          type="button"
          radius="xl"
          onClick={addProduct}
          disabled={!productId}
          styles={adminPrimaryButtonStyles}
          style={{ minHeight: 48 }}
        >
          {t('Add product')}
        </Button>
      </Group>
      {loading ? (
        <Text size="sm" c="dimmed">
          {t('Loading products')}
        </Text>
      ) : null}
      {error ? (
        <Text size="sm" c="red">
          {t(error)}
        </Text>
      ) : null}
      {!loading && !items.length ? (
        <Text size="sm" c="dimmed">
          {t('No products in this order')}
        </Text>
      ) : null}
      <Stack gap="xs">
        {items.map((item) => (
          <Group key={item.id} wrap="nowrap" align="center" className="admin-order-item-row">
            <Image
              src={item.image_url || '/products/puff-jo-product-default.png'}
              alt=""
              w={44}
              h={54}
              fit="cover"
              radius="xs"
            />
            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={700} truncate>
                {item.product_name}
              </Text>
              <Text size="xs" c="dimmed">
                {formatCurrency(Number(item.unit_price))} ·{' '}
                {formatCurrency(Number(item.line_total))}
              </Text>
            </Stack>
            <Group gap={4} wrap="nowrap">
              <ActionIcon
                type="button"
                variant="default"
                color="gray"
                size="lg"
                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                aria-label={t('Decrease quantity')}
              >
                −
              </ActionIcon>
              <TextInput
                type="number"
                min={1}
                value={String(item.quantity)}
                onChange={(event) =>
                  updateQuantity(item.id, Math.max(1, Number(event.currentTarget.value) || 1))
                }
                styles={adminInputStyles}
                style={{ width: 62 }}
                aria-label={t('Quantity')}
              />
              <ActionIcon
                type="button"
                variant="default"
                color="gray"
                size="lg"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                aria-label={t('Increase quantity')}
              >
                +
              </ActionIcon>
            </Group>
            <ActionIcon
              type="button"
              variant="default"
              color="gray"
              onClick={() => void openCustomization(item)}
              disabled={optionAvailability[item.product_id ?? ''] !== true}
              aria-label={t('Customize product')}
            >
              <IconAdjustments size={16} />
            </ActionIcon>
            <ActionIcon
              type="button"
              variant="subtle"
              color="red"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                removeProduct(item.id);
              }}
              aria-label={t('Remove product')}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>
      <Modal
        opened={Boolean(customizingItem)}
        onClose={() => setCustomizingItem(null)}
        title={t('Customize product')}
        centered
      >
        {!configuration ? (
          <Text size="sm" c="dimmed">
            {t('Loading product options')}
          </Text>
        ) : (
          <Stack gap="md">
            {(configuration.variants ?? []).length > 0 ? (
              <NativeSelect
                label={t('Variant')}
                value={variantId}
                onChange={(event) => setVariantId(event.currentTarget.value)}
                data={(configuration.variants ?? []).map((entry: any) => ({
                  label: `${entry.sku} · ${formatCurrency(entry.price ?? 0)}`,
                  value: entry.id,
                }))}
                styles={adminSelectStyles}
              />
            ) : null}
            {(configuration.groups ?? []).map((group: any) => {
              const options = (configuration.itemLinks ?? [])
                .filter((entry: any) => entry.option_group_id === group.id)
                .map((entry: any) =>
                  (configuration.items ?? []).find((item: any) => item.id === entry.option_item_id)
                )
                .filter(Boolean);
              return (
                <NativeSelect
                  key={group.id}
                  label={localize(group.name, group.name_ar)}
                  value={selectedOptions[group.id]?.[0] ?? ''}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setSelectedOptions((current) => ({
                      ...current,
                      [group.id]: [value],
                    }));
                  }}
                  data={[
                    { label: t('Select an option'), value: '' },
                    ...options.map((item: any) => ({
                      label: `${localize(item.name, item.name_ar)} · ${formatCurrency(item.price_delta ?? 0)}`,
                      value: item.id,
                    })),
                  ]}
                  styles={adminSelectStyles}
                />
              );
            })}
            <Group justify="flex-end">
              <Button radius="xl" styles={adminPrimaryButtonStyles} onClick={saveCustomization}>
                {t('Apply options')}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Paper>
  );
}

function inventoryBadge(quantity: number, t: (value: string) => string) {
  const tone = quantity <= 0 ? 'red' : quantity <= 5 ? 'yellow' : 'teal';
  const label =
    quantity <= 0
      ? t('Out of stock')
      : quantity <= 5
        ? `${t('Low')}: ${quantity}`
        : `${quantity} ${t('in stock')}`;

  return (
    <Badge color={tone} variant="light" radius="sm">
      {label}
    </Badge>
  );
}

function rowValue(row: Record<string, unknown>, field: CrudField, t: (value: string) => string) {
  const value = getRowFieldValue(row, field.name);

  if (field.type === 'switch') {
    return value ? t('Yes') : t('No');
  }

  if (field.type === 'datetime') {
    return formatDateTime(String(value));
  }

  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (field.type === 'select') {
    const option = field.options?.find((entry) => entry.value === String(value));
    return option ? t(option.label) : t(String(value));
  }

  return String(value);
}

function localizeAdminFieldKey(key: string, t: (value: string) => string) {
  const words = key
    .replaceAll('_', ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();
  return t(words.charAt(0).toUpperCase() + words.slice(1));
}

function CrudManager<T extends { id: string }>({
  title,
  description,
  records,
  columns,
  fields,
  createLabel,
  defaults,
  createRequest,
  updateRequest,
  deleteRequest,
  drawerExtras,
  hideViewFields = false,
  allowCreate = true,
  allowDelete = true,
}: CrudManagerProps<T>) {
  const router = useRouter();
  const { t, dir } = useLocale();
  const [mode, setMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<T | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<ModalErrorState | null>(null);
  const [filePreviews, setFilePreviews] = useState<Record<string, FilePreviewItem[]>>({});
  const schema = useMemo(() => buildSchema(fields, t), [fields, t]);
  const editableFields = fields.filter((field) => {
    if (!mode || mode === 'view') {
      return false;
    }

    if (!field.editableOn) {
      return true;
    }

    return field.editableOn.includes(mode);
  });
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });
  const watchedValues = useWatch({ control });
  const watchedSubtotal = watchedValues.subtotal;
  const watchedDiscount = watchedValues.discountPercent;
  const watchedShipping = watchedValues.shippingAmount;
  const watchedTax = watchedValues.taxPercent;
  const hasOrderTotals =
    fields.some((field) => field.name === 'subtotal') &&
    fields.some((field) => field.name === 'totalAmount');
  const setFormValueForDrawer = useCallback(
    (name: string, value: unknown) => setValue(name, value),
    [setValue]
  );

  useEffect(() => {
    if (!mode || mode === 'view' || !hasOrderTotals) {
      return;
    }

    const subtotal = Number(watchedSubtotal) || 0;
    const discount = (subtotal * (Number(watchedDiscount) || 0)) / 100;
    const shipping = Number(watchedShipping) || 0;
    const tax = (subtotal * (Number(watchedTax) || 0)) / 100;

    setValue('totalAmount', Math.max(0, subtotal - discount + shipping + tax));
  }, [
    hasOrderTotals,
    mode,
    setValue,
    watchedDiscount,
    watchedShipping,
    watchedSubtotal,
    watchedTax,
  ]);

  useEffect(() => {
    if (!mode) {
      return;
    }

    setModalError(null);
    setFilePreviews((current) => {
      Object.values(current).forEach(revokePreviewItems);
      return {};
    });

    if (mode === 'create') {
      reset(defaults);
      return;
    }

    if (selected) {
      const nextValues: Record<string, unknown> = { ...defaults };
      const nextFilePreviews: Record<string, FilePreviewItem[]> = {};

      for (const field of fields) {
        let value =
          getRowFieldValue(selected as Record<string, unknown>, field.name) ?? defaults[field.name];

        if (field.name === 'discountPercent' || field.name === 'taxPercent') {
          const subtotal =
            Number(getRowFieldValue(selected as Record<string, unknown>, 'subtotal')) || 0;
          const amountField = field.name === 'discountPercent' ? 'discount_amount' : 'tax_amount';
          const amount =
            Number(getRowFieldValue(selected as Record<string, unknown>, amountField)) || 0;
          value = subtotal > 0 ? (amount / subtotal) * 100 : 0;
        }

        nextValues[field.name] = field.type === 'datetime' ? toDateTimeInputValue(value) : value;

        if (field.type === 'file') {
          const existingUrl =
            getRowFieldValue(selected as Record<string, unknown>, field.name) ??
            getRowFieldValue(selected as Record<string, unknown>, `${field.name}Url`);

          if (typeof existingUrl === 'string' && existingUrl.trim().length > 0) {
            nextFilePreviews[field.name] = [
              {
                id: `${field.name}-existing`,
                url: existingUrl,
                name: existingUrl.split('/').pop() ?? existingUrl,
                isExisting: true,
              },
            ];
          }
        }
      }

      reset(nextValues);
      setFilePreviews(nextFilePreviews);
    }
  }, [defaults, fields, mode, reset, selected]);

  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach(revokePreviewItems);
    };
  }, [filePreviews]);

  function setFieldPreviews(fieldName: string, nextItems: FilePreviewItem[]) {
    setFilePreviews((current) => {
      revokePreviewItems(current[fieldName] ?? []);
      return {
        ...current,
        [fieldName]: nextItems,
      };
    });
  }

  function clearFileField(fieldName: string) {
    setFieldPreviews(fieldName, []);
    setValue(fieldName, undefined, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  function handleInvalidSubmit(formErrors: unknown) {
    openFieldErrorModal(formErrors, setModalError, t('Please fix the form errors'));
  }

  async function onSubmit(values: Record<string, unknown>) {
    setSubmitting(true);
    setModalError(null);

    const request = mode === 'edit' && selected ? updateRequest(selected.id) : createRequest;
    const submittedValues = { ...values };

    if (mode === 'edit' && selected) {
      submittedValues.id = selected.id;
    }

    if ('discountPercent' in submittedValues || 'taxPercent' in submittedValues) {
      const subtotal = Number(submittedValues.subtotal) || 0;
      submittedValues.discountAmount =
        (subtotal * (Number(submittedValues.discountPercent) || 0)) / 100;
      submittedValues.taxAmount = (subtotal * (Number(submittedValues.taxPercent) || 0)) / 100;
      delete submittedValues.discountPercent;
      delete submittedValues.taxPercent;
    }

    const hasFileFields = editableFields.some((field) => field.type === 'file');
    let response: Response;

    if (hasFileFields) {
      const formData = new FormData();

      if (mode === 'edit' && selected) {
        formData.append('id', selected.id);
      }

      for (const field of editableFields) {
        const value = submittedValues[field.name];

        if (field.type === 'file') {
          const files = value instanceof FileList ? Array.from(value) : [];
          const previewItems = filePreviews[field.name] ?? [];
          const existingImage = previewItems.find((item) => item.isExisting);

          if (field.required && mode === 'create' && files.length === 0 && !existingImage) {
            setSubmitting(false);
            setModalError({
              title: t('Image required'),
              messages: [t('This field is required')],
            });
            return;
          }

          for (const file of files) {
            if (file.size > 0) {
              formData.append(field.name, file);
            }
          }

          formData.append(
            `${field.name}Url`,
            existingImage && files.length === 0 ? existingImage.url : ''
          );
          continue;
        }

        if (value === undefined || value === null) {
          continue;
        }

        if (field.type === 'datetime' && typeof value === 'string' && value) {
          formData.append(field.name, new Date(value).toISOString());
          continue;
        }

        formData.append(field.name, String(value));
      }

      response = await fetch(request.url, {
        method: request.method,
        body: formData,
      });
    } else {
      response = await fetch(request.url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(submittedValues).map(([key, value]) => {
              const field = editableFields.find((item) => item.name === key);

              if (field?.type === 'datetime' && typeof value === 'string' && value) {
                return [key, new Date(value).toISOString()];
              }

              return [key, value];
            })
          )
        ),
      });
    }

    setSubmitting(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setModalError({
        title: t('Request failed'),
        messages: [payload?.error ?? t('Something went wrong')],
      });
      return;
    }

    setMode(null);
    setSelected(null);
    router.refresh();
  }

  async function handleDelete(row: T) {
    const request = deleteRequest(row.id);
    const response = await fetch(request.url, { method: request.method });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setModalError({
        title: t('Delete failed'),
        messages: [payload?.error ?? t('Something went wrong')],
      });
      return;
    }

    router.refresh();
  }

  return (
    <Paper
      radius="md"
      p="lg"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 18px 48px rgba(0,0,0,0.18)',
      }}
    >
      <Group justify="space-between" align="end" mb="md" wrap="wrap" gap="md">
        <Stack gap={4}>
          <Text size="xs" tt="uppercase" c="var(--accent)" fw={700} style={{ letterSpacing: 2.2 }}>
            {t('Admin control')}
          </Text>
          <Text fw={800} size="1.35rem" c="var(--text)">
            {t(title)}
          </Text>
          <Text size="sm" c="var(--text-secondary)">
            {t(description)}
          </Text>
        </Stack>
        {allowCreate ? (
          <Button
            leftSection={<IconPlus size={16} />}
            radius="xl"
            variant="default"
            styles={adminPrimaryButtonStyles}
            onClick={() => setMode('create')}
            style={{ width: '100%', maxWidth: 220 }}
          >
            {t(createLabel ?? 'Add new')}
          </Button>
        ) : null}
      </Group>

      <ScrollArea type="auto" offsetScrollbars>
        <Table verticalSpacing="md" striped highlightOnHover withTableBorder miw={720}>
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th key={column.key}>{t(column.label)}</Table.Th>
              ))}
              <Table.Th>{t('Actions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {records.map((row) => (
              <Table.Tr key={row.id}>
                {columns.map((column) => (
                  <Table.Td key={column.key}>{column.render(row)}</Table.Td>
                ))}
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => {
                        setSelected(row);
                        setMode('view');
                      }}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => {
                        setSelected(row);
                        setMode('edit');
                      }}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    {allowDelete ? (
                      <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(row)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    ) : null}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Drawer
        opened={mode !== null}
        onClose={() => {
          setMode(null);
          setSelected(null);
        }}
        position={dir === 'rtl' ? 'left' : 'right'}
        size="min(100vw, 42rem)"
        title={
          mode === 'view'
            ? t('View record')
            : mode === 'edit'
              ? t('Edit record')
              : t('Create record')
        }
        styles={{
          content: {
            background: 'var(--background)',
            color: 'var(--text)',
            borderLeft: '1px solid var(--border)',
            boxShadow: '-24px 0 70px rgba(0, 0, 0, 0.22)',
          },
          header: {
            background:
              'linear-gradient(135deg, var(--card), color-mix(in srgb, var(--card) 84%, #c7202f 16%))',
            borderBottom: '1px solid var(--border)',
            padding: '1.15rem 1.25rem',
          },
          title: {
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontWeight: 700,
            fontSize: '0.78rem',
            color: 'var(--text)',
          },
          body: {
            padding: '1.25rem',
          },
        }}
      >
        <ErrorModal error={modalError} onClose={() => setModalError(null)} />
        {mode === 'view' && selected ? (
          <Stack gap="sm">
            {drawerExtras
              ? drawerExtras({
                  mode,
                  selected,
                  setFormValue: setFormValueForDrawer,
                })
              : null}
            {!hideViewFields ? (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {fields.map((field) => (
                  <Paper
                    key={field.name}
                    p="sm"
                    radius="xs"
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      minHeight: 76,
                    }}
                  >
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={6}>
                      {t(field.label)}
                    </Text>
                    <Text size="sm" fw={600} style={{ overflowWrap: 'anywhere' }}>
                      {rowValue(selected as Record<string, unknown>, field, t)}
                    </Text>
                  </Paper>
                ))}
              </SimpleGrid>
            ) : null}
          </Stack>
        ) : (
          <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)}>
            <Stack gap="lg" style={{ maxWidth: 620, margin: '0 auto' }}>
              {drawerExtras
                ? drawerExtras({
                    mode,
                    selected,
                    setFormValue: setFormValueForDrawer,
                  })
                : null}
              <input type="hidden" {...register('items')} />
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                {editableFields.map((field) => {
                  const errorMessage = errors[field.name]?.message
                    ? String(errors[field.name]?.message)
                    : undefined;

                  if (field.type === 'textarea') {
                    return (
                      <Textarea
                        key={field.name}
                        label={t(field.label)}
                        placeholder={field.placeholder ? t(field.placeholder) : undefined}
                        minRows={4}
                        error={errorMessage}
                        radius="xs"
                        styles={adminInputStyles}
                        style={{ gridColumn: '1 / -1' }}
                        {...register(field.name)}
                      />
                    );
                  }

                  if (field.type === 'select') {
                    return (
                      <NativeSelect
                        key={field.name}
                        label={t(field.label)}
                        error={errorMessage}
                        radius="xs"
                        styles={adminSelectStyles}
                        data={field.options?.map((option) => ({
                          label: t(option.label),
                          value: option.value,
                        }))}
                        {...register(field.name)}
                      />
                    );
                  }

                  if (field.type === 'switch') {
                    return (
                      <Controller
                        key={field.name}
                        control={control}
                        name={field.name}
                        render={({ field: controllerField }) => (
                          <Switch
                            checked={Boolean(controllerField.value)}
                            label={t(field.label)}
                            onChange={(event) =>
                              controllerField.onChange(event.currentTarget.checked)
                            }
                            radius="xs"
                            size="md"
                            color="red"
                          />
                        )}
                      />
                    );
                  }

                  if (field.type === 'file') {
                    const previewItems = filePreviews[field.name] ?? [];
                    const fileRegistration = register(field.name);

                    return (
                      <Box key={field.name} style={{ gridColumn: '1 / -1' }}>
                        <Text size="sm" mb={6}>
                          {t(field.label)}
                        </Text>
                        <input
                          type="file"
                          accept="image/*"
                          multiple={field.multiple}
                          name={fileRegistration.name}
                          ref={fileRegistration.ref}
                          onBlur={fileRegistration.onBlur}
                          onChange={(event) => {
                            const files = Array.from(event.currentTarget.files ?? []);
                            fileRegistration.onChange(event);
                            setFieldPreviews(
                              field.name,
                              files.map((file, index) => ({
                                id: `${field.name}-${file.name}-${file.lastModified}-${index}`,
                                url: URL.createObjectURL(file),
                                name: file.name,
                                isExisting: false,
                              }))
                            );
                          }}
                        />
                        {errorMessage ? (
                          <Text c="red" size="xs" mt={4}>
                            {errorMessage}
                          </Text>
                        ) : null}
                        {previewItems.length > 0 ? (
                          <Stack gap="xs" mt="sm">
                            {previewItems.map((item) => (
                              <Paper
                                key={item.id}
                                p="xs"
                                radius="md"
                                style={{
                                  background: 'var(--background)',
                                  border: '1px solid var(--border)',
                                }}
                              >
                                <Group justify="space-between" align="start" wrap="wrap">
                                  <Group align="start" wrap="nowrap">
                                    <Image
                                      src={item.url}
                                      alt={item.name}
                                      w={72}
                                      h={72}
                                      fit="cover"
                                      radius="md"
                                    />
                                    <Stack gap={2} style={{ minWidth: 0 }}>
                                      <Text size="sm" fw={600}>
                                        {item.isExisting ? t('Current image') : t('Selected image')}
                                      </Text>
                                      <Text
                                        size="xs"
                                        c="#80716d"
                                        style={{ wordBreak: 'break-word' }}
                                      >
                                        {item.name}
                                      </Text>
                                    </Stack>
                                  </Group>
                                  <Button
                                    type="button"
                                    size="xs"
                                    variant="default"
                                    radius="xl"
                                    styles={adminSecondaryButtonStyles}
                                    onClick={() => clearFileField(field.name)}
                                  >
                                    {t('Remove')}
                                  </Button>
                                </Group>
                              </Paper>
                            ))}
                          </Stack>
                        ) : null}
                      </Box>
                    );
                  }

                  return (
                    <TextInput
                      key={field.name}
                      label={t(field.label)}
                      placeholder={field.placeholder ? t(field.placeholder) : undefined}
                      type={
                        field.type === 'number'
                          ? 'number'
                          : field.type === 'datetime'
                            ? 'datetime-local'
                            : 'text'
                      }
                      step={field.step}
                      min={field.min}
                      error={errorMessage}
                      radius="xs"
                      styles={adminInputStyles}
                      {...register(field.name)}
                    />
                  );
                })}
              </SimpleGrid>

              <Group justify="flex-end" mt="md" wrap="wrap">
                <Button
                  type="button"
                  variant="default"
                  radius="xl"
                  styles={adminSecondaryButtonStyles}
                  onClick={() => setMode(null)}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  type="submit"
                  loading={submitting}
                  radius="xl"
                  styles={adminPrimaryButtonStyles}
                >
                  {mode === 'edit' ? t('Save changes') : t('Create')}
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Drawer>
    </Paper>
  );
}

function getEnumLabel(
  enumLabels: AdminEnumLabels,
  enumKey: AdminEnumKey,
  value: string,
  locale: 'en' | 'ar'
) {
  return enumLabels[enumKey]?.[value]?.[locale] ?? value;
}

function EnumLabelsManager({ enumLabels }: { enumLabels: AdminEnumLabels }) {
  const rows: AdminEnumLabelRow[] = (Object.keys(enumLabels) as AdminEnumKey[]).flatMap((enumKey) =>
    Object.entries(enumLabels[enumKey]).map(([value, names]) => ({
      id: `${enumKey}:${value}`,
      enumKey,
      value,
      en: names.en,
      ar: names.ar,
    }))
  );

  return (
    <CrudManager
      title="Enum labels"
      description="Manage English and Arabic labels for fixed enum values used across admin controls."
      records={rows}
      defaults={{ enumKey: '', value: '', en: '', ar: '' }}
      fields={[
        { name: 'enumKey', label: 'Enum', type: 'text' },
        { name: 'value', label: 'Value', type: 'text' },
        {
          name: 'en',
          label: 'English label',
          type: 'text',
          required: true,
          editableOn: ['edit'],
        },
        {
          name: 'ar',
          label: 'Arabic label',
          type: 'text',
          required: true,
          editableOn: ['edit'],
        },
      ]}
      columns={[
        { key: 'enumKey', label: 'Enum', render: (row) => row.enumKey },
        { key: 'value', label: 'Value', render: (row) => row.value },
        { key: 'en', label: 'English label', render: (row) => row.en },
        { key: 'ar', label: 'Arabic label', render: (row) => row.ar },
      ]}
      createRequest={{ url: '/api/admin/enums', method: 'POST' }}
      updateRequest={() => ({ url: '/api/admin/enums', method: 'PATCH' })}
      deleteRequest={() => ({ url: '/api/admin/enums', method: 'DELETE' })}
      allowCreate={false}
      allowDelete={false}
    />
  );
}

export function AdminDashboardScreen({
  session,
  products,
  orders,
  customers,
  categories,
  brands,
  enumLabels,
}: {
  session: AdminSessionInfo;
  products: AdminProductRecord[];
  orders: AdminOrderRecord[];
  customers: AdminCustomerRecord[];
  categories: AdminCategoryRecord[];
  brands: AdminBrandRecord[];
  enumLabels: AdminEnumLabels;
}) {
  const { t, locale } = useLocale();
  const cards = [
    {
      label: 'Catalog products',
      value: products.length,
      detail: 'Active catalog records',
    },
    {
      label: 'Orders',
      value: orders.length,
      detail: 'Order fulfillment queue',
    },
    {
      label: 'Customers',
      value: customers.length,
      detail: 'Customer profiles and roles',
    },
    {
      label: 'Catalog groups',
      value: categories.length + brands.length,
      detail: 'Categories, collections, and brands',
    },
  ];

  return (
    <AdminShell
      session={session}
      title="PUFF Jordan control room"
      subtitle="Manage PUFF Jordan products, orders, customers, delivery zones, offers, and storefront settings."
      active="Dashboard"
    >
      <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="lg">
        {cards.map((card) => (
          <Paper
            key={card.label}
            radius="md"
            p="lg"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 18px 48px rgba(0,0,0,0.18)',
            }}
          >
            <Text size="xs" tt="uppercase" c="var(--muted)" fw={700} style={{ letterSpacing: 2.2 }}>
              {t(card.label)}
            </Text>
            <Text fw={800} size="2.4rem" mt={8} c="var(--accent)">
              {card.value.toLocaleString(locale === 'ar' ? 'ar-JO' : 'en-US')}
            </Text>
            <Text size="sm" c="var(--text-secondary)" mt={6}>
              {t(card.detail)}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg" mt="lg">
        <Paper
          radius="md"
          p="lg"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 18px 48px rgba(0,0,0,0.18)',
          }}
        >
          <Text fw={800} c="var(--text)" mb="md">
            {t('Recent orders')}
          </Text>
          <ScrollArea type="auto" offsetScrollbars>
            <Table striped miw={520}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('Order')}</Table.Th>
                  <Table.Th>{t('Customer')}</Table.Th>
                  <Table.Th>{t('Status')}</Table.Th>
                  <Table.Th>{t('Total')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {orders.slice(0, 6).map((order) => (
                  <Table.Tr key={order.id}>
                    <Table.Td>{order.order_number}</Table.Td>
                    <Table.Td>{order.customer_name || '—'}</Table.Td>
                    <Table.Td>
                      {statusBadge(
                        order.status,
                        getEnumLabel(enumLabels, 'order_status', order.status, locale)
                      )}
                    </Table.Td>
                    <Table.Td>{formatCurrency(order.total_amount)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>

        <Paper
          radius="md"
          p="lg"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 18px 48px rgba(0,0,0,0.18)',
          }}
        >
          <Text fw={800} c="var(--text)" mb="md">
            {t('Recent products')}
          </Text>
          <ScrollArea type="auto" offsetScrollbars>
            <Table striped miw={520}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('Name')}</Table.Th>
                  <Table.Th>{t('Slug')}</Table.Th>
                  <Table.Th>{t('Status')}</Table.Th>
                  <Table.Th>{t('Price')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {products.slice(0, 6).map((product) => (
                  <Table.Tr key={product.id}>
                    <Table.Td>{product.name}</Table.Td>
                    <Table.Td>{product.slug}</Table.Td>
                    <Table.Td>
                      {statusBadge(
                        product.status,
                        getEnumLabel(enumLabels, 'product_status', product.status, locale)
                      )}
                    </Table.Td>
                    <Table.Td>{formatCurrency(product.base_price)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      </SimpleGrid>
    </AdminShell>
  );
}

export function AdminProductsScreen({
  session,
  products,
  categories,
  brands,
  variants,
  optionGroups,
  optionItems,
  optionGroupLinks,
  optionItemLinks,
  enumLabels,
}: {
  session: AdminSessionInfo;
  products: AdminProductRecord[];
  categories: AdminCategoryRecord[];
  brands: AdminBrandRecord[];
  variants: AdminProductVariantRecord[];
  optionGroups: AdminProductOptionGroupRecord[];
  optionItems: AdminProductOptionItemRecord[];
  optionGroupLinks: AdminProductOptionGroupLinkRecord[];
  optionItemLinks: AdminProductOptionItemLinkRecord[];
  enumLabels: AdminEnumLabels;
}) {
  const { t } = useLocale();

  return (
    <AdminShell
      session={session}
      title="Product management"
      subtitle="Every product is editable in place with create, view, edit, and delete flows."
      active="Products"
    >
      <Tabs defaultValue="products">
        <Tabs.List mb="lg">
          <Tabs.Tab value="products">{t('Products')}</Tabs.Tab>
          <Tabs.Tab value="options">{t('Options')}</Tabs.Tab>
          <Tabs.Tab value="addons">{t('Add-ons')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="products">
          <ProductCrudManager
            products={products}
            categories={categories}
            brands={brands}
            variants={variants}
            optionGroups={optionGroups}
            optionItems={optionItems}
            optionGroupLinks={optionGroupLinks}
            optionItemLinks={optionItemLinks}
            enumLabels={enumLabels}
          />
        </Tabs.Panel>
        <Tabs.Panel value="options">
          <OptionCatalogManager records={optionGroups} />
        </Tabs.Panel>
        <Tabs.Panel value="addons">
          <AddOnCatalogManager records={optionItems} optionGroups={optionGroups} />
        </Tabs.Panel>
      </Tabs>
    </AdminShell>
  );
}

function OptionCatalogManager({ records }: { records: AdminProductOptionGroupRecord[] }) {
  const { t } = useLocale();

  return (
    <CrudManager
      title="Options"
      description="Create reusable option groups for organizing product add-ons."
      records={records}
      columns={[
        { key: 'name', label: 'Name', render: (row) => row.name },
        { key: 'code', label: 'Code', render: (row) => row.code },
        {
          key: 'active',
          label: 'Status',
          render: (row) => t(row.is_active ? 'Active' : 'Inactive'),
        },
      ]}
      fields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'nameAr', label: 'Arabic name', type: 'text' },
        { name: 'code', label: 'Code', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'descriptionAr', label: 'Arabic description', type: 'textarea' },
        { name: 'sortOrder', label: 'Sort order', type: 'number', min: 0 },
        { name: 'isActive', label: 'Active', type: 'switch' },
      ]}
      defaults={{
        name: '',
        nameAr: '',
        code: '',
        description: '',
        descriptionAr: '',
        sortOrder: 0,
        isActive: true,
      }}
      createRequest={{ url: '/api/admin/options', method: 'POST' }}
      updateRequest={(id) => ({ url: `/api/admin/options/${id}`, method: 'PATCH' })}
      deleteRequest={(id) => ({ url: `/api/admin/options/${id}`, method: 'DELETE' })}
      createLabel="Create option"
    />
  );
}

function AddOnCatalogManager({
  records,
  optionGroups,
}: {
  records: AdminProductOptionItemRecord[];
  optionGroups: AdminProductOptionGroupRecord[];
}) {
  const { t } = useLocale();

  return (
    <CrudManager
      title="Add-ons"
      description="Create reusable add-ons and assign each one to an option."
      records={records}
      columns={[
        { key: 'name', label: 'Name', render: (row) => row.name },
        {
          key: 'option',
          label: 'Option',
          render: (row) => optionGroups.find((group) => group.id === row.group_id)?.name ?? '—',
        },
        { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price_delta) },
        {
          key: 'active',
          label: 'Status',
          render: (row) => t(row.is_active ? 'Active' : 'Inactive'),
        },
      ]}
      fields={[
        {
          name: 'groupId',
          label: 'Option',
          type: 'select',
          required: true,
          options: optionGroups.map((group) => ({ label: group.name, value: group.id })),
        },
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'nameAr', label: 'Arabic name', type: 'text' },
        { name: 'code', label: 'Code', type: 'text', required: true },
        { name: 'imageUrl', label: 'Image URL', type: 'text' },
        { name: 'priceDelta', label: 'Price added to product', type: 'number', min: 0, step: 0.01 },
        { name: 'stockQuantity', label: 'Stock', type: 'number', min: 0 },
        { name: 'trackInventory', label: 'Track inventory', type: 'switch' },
        { name: 'allowBackorder', label: 'Allow backorder', type: 'switch' },
        { name: 'isDefault', label: 'Selected by default', type: 'switch' },
        { name: 'sortOrder', label: 'Sort order', type: 'number', min: 0 },
        { name: 'isActive', label: 'Active', type: 'switch' },
      ]}
      defaults={{
        groupId: optionGroups[0]?.id ?? '',
        name: '',
        nameAr: '',
        code: '',
        imageUrl: '',
        priceDelta: 0,
        stockQuantity: 0,
        trackInventory: false,
        allowBackorder: true,
        isDefault: false,
        sortOrder: 0,
        isActive: true,
      }}
      createRequest={{ url: '/api/admin/addons', method: 'POST' }}
      updateRequest={(id) => ({ url: `/api/admin/addons/${id}`, method: 'PATCH' })}
      deleteRequest={(id) => ({ url: `/api/admin/addons/${id}`, method: 'DELETE' })}
      createLabel="Create add-on"
    />
  );
}

type ProductVariantFormRow = {
  sizeId: string;
  colorId: string;
  sku: string;
  barcode: string;
  price: number | '';
  compareAtPrice: number | '';
  stockQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  weightGrams: number | '';
  isActive: boolean;
};

type ProductFormValues = {
  name: string;
  nameAr?: string;
  slug: string;
  slugAr?: string;
  shortDescription?: string;
  shortDescriptionAr?: string;
  description?: string;
  descriptionAr?: string;
  mainImage?: FileList;
  subImages?: FileList;
  basePrice: number;
  compareAtPrice?: number | '';
  status: string;
  isFeatured: boolean;
  categoryId: string;
  brandId: string;
  variants: ProductVariantFormRow[];
  optionGroupIds: string[];
};

function emptyVariantRow(): ProductVariantFormRow {
  return {
    sizeId: '',
    colorId: '',
    sku: '',
    barcode: '',
    price: '',
    compareAtPrice: '',
    stockQuantity: 5,
    lowStockThreshold: 5,
    trackInventory: true,
    allowBackorder: false,
    weightGrams: 300,
    isActive: true,
  };
}

function randomToken(length: number, alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789') {
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(
    ''
  );
}

function randomDigits(length: number) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

function buildVariantSku(sizeCode?: string, colorCode?: string) {
  return ['SKU', sizeCode, colorCode, randomToken(6)].filter(Boolean).join('-');
}

function buildVariantBarcode() {
  return randomDigits(13);
}

function requiredNumberField(t: (value: string) => string, minimum = 0) {
  return z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return value;
      }

      return Number(value);
    },
    z
      .number({ error: () => ({ message: t('Enter a valid number') }) })
      .min(minimum, t('Value is too low'))
  );
}

function optionalNumberField(t: (value: string) => string, minimum = 0) {
  return z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }

      return Number(value);
    },
    z
      .number({ error: () => ({ message: t('Enter a valid number') }) })
      .min(minimum, t('Value is too low'))
      .optional()
  );
}

function ProductCrudManager({
  products,
  categories,
  brands,
  variants,
  optionGroups,
  optionItems,
  optionGroupLinks,
  optionItemLinks,
  enumLabels,
}: {
  products: AdminProductRecord[];
  categories: AdminCategoryRecord[];
  brands: AdminBrandRecord[];
  variants: AdminProductVariantRecord[];
  optionGroups: AdminProductOptionGroupRecord[];
  optionItems: AdminProductOptionItemRecord[];
  optionGroupLinks: AdminProductOptionGroupLinkRecord[];
  optionItemLinks: AdminProductOptionItemLinkRecord[];
  enumLabels: AdminEnumLabels;
}) {
  const router = useRouter();
  const { t, locale, dir } = useLocale();
  const [mode, setMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<AdminProductRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<ModalErrorState | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<FilePreviewItem[]>([]);
  const [subImagePreviews, setSubImagePreviews] = useState<FilePreviewItem[]>([]);
  const [mainImageFiles, setMainImageFiles] = useState<File[]>([]);
  const [subImageFiles, setSubImageFiles] = useState<File[]>([]);
  const [existingMainImageUrl, setExistingMainImageUrl] = useState('');
  const [existingSubImageUrls, setExistingSubImageUrls] = useState<string[]>([]);
  const productVariantMap = useMemo(
    () =>
      new Map(
        products.map((product) => [
          product.id,
          variants.filter((variant) => variant.product_id === product.id),
        ])
      ),
    [products, variants]
  );
  const productOptionLinkMap = useMemo(
    () =>
      new Map(
        products.map((product) => [
          product.id,
          optionGroupLinks
            .filter((link) => link.product_id === product.id)
            .sort((a, b) => a.sort_order - b.sort_order),
        ])
      ),
    [optionGroupLinks, products]
  );
  const productOptionItemLinkMap = useMemo(
    () =>
      new Map(
        products.map((product) => [
          product.id,
          optionItemLinks.filter((link) => link.product_id === product.id),
        ])
      ),
    [optionItemLinks, products]
  );
  const optionItemsByGroup = useMemo(
    () =>
      new Map(
        optionGroups.map((group) => [
          group.id,
          optionItems
            .filter((item) => item.group_id === group.id)
            .sort((a, b) => a.sort_order - b.sort_order),
        ])
      ),
    [optionGroups, optionItems]
  );
  const [optionSelectionTypes, setOptionSelectionTypes] = useState<
    Record<string, 'radio' | 'checkbox'>
  >({});
  const [optionAddOnIds, setOptionAddOnIds] = useState<Record<string, string[]>>({});
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, t('This field is required')),
        nameAr: z.string().optional(),
        slug: z.string().trim().min(1, t('This field is required')),
        slugAr: z.string().optional(),
        shortDescription: z.string().optional(),
        shortDescriptionAr: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        mainImage: z.any().optional(),
        subImages: z.any().optional(),
        basePrice: requiredNumberField(t, 0),
        compareAtPrice: optionalNumberField(t, 0),
        status: z.string().trim().min(1, t('This field is required')),
        isFeatured: z.boolean().default(false),
        categoryId: z.string().optional(),
        brandId: z.string().optional(),
        optionGroupIds: z.array(z.string()).default([]),
        variants: z.array(
          z.object({
            sizeId: z.string().optional(),
            colorId: z.string().optional(),
            sku: z.string().trim().min(1, t('This field is required')),
            barcode: z.string().optional(),
            price: optionalNumberField(t, 0),
            compareAtPrice: optionalNumberField(t, 0),
            stockQuantity: requiredNumberField(t, 0),
            lowStockThreshold: requiredNumberField(t, 0),
            trackInventory: z.boolean().default(true),
            allowBackorder: z.boolean().default(false),
            weightGrams: optionalNumberField(t, 0),
            isActive: z.boolean().default(true),
          })
        ),
      }),
    [t]
  );
  const defaultVariantRows = useMemo<ProductVariantFormRow[]>(
    () => [
      {
        ...emptyVariantRow(),
        sku: buildVariantSku(),
        barcode: buildVariantBarcode(),
      },
    ],
    []
  );
  const defaults = useMemo<ProductFormValues>(
    () => ({
      name: '',
      nameAr: '',
      slug: '',
      slugAr: '',
      shortDescription: '',
      shortDescriptionAr: '',
      description: '',
      descriptionAr: '',
      mainImage: undefined,
      subImages: undefined,
      basePrice: 0,
      compareAtPrice: '',
      status: 'draft',
      isFeatured: false,
      categoryId: categories[0]?.id ?? '',
      brandId: brands[0]?.id ?? '',
      variants: defaultVariantRows,
      optionGroupIds: [],
    }),
    [brands, categories, defaultVariantRows]
  );
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });
  const watchedOptionGroupIds =
    (useWatch({ control, name: 'optionGroupIds' }) as string[] | undefined) ?? [];

  useEffect(() => {
    if (!mode) {
      return;
    }

    setModalError(null);
    setMainImagePreview((current) => {
      revokePreviewItems(current);
      return [];
    });
    setSubImagePreviews((current) => {
      revokePreviewItems(current);
      return [];
    });
    setMainImageFiles([]);
    setSubImageFiles([]);

    if (mode === 'create') {
      reset(defaults);
      setOptionSelectionTypes({});
      setOptionAddOnIds({});
      setExistingMainImageUrl('');
      setExistingSubImageUrls([]);
      return;
    }

    if (selected) {
      const mappedVariants = (productVariantMap.get(selected.id) ?? [])
        .slice(0, 1)
        .map((variant: AdminProductVariantRecord) => ({
          sizeId: variant.size_id ?? '',
          colorId: '',
          sku: variant.sku,
          barcode: variant.barcode ?? '',
          price: variant.price ?? selected.base_price,
          compareAtPrice: variant.compare_at_price ?? selected.compare_at_price ?? '',
          stockQuantity: variant.stock_quantity,
          lowStockThreshold: variant.low_stock_threshold,
          trackInventory: variant.track_inventory,
          allowBackorder: variant.allow_backorder,
          weightGrams: variant.weight_grams ?? '',
          isActive: variant.is_active,
        }));

      reset({
        ...defaults,
        name: selected.name,
        nameAr: selected.name_ar,
        slug: selected.slug,
        slugAr: selected.slug_ar,
        shortDescription: selected.short_description,
        shortDescriptionAr: selected.short_description_ar,
        description: selected.description,
        descriptionAr: selected.description_ar,
        basePrice: selected.base_price,
        compareAtPrice: selected.compare_at_price ?? '',
        status: selected.status,
        isFeatured: selected.is_featured,
        categoryId: selected.category_id,
        brandId: selected.brand_id,
        variants: mappedVariants.length ? mappedVariants : defaultVariantRows,
        optionGroupIds: (productOptionLinkMap.get(selected.id) ?? []).map(
          (link) => link.option_group_id
        ),
      });
      setOptionSelectionTypes(
        Object.fromEntries(
          (productOptionLinkMap.get(selected.id) ?? []).map((link) => [
            link.option_group_id,
            link.selection_type,
          ])
        )
      );
      setOptionAddOnIds(
        Object.fromEntries(
          (productOptionLinkMap.get(selected.id) ?? []).map((link) => [
            link.option_group_id,
            (productOptionItemLinkMap.get(selected.id) ?? [])
              .filter((itemLink) => itemLink.option_group_id === link.option_group_id)
              .map((itemLink) => itemLink.option_item_id),
          ])
        )
      );
      setExistingMainImageUrl(selected.primary_image_url ?? '');
      setExistingSubImageUrls([...(selected.sub_image_urls ?? [])]);
    }
  }, [
    defaultVariantRows,
    defaults,
    mode,
    optionGroups,
    productOptionLinkMap,
    productOptionItemLinkMap,
    productVariantMap,
    reset,
    selected?.id,
  ]);

  useEffect(() => {
    return () => {
      revokePreviewItems(mainImagePreview);
      revokePreviewItems(subImagePreviews);
    };
  }, [mainImagePreview, subImagePreviews]);

  function handleInvalidSubmit(formErrors: unknown) {
    openFieldErrorModal(formErrors, setModalError, t('Please fix the form errors'));
  }

  function replaceMainImagePreview(nextItems: FilePreviewItem[]) {
    revokePreviewItems(mainImagePreview);
    setMainImagePreview(nextItems);
  }

  function replaceSubImagePreviews(nextItems: FilePreviewItem[]) {
    revokePreviewItems(subImagePreviews);
    setSubImagePreviews(nextItems);
  }

  async function onSubmit(values: any) {
    setSubmitting(true);
    setModalError(null);
    const request =
      mode === 'edit' && selected
        ? {
            url: `/api/admin/products/${selected.id}`,
            method: 'PATCH' as const,
          }
        : { url: '/api/admin/products', method: 'POST' as const };
    const formData = new FormData();

    const entries: Array<[string, unknown]> = [
      ['name', values.name],
      ['nameAr', values.nameAr],
      ['slug', values.slug],
      ['slugAr', values.slugAr],
      ['shortDescription', values.shortDescription],
      ['shortDescriptionAr', values.shortDescriptionAr],
      ['description', values.description],
      ['descriptionAr', values.descriptionAr],
      ['basePrice', values.basePrice],
      ['compareAtPrice', values.compareAtPrice],
      ['status', values.status],
      ['isFeatured', values.isFeatured],
      ['categoryId', values.categoryId],
      ['brandId', values.brandId],
      [
        'optionGroupLinksJson',
        JSON.stringify(
          (values.optionGroupIds ?? []).map((optionGroupId: string) => {
            const selectionType = optionSelectionTypes[optionGroupId] ?? 'radio';
            return {
              optionGroupId,
              selectionType,
              isRequired: selectionType === 'radio',
              minSelections: selectionType === 'radio' ? 1 : 0,
              maxSelections: selectionType === 'radio' ? 1 : null,
            };
          })
        ),
      ],
      [
        'optionItemLinksJson',
        JSON.stringify(
          (values.optionGroupIds ?? []).flatMap((optionGroupId: string) =>
            (optionAddOnIds[optionGroupId] ?? []).map((optionItemId) => ({
              optionGroupId,
              optionItemId,
            }))
          )
        ),
      ],
      ...(mode === 'create'
        ? [
            [
              'variantsJson',
              JSON.stringify(
                [(values.variants as ProductVariantFormRow[])?.[0] ?? defaultVariantRows[0]].map(
                  (variant: ProductVariantFormRow) => ({
                    ...variant,
                    sizeId: '',
                    colorId: '',
                    price: values.basePrice,
                    compareAtPrice: values.compareAtPrice === '' ? null : values.compareAtPrice,
                    weightGrams: variant.weightGrams === '' ? 300 : variant.weightGrams,
                    isActive: true,
                  })
                )
              ),
            ] as [string, unknown],
          ]
        : []),
    ];

    for (const [key, value] of entries) {
      if (value === undefined || value === null) {
        continue;
      }
      formData.append(key, String(value));
    }

    formData.append('mainImageUrl', existingMainImageUrl);
    formData.append('subImageUrlsJson', JSON.stringify(existingSubImageUrls));

    for (const file of mainImageFiles) {
      if (file.size > 0) {
        formData.append('mainImage', file);
      }
    }
    for (const file of subImageFiles) {
      if (file.size > 0) {
        formData.append('subImages', file);
      }
    }

    const response = await fetch(request.url, {
      method: request.method,
      body: formData,
    });
    setSubmitting(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setModalError({
        title: t('Request failed'),
        messages: [payload?.error ?? t('Something went wrong')],
      });
      return;
    }

    setMode(null);
    setSelected(null);
    router.refresh();
  }

  async function handleDelete(row: AdminProductRecord) {
    const response = await fetch(`/api/admin/products/${row.id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setModalError({
        title: t('Delete failed'),
        messages: [payload?.error ?? t('Something went wrong')],
      });
      return;
    }
    router.refresh();
  }

  return (
    <Paper
      radius={0}
      p="lg"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface-border)',
      }}
    >
      <Group justify="space-between" align="end" mb="md">
        <Stack gap={4}>
          <Text size="xs" tt="uppercase" c="dimmed" style={{ letterSpacing: 2.2 }}>
            {t('Control center')}
          </Text>
          <Text fw={700} size="1.35rem">
            {t('Catalog products')}
          </Text>
          <Text size="sm" c="dimmed">
            {t('Manage multilingual product records, pricing, status, and catalog assignments.')}
          </Text>
        </Stack>
        <Button
          leftSection={<IconPlus size={16} />}
          radius={0}
          variant="default"
          styles={adminPrimaryButtonStyles}
          onClick={() => setMode('create')}
        >
          {t('Add new')}
        </Button>
      </Group>

      <ScrollArea>
        <Table verticalSpacing="md" striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('Name')}</Table.Th>
              <Table.Th>{t('Arabic name')}</Table.Th>
              <Table.Th>{t('Category')}</Table.Th>
              <Table.Th>{t('Brand')}</Table.Th>
              <Table.Th>{t('Stock')}</Table.Th>
              <Table.Th>{t('Status')}</Table.Th>
              <Table.Th>{t('Price')}</Table.Th>
              <Table.Th>{t('Created')}</Table.Th>
              <Table.Th>{t('Actions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td>{row.name}</Table.Td>
                <Table.Td>{row.name_ar || '—'}</Table.Td>
                <Table.Td>
                  {categories.find((item) => item.id === row.category_id)?.name ?? '—'}
                </Table.Td>
                <Table.Td>{brands.find((item) => item.id === row.brand_id)?.name ?? '—'}</Table.Td>
                <Table.Td>{row.total_stock}</Table.Td>
                <Table.Td>
                  {statusBadge(
                    row.status,
                    getEnumLabel(enumLabels, 'product_status', row.status, locale)
                  )}
                </Table.Td>
                <Table.Td>{formatCurrency(row.base_price)}</Table.Td>
                <Table.Td>{formatDate(row.created_at)}</Table.Td>
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={() => {
                        setSelected(row);
                        setMode('view');
                      }}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={() => {
                        setSelected(row);
                        setMode('edit');
                      }}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(row)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Drawer
        opened={mode !== null}
        onClose={() => {
          setMode(null);
          setSelected(null);
        }}
        position={dir === 'rtl' ? 'left' : 'right'}
        size="xl"
        title={
          mode === 'view'
            ? t('View record')
            : mode === 'edit'
              ? t('Edit record')
              : t('Create record')
        }
        styles={{
          content: { background: 'var(--background)', color: 'var(--text)' },
          header: {
            background: 'var(--card)',
            borderBottom: '1px solid var(--border)',
          },
          title: {
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            fontWeight: 700,
          },
        }}
      >
        <ErrorModal error={modalError} onClose={() => setModalError(null)} />
        {mode === 'view' && selected ? (
          <Stack gap="md">
            <Paper
              radius={0}
              p="lg"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
                border: '1px solid var(--surface-border)',
              }}
            >
              <Group align="start" wrap="nowrap">
                {selected.primary_image_url ? (
                  <Image
                    src={selected.primary_image_url}
                    alt={selected.name}
                    h={220}
                    w={172}
                    fit="cover"
                    radius={0}
                  />
                ) : (
                  <Paper
                    radius={0}
                    w={172}
                    h={220}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                    }}
                  />
                )}
                <Stack gap={6} style={{ flex: 1 }}>
                  <Text size="xs" tt="uppercase" c="dimmed" style={{ letterSpacing: 2 }}>
                    {brands.find((item) => item.id === selected.brand_id)?.name ?? 'Brand'}
                  </Text>
                  <Text fw={800} size="1.6rem" tt="uppercase" style={{ lineHeight: 1.05 }}>
                    {selected.name}
                  </Text>
                  {selected.name_ar ? (
                    <Text size="sm" c="var(--text-secondary)">
                      {selected.name_ar}
                    </Text>
                  ) : null}
                  <Group gap="xs">
                    {statusBadge(
                      selected.status,
                      getEnumLabel(enumLabels, 'product_status', selected.status, locale)
                    )}
                    <Badge variant="light" radius="sm" color="gray">
                      {formatCurrency(selected.base_price)}
                    </Badge>
                    {inventoryBadge(selected.total_stock, t)}
                  </Group>
                  <Divider my="xs" />
                  <SimpleGrid cols={2} spacing="xs">
                    <Box>
                      <Text size="xs" tt="uppercase" c="dimmed">
                        {t('Category')}
                      </Text>
                      <Text size="sm">
                        {categories.find((item) => item.id === selected.category_id)?.name ?? '—'}
                      </Text>
                    </Box>
                    <Box>
                      <Text size="xs" tt="uppercase" c="dimmed">
                        {t('Slug')}
                      </Text>
                      <Text size="sm">{selected.slug}</Text>
                    </Box>
                  </SimpleGrid>
                  {selected.short_description ? (
                    <>
                      <Text size="xs" tt="uppercase" c="dimmed" mt="xs">
                        {t('Short description')}
                      </Text>
                      <Text size="sm" c="var(--text-secondary)">
                        {selected.short_description}
                      </Text>
                    </>
                  ) : null}
                </Stack>
              </Group>
            </Paper>
            <Paper
              radius={0}
              p="md"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
              }}
            >
              {selected.primary_image_url || selected.sub_image_urls.length ? (
                <>
                  <Text size="xs" tt="uppercase" c="dimmed" mb="sm" style={{ letterSpacing: 2 }}>
                    {t('Product images')}
                  </Text>
                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mb="md">
                    {[selected.primary_image_url, ...selected.sub_image_urls]
                      .filter(Boolean)
                      .map((imageUrl, index) => (
                        <Image
                          key={`${imageUrl}-${index}`}
                          src={imageUrl}
                          alt={index === 0 ? t('Primary product image') : t('Product image')}
                          h={180}
                          fit="cover"
                          radius={0}
                        />
                      ))}
                  </SimpleGrid>
                </>
              ) : null}
              <Group justify="space-between" align="end" mb="sm">
                <Stack gap={2}>
                  <Text size="sm" fw={700}>
                    {t('Product options')}
                  </Text>
                  <Text size="xs" c="var(--text-secondary)">
                    {t('Customer selection behavior and available add-ons.')}
                  </Text>
                </Stack>
                {(productOptionLinkMap.get(selected.id) ?? []).length > 0 ? (
                  <Badge variant="light" color="red" radius="xl">
                    {(productOptionLinkMap.get(selected.id) ?? []).length} {t('configured')}
                  </Badge>
                ) : null}
              </Group>
              <Stack gap="md" mb="lg">
                {(productOptionLinkMap.get(selected.id) ?? []).length ? (
                  (productOptionLinkMap.get(selected.id) ?? []).map((link, index) => {
                    const group = optionGroups.find((item) => item.id === link.option_group_id);
                    const items = (optionItemsByGroup.get(link.option_group_id) ?? []).filter(
                      (item) =>
                        (productOptionItemLinkMap.get(selected.id) ?? []).some(
                          (itemLink) => itemLink.option_item_id === item.id
                        )
                    );

                    if (!group) {
                      return null;
                    }

                    return (
                      <Paper
                        key={link.option_group_id}
                        radius="md"
                        p="md"
                        style={{
                          background:
                            'linear-gradient(135deg, color-mix(in srgb, var(--accent) 7%, var(--surface)), var(--surface))',
                          border: '1px solid color-mix(in srgb, var(--accent) 20%, var(--border))',
                        }}
                      >
                        <Group justify="space-between" align="start" mb="md">
                          <Group gap="sm" align="start">
                            <Badge color="red" variant="filled" radius="xl">
                              {index + 1}
                            </Badge>
                            <Stack gap={1}>
                              <Text fw={800}>{group.name}</Text>
                              {group.name_ar ? (
                                <Text size="xs" c="var(--text-secondary)">
                                  {group.name_ar}
                                </Text>
                              ) : null}
                            </Stack>
                          </Group>
                          <Group gap="xs">
                            <Badge variant="light" color="gray" radius="sm">
                              {items.length} {t('add-ons')}
                            </Badge>
                          </Group>
                        </Group>

                        <Paper
                          p="sm"
                          radius="md"
                          style={{
                            background: 'var(--background)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <Group gap="sm" wrap="nowrap">
                            <Box
                              style={{
                                width: 18,
                                height: 18,
                                flex: '0 0 18px',
                                borderRadius: link.selection_type === 'radio' ? '50%' : 4,
                                border: '1px solid var(--accent)',
                                background: 'var(--accent)',
                                boxShadow: 'inset 0 0 0 3px var(--background)',
                              }}
                            />
                            <Stack gap={1}>
                              <Text
                                size="xs"
                                fw={700}
                                tt="uppercase"
                                c="var(--text-secondary)"
                                style={{ letterSpacing: '0.1em' }}
                              >
                                {t('Customer selection')}
                              </Text>
                              <Text size="sm" fw={750}>
                                {link.selection_type === 'radio'
                                  ? t('Choose one')
                                  : t('Choose multiple')}
                              </Text>
                              <Text size="xs" c="var(--text-secondary)">
                                {link.selection_type === 'radio'
                                  ? t('Customers can select only one add-on.')
                                  : t('Customers can select several add-ons.')}
                              </Text>
                            </Stack>
                            {link.is_required ? (
                              <Badge ml="auto" variant="light" radius="sm" color="yellow">
                                {t('Required')}
                              </Badge>
                            ) : null}
                          </Group>
                        </Paper>

                        <Text
                          size="xs"
                          fw={700}
                          tt="uppercase"
                          c="var(--text-secondary)"
                          mt="md"
                          mb={8}
                          style={{ letterSpacing: '0.1em' }}
                        >
                          {t('Available add-ons')}
                        </Text>
                        {items.length ? (
                          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                            {items.map((item) => (
                              <Paper
                                key={item.id}
                                p="sm"
                                radius="md"
                                style={{
                                  background:
                                    'color-mix(in srgb, var(--background) 86%, transparent)',
                                  border: '1px solid var(--border)',
                                }}
                              >
                                <Group justify="space-between" wrap="nowrap" align="start">
                                  <Stack gap={2}>
                                    <Text size="sm" fw={700}>
                                      {item.name}
                                    </Text>
                                    {item.name_ar ? (
                                      <Text size="xs" c="var(--text-secondary)">
                                        {item.name_ar}
                                      </Text>
                                    ) : null}
                                    {item.track_inventory ? (
                                      <Text size="xs" c="dimmed">
                                        {t('Stock')}: {item.stock_quantity}
                                      </Text>
                                    ) : null}
                                  </Stack>
                                  <Text size="sm" fw={800} c="var(--accent)">
                                    {item.price_delta > 0
                                      ? `+${formatCurrency(item.price_delta)}`
                                      : t('Free')}
                                  </Text>
                                </Group>
                              </Paper>
                            ))}
                          </SimpleGrid>
                        ) : (
                          <Text size="sm" c="dimmed">
                            {t('No add-ons selected for this option.')}
                          </Text>
                        )}
                      </Paper>
                    );
                  })
                ) : (
                  <Paper p="md" radius="md" withBorder>
                    <Text size="sm" c="dimmed" ta="center">
                      {t('No product options attached.')}
                    </Text>
                  </Paper>
                )}
              </Stack>
            </Paper>
            {selected.description ? (
              <Paper
                radius={0}
                p="md"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                }}
              >
                <Text size="xs" tt="uppercase" c="dimmed" mb="sm" style={{ letterSpacing: 2 }}>
                  {t('Description')}
                </Text>
                <Text size="sm" c="var(--text-secondary)">
                  {selected.description}
                </Text>
              </Paper>
            ) : null}
          </Stack>
        ) : (
          <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)}>
            <Stack gap="md">
              <SimpleGrid cols={{ base: 1, md: 2 }}>
                <TextInput
                  label={t('Name')}
                  error={errors.name?.message ? String(errors.name.message) : undefined}
                  radius="xs"
                  styles={adminInputStyles}
                  {...register('name')}
                />
                <TextInput
                  label={t('Arabic name')}
                  error={errors.nameAr?.message ? String(errors.nameAr.message) : undefined}
                  radius="xs"
                  styles={adminInputStyles}
                  {...register('nameAr')}
                />
                <TextInput
                  label={t('Slug')}
                  error={errors.slug?.message ? String(errors.slug.message) : undefined}
                  radius="xs"
                  styles={adminInputStyles}
                  {...register('slug')}
                />
                <TextInput
                  label={t('Arabic slug')}
                  error={errors.slugAr?.message as string | undefined}
                  radius="xs"
                  styles={adminInputStyles}
                  {...register('slugAr')}
                />
                <TextInput
                  label={t('Base price')}
                  type="number"
                  step={0.01}
                  min={0}
                  error={errors.basePrice?.message ? String(errors.basePrice.message) : undefined}
                  radius="xs"
                  styles={adminInputStyles}
                  {...register('basePrice')}
                />
                <TextInput
                  label={t('Compare at price')}
                  type="number"
                  step={0.01}
                  min={0}
                  error={errors.compareAtPrice?.message as string | undefined}
                  radius="xs"
                  styles={adminInputStyles}
                  {...register('compareAtPrice')}
                />
                <NativeSelect
                  label={t('Category')}
                  radius="xs"
                  styles={adminSelectStyles}
                  data={categories.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  {...register('categoryId')}
                />
                <NativeSelect
                  label={t('Brand')}
                  radius="xs"
                  styles={adminSelectStyles}
                  data={brands.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  {...register('brandId')}
                />
                <Box style={{ gridColumn: '1 / -1' }}>
                  <Group justify="space-between" align="end" mb="sm">
                    <Stack gap={2}>
                      <Text size="sm" fw={700}>
                        {t('Product options')}
                      </Text>
                      <Text size="xs" c="var(--text-secondary)">
                        {t('Select an option, then define how customers choose its add-ons.')}
                      </Text>
                    </Stack>
                    {watchedOptionGroupIds.length > 0 ? (
                      <Badge variant="light" color="red" radius="xl">
                        {watchedOptionGroupIds.length} {t('configured')}
                      </Badge>
                    ) : null}
                  </Group>
                  <Controller
                    control={control}
                    name="optionGroupIds"
                    render={({ field }) => (
                      <MultiSelect
                        placeholder={t('Select product options')}
                        radius="md"
                        styles={adminSelectStyles}
                        data={optionGroups
                          .filter((item) => item.is_active)
                          .map((item) => ({
                            label: item.name,
                            value: item.id,
                          }))}
                        value={field.value ?? []}
                        onChange={field.onChange}
                        searchable
                        clearable
                      />
                    )}
                  />
                  <Stack gap="md" mt="md">
                    {watchedOptionGroupIds.map((groupId, index) => {
                      const group = optionGroups.find((item) => item.id === groupId);
                      if (!group) {
                        return null;
                      }
                      const selectionType = optionSelectionTypes[groupId] ?? 'radio';
                      return (
                        <Paper
                          key={groupId}
                          p="md"
                          radius="md"
                          style={{
                            background:
                              'linear-gradient(135deg, color-mix(in srgb, var(--accent) 7%, var(--surface)), var(--surface))',
                            border:
                              '1px solid color-mix(in srgb, var(--accent) 20%, var(--border))',
                          }}
                        >
                          <Group justify="space-between" mb="md">
                            <Group gap="sm">
                              <Badge color="red" variant="filled" radius="xl">
                                {index + 1}
                              </Badge>
                              <Stack gap={1}>
                                <Text fw={800}>{group.name}</Text>
                                {group.name_ar ? (
                                  <Text size="xs" c="var(--text-secondary)">
                                    {group.name_ar}
                                  </Text>
                                ) : null}
                              </Stack>
                            </Group>
                          </Group>

                          <Text
                            size="xs"
                            fw={700}
                            tt="uppercase"
                            c="var(--text-secondary)"
                            mb={8}
                            style={{ letterSpacing: '0.12em' }}
                          >
                            {t('Customer selection')}
                          </Text>
                          <SimpleGrid
                            cols={{ base: 1, sm: 2 }}
                            spacing="sm"
                            role="radiogroup"
                            aria-label={t('Customer selection')}
                          >
                            {[
                              {
                                value: 'radio' as const,
                                title: t('Choose one'),
                                description: t('Customers can select only one add-on.'),
                              },
                              {
                                value: 'checkbox' as const,
                                title: t('Choose multiple'),
                                description: t('Customers can select several add-ons.'),
                              },
                            ].map((choice) => {
                              const active = selectionType === choice.value;
                              return (
                                <button
                                  key={choice.value}
                                  type="button"
                                  role="radio"
                                  aria-checked={active}
                                  onClick={() =>
                                    setOptionSelectionTypes((current) => ({
                                      ...current,
                                      [groupId]: choice.value,
                                    }))
                                  }
                                  style={{
                                    padding: '0.85rem 1rem',
                                    borderRadius: '0.65rem',
                                    border: active
                                      ? '1px solid var(--accent)'
                                      : '1px solid var(--border)',
                                    background: active
                                      ? 'color-mix(in srgb, var(--accent) 14%, var(--background))'
                                      : 'var(--background)',
                                    color: 'var(--text)',
                                    textAlign: 'start',
                                    cursor: 'pointer',
                                    boxShadow: active ? 'inset 3px 0 0 var(--accent)' : 'none',
                                  }}
                                >
                                  <Group gap="xs" wrap="nowrap" align="start">
                                    <Box
                                      mt={3}
                                      style={{
                                        width: 16,
                                        height: 16,
                                        flex: '0 0 16px',
                                        borderRadius: choice.value === 'radio' ? '50%' : 4,
                                        border: `1px solid ${active ? 'var(--accent)' : 'var(--muted)'}`,
                                        background: active ? 'var(--accent)' : 'transparent',
                                        boxShadow: active
                                          ? 'inset 0 0 0 3px var(--background)'
                                          : 'none',
                                      }}
                                    />
                                    <Stack gap={2}>
                                      <Text size="sm" fw={750}>
                                        {choice.title}
                                      </Text>
                                      <Text size="xs" c="var(--text-secondary)">
                                        {choice.description}
                                      </Text>
                                    </Stack>
                                  </Group>
                                </button>
                              );
                            })}
                          </SimpleGrid>

                          <MultiSelect
                            mt="md"
                            label={t('Available add-ons')}
                            description={t(
                              'Only selected add-ons will appear on the product page.'
                            )}
                            placeholder={t('Select add-ons')}
                            radius="md"
                            styles={adminSelectStyles}
                            data={(optionItemsByGroup.get(groupId) ?? [])
                              .filter((item) => item.is_active)
                              .map((item) => ({
                                label: `${item.name}${item.price_delta ? ` (+${formatCurrency(item.price_delta)})` : ''}`,
                                value: item.id,
                              }))}
                            value={optionAddOnIds[groupId] ?? []}
                            onChange={(value) =>
                              setOptionAddOnIds((current) => ({ ...current, [groupId]: value }))
                            }
                            searchable
                            clearable
                          />
                        </Paper>
                      );
                    })}
                  </Stack>
                </Box>
                <NativeSelect
                  label={t('Status')}
                  radius="xs"
                  styles={adminSelectStyles}
                  data={['draft', 'active', 'inactive', 'archived'].map((value) => ({
                    label: getEnumLabel(enumLabels, 'product_status', value, locale),
                    value,
                  }))}
                  {...register('status')}
                />
                <Controller
                  control={control}
                  name="isFeatured"
                  render={({ field }) => (
                    <Switch
                      checked={Boolean(field.value)}
                      label={t('Featured product')}
                      onChange={(event) => field.onChange(event.currentTarget.checked)}
                      radius="xs"
                      size="md"
                      color="dark"
                    />
                  )}
                />
              </SimpleGrid>
              <Textarea
                label={t('Short description')}
                minRows={3}
                radius="xs"
                styles={adminInputStyles}
                {...register('shortDescription')}
              />
              <Textarea
                label={t('Arabic short description')}
                minRows={3}
                radius="xs"
                styles={adminInputStyles}
                {...register('shortDescriptionAr')}
              />
              <Textarea
                label={t('Description')}
                minRows={4}
                radius="xs"
                styles={adminInputStyles}
                {...register('description')}
              />
              <Textarea
                label={t('Arabic description')}
                minRows={4}
                radius="xs"
                styles={adminInputStyles}
                {...register('descriptionAr')}
              />
              <Box>
                <Text size="sm" mb={6}>
                  {t('Main image')}
                </Text>
                <input
                  type="file"
                  accept="image/*"
                  {...register('mainImage', {
                    onChange: (event) => {
                      const files = Array.from(event.currentTarget.files ?? []) as File[];
                      setMainImageFiles(files);
                      replaceMainImagePreview(
                        files.map((file, index) => ({
                          id: `main-${file.name}-${file.lastModified}-${index}`,
                          url: URL.createObjectURL(file),
                          name: file.name,
                          isExisting: false,
                        }))
                      );
                    },
                  })}
                />
                {existingMainImageUrl || mainImagePreview.length ? (
                  <Paper
                    mt="sm"
                    p="xs"
                    radius={0}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Group justify="space-between" align="start" wrap="nowrap">
                      <Group align="start" wrap="nowrap">
                        <Image
                          src={mainImagePreview[0]?.url ?? existingMainImageUrl}
                          alt={t('Main image')}
                          w={84}
                          h={104}
                          fit="cover"
                        />
                        <Stack gap={2}>
                          <Text size="sm" fw={600}>
                            {mainImagePreview.length
                              ? t('Selected main image')
                              : t('Current main image')}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {mainImagePreview[0]?.name ??
                              existingMainImageUrl.split('/').pop() ??
                              t('Main image')}
                          </Text>
                        </Stack>
                      </Group>
                      <Button
                        type="button"
                        size="xs"
                        variant="default"
                        radius={0}
                        styles={adminSecondaryButtonStyles}
                        onClick={() => {
                          setMainImageFiles([]);
                          replaceMainImagePreview([]);
                          setExistingMainImageUrl('');
                          setValue('mainImage', undefined, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }}
                      >
                        {t('Remove')}
                      </Button>
                    </Group>
                  </Paper>
                ) : null}
              </Box>
              <Box>
                <Text size="sm" mb={6}>
                  {t('Sub images')}
                </Text>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  {...register('subImages', {
                    onChange: (event) => {
                      const files = Array.from(event.currentTarget.files ?? []) as File[];
                      setSubImageFiles(files);
                      replaceSubImagePreviews(
                        files.map((file, index) => ({
                          id: `sub-${file.name}-${file.lastModified}-${index}`,
                          url: URL.createObjectURL(file),
                          name: file.name,
                          isExisting: false,
                        }))
                      );
                    },
                  })}
                />
                {existingSubImageUrls.length || subImagePreviews.length ? (
                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mt="sm">
                    {existingSubImageUrls.map((imageUrl, index) => (
                      <Paper
                        key={`existing-sub-${imageUrl}-${index}`}
                        p="xs"
                        radius={0}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <Stack gap="xs">
                          <Image
                            src={imageUrl}
                            alt={t('Sub image')}
                            h={180}
                            fit="cover"
                            radius={0}
                          />
                          <Text size="sm" fw={600}>
                            {t('Current sub image')} {index + 1}
                          </Text>
                          <Text size="xs" c="dimmed" lineClamp={2}>
                            {imageUrl.split('/').pop() ?? t('Sub image')}
                          </Text>
                          <Button
                            type="button"
                            size="xs"
                            variant="default"
                            radius={0}
                            styles={adminSecondaryButtonStyles}
                            onClick={() =>
                              setExistingSubImageUrls((current) =>
                                current.filter((value) => value !== imageUrl)
                              )
                            }
                          >
                            {t('Remove')}
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                    {subImagePreviews.map((item, index) => (
                      <Paper
                        key={item.id}
                        p="xs"
                        radius={0}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <Stack gap="xs">
                          <Image src={item.url} alt={item.name} h={180} fit="cover" radius={0} />
                          <Text size="sm" fw={600}>
                            {t('Selected sub image')} {index + 1}
                          </Text>
                          <Text size="xs" c="dimmed" lineClamp={2}>
                            {item.name}
                          </Text>
                          <Button
                            type="button"
                            size="xs"
                            variant="default"
                            radius={0}
                            styles={adminSecondaryButtonStyles}
                            onClick={() => {
                              const nextFiles = subImageFiles.filter(
                                (_, fileIndex) => fileIndex !== index
                              );
                              const nextPreviews = subImagePreviews.filter(
                                (preview) => preview.id !== item.id
                              );
                              setSubImageFiles(nextFiles);
                              replaceSubImagePreviews(nextPreviews);
                              setValue('subImages', undefined, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              });
                            }}
                          >
                            {t('Remove')}
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </SimpleGrid>
                ) : null}
              </Box>

              <Group justify="flex-end" mt="md">
                <Button
                  type="button"
                  variant="default"
                  radius={0}
                  styles={adminSecondaryButtonStyles}
                  onClick={() => setMode(null)}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  type="submit"
                  loading={submitting}
                  radius={0}
                  styles={adminPrimaryButtonStyles}
                >
                  {mode === 'edit' ? t('Save changes') : t('Create')}
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Drawer>
    </Paper>
  );
}

export function AdminOrdersScreen({
  session,
  orders,
  enumLabels,
  products,
}: {
  session: AdminSessionInfo;
  orders: AdminOrderRecord[];
  enumLabels: AdminEnumLabels;
  products: AdminProductRecord[];
}) {
  const { locale } = useLocale();

  return (
    <AdminShell
      session={session}
      title="Order management"
      subtitle="Track payments, delivery state, totals, and customer contact details from one grid."
      active="Orders"
    >
      <CrudManager
        title="Customer orders"
        description="View and update operational order data with editable statuses and delivery details."
        records={orders}
        defaults={{
          orderNumber: '',
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'cash_on_delivery',
          subtotal: 0,
          discountPercent: 0,
          shippingAmount: 0,
          taxPercent: 0,
          totalAmount: 0,
          currency: 'JOD',
          couponCode: '',
          trackingNumber: '',
          shippingCarrier: '',
          notes: '',
        }}
        fields={[
          {
            name: 'orderNumber',
            label: 'Order number',
            type: 'text',
            required: true,
            editableOn: ['create'],
          },
          {
            name: 'customerName',
            label: 'Customer name',
            type: 'text',
            required: true,
            editableOn: ['create', 'edit'],
          },
          {
            name: 'customerEmail',
            label: 'Customer email',
            type: 'text',
            editableOn: ['create', 'edit'],
          },
          {
            name: 'customerPhone',
            label: 'Customer phone',
            type: 'text',
            required: true,
            editableOn: ['create', 'edit'],
          },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            editableOn: ['create', 'edit'],
            options: [
              'pending',
              'confirmed',
              'processing',
              'packed',
              'shipped',
              'out_for_delivery',
              'delivered',
              'cancelled',
              'failed',
              'refunded',
            ].map((value) => ({
              label: getEnumLabel(enumLabels, 'order_status', value, locale),
              value,
            })),
          },
          {
            name: 'paymentStatus',
            label: 'Payment status',
            type: 'select',
            required: true,
            editableOn: ['create', 'edit'],
            options: [
              'pending',
              'authorized',
              'paid',
              'failed',
              'cancelled',
              'partially_refunded',
              'refunded',
            ].map((value) => ({
              label: getEnumLabel(enumLabels, 'payment_status', value, locale),
              value,
            })),
          },
          {
            name: 'paymentMethod',
            label: 'Payment method',
            type: 'select',
            required: true,
            editableOn: ['create', 'edit'],
            options: ['cash_on_delivery', 'card', 'bank_transfer', 'apple_pay', 'google_pay'].map(
              (value) => ({
                label: getEnumLabel(enumLabels, 'payment_method', value, locale),
                value,
              })
            ),
          },
          {
            name: 'subtotal',
            label: 'Subtotal',
            type: 'number',
            required: true,
            min: 0,
            step: 0.01,
            editableOn: ['create', 'edit'],
          },
          {
            name: 'discountPercent',
            label: 'Discount (%)',
            type: 'number',
            min: 0,
            step: 0.01,
            editableOn: ['create', 'edit'],
          },
          {
            name: 'shippingAmount',
            label: 'Shipping amount',
            type: 'number',
            min: 0,
            step: 0.01,
            editableOn: ['create', 'edit'],
          },
          {
            name: 'taxPercent',
            label: 'Tax (%)',
            type: 'number',
            min: 0,
            step: 0.01,
            editableOn: ['create', 'edit'],
          },
          {
            name: 'totalAmount',
            label: 'Total amount',
            type: 'number',
            required: true,
            min: 0,
            step: 0.01,
            editableOn: ['create', 'edit'],
          },
          {
            name: 'currency',
            label: 'Currency',
            type: 'select',
            required: true,
            editableOn: ['create', 'edit'],
            options: [
              { label: 'JOD', value: 'JOD' },
              { label: 'USD', value: 'USD' },
            ],
          },
          {
            name: 'couponCode',
            label: 'Coupon code',
            type: 'text',
            editableOn: ['create', 'edit'],
          },
          {
            name: 'trackingNumber',
            label: 'Tracking number',
            type: 'text',
            editableOn: ['edit'],
          },
          {
            name: 'shippingCarrier',
            label: 'Shipping carrier',
            type: 'text',
            editableOn: ['edit'],
          },
          {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            editableOn: ['create', 'edit'],
          },
        ]}
        columns={[
          {
            key: 'order_number',
            label: 'Order',
            render: (row) => row.order_number,
          },
          {
            key: 'customer_name',
            label: 'Customer',
            render: (row) => row.customer_name || '—',
          },
          {
            key: 'status',
            label: 'Status',
            render: (row) =>
              statusBadge(row.status, getEnumLabel(enumLabels, 'order_status', row.status, locale)),
          },
          {
            key: 'payment_status',
            label: 'Payment',
            render: (row) =>
              statusBadge(
                row.payment_status,
                getEnumLabel(enumLabels, 'payment_status', row.payment_status, locale)
              ),
          },
          {
            key: 'payment_method',
            label: 'Payment method',
            render: (row) => getEnumLabel(enumLabels, 'payment_method', row.payment_method, locale),
          },
          {
            key: 'total_amount',
            label: 'Total',
            render: (row) => formatCurrency(row.total_amount),
          },
        ]}
        drawerExtras={({ mode, selected, setFormValue }) => {
          if (mode === 'view' && selected) {
            return (
              <AdminOrderDetailPanel
                orderId={selected.id}
                enumLabels={enumLabels}
                locale={locale}
              />
            );
          }

          if (mode === 'create' || (mode === 'edit' && selected)) {
            return (
              <AdminOrderItemsEditor
                orderId={selected?.id}
                order={selected}
                products={products}
                setFormValue={setFormValue}
              />
            );
          }

          return null;
        }}
        hideViewFields
        createRequest={{ url: '/api/admin/orders', method: 'POST' }}
        updateRequest={(id) => ({
          url: `/api/admin/orders/${id}`,
          method: 'PATCH',
        })}
        deleteRequest={(id) => ({
          url: `/api/admin/orders/${id}`,
          method: 'DELETE',
        })}
      />
    </AdminShell>
  );
}

export function AdminCustomersScreen({
  session,
  customers,
  enumLabels,
}: {
  session: AdminSessionInfo;
  customers: AdminCustomerRecord[];
  enumLabels: AdminEnumLabels;
}) {
  const { locale, t } = useLocale();

  return (
    <AdminShell
      session={session}
      title="Customer management"
      subtitle="Manage profiles, roles, and account blocks from a single table. Customer creation stays in the auth flow."
      active="Customers"
    >
      <CrudManager
        title="Customer profiles"
        description="View and edit existing customer profiles. Create and delete are disabled here because profiles depend on authenticated users."
        records={customers}
        defaults={{
          id: '',
          fullName: '',
          phone: '',
          avatarUrl: '',
          role: 'customer',
          isBlocked: false,
        }}
        fields={[
          {
            name: 'id',
            label: 'User id',
            type: 'text',
            required: true,
            editableOn: ['create'],
          },
          {
            name: 'fullName',
            label: 'Full name',
            type: 'text',
            required: true,
            editableOn: ['create', 'edit'],
          },
          {
            name: 'phone',
            label: 'Phone',
            type: 'text',
            editableOn: ['create', 'edit'],
          },
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            required: true,
            editableOn: ['edit'],
            options: ['customer', 'admin', 'super_admin'].map((value) => ({
              label: getEnumLabel(enumLabels, 'user_role', value, locale),
              value,
            })),
          },
          {
            name: 'isBlocked',
            label: 'Blocked',
            type: 'switch',
            editableOn: ['edit'],
          },
        ]}
        columns={[
          { key: 'id', label: 'User id', render: (row) => row.id },
          {
            key: 'full_name',
            label: 'Full name',
            render: (row) => row.full_name || '—',
          },
          { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
          {
            key: 'role',
            label: 'Role',
            render: (row) =>
              statusBadge(row.role, getEnumLabel(enumLabels, 'user_role', row.role, locale)),
          },
          {
            key: 'is_blocked',
            label: 'Blocked',
            render: (row) => (row.is_blocked ? statusBadge('blocked', t('Blocked')) : t('No')),
          },
          {
            key: 'created_at',
            label: 'Created',
            render: (row) => formatDate(row.created_at),
          },
        ]}
        createRequest={{ url: '/api/admin/customers', method: 'POST' }}
        updateRequest={(id) => ({
          url: `/api/admin/customers/${id}`,
          method: 'PATCH',
        })}
        deleteRequest={(id) => ({
          url: `/api/admin/customers/${id}`,
          method: 'DELETE',
        })}
        allowCreate={false}
        allowDelete={false}
      />
    </AdminShell>
  );
}

export function AdminSettingsScreen({
  session,
  categories,
  brands,
  sizes,
  colors,
  coupons,
  flashSales,
  heroSlides,
  navigationItems,
  deliveryZones,
  enumLabels,
}: {
  session: AdminSessionInfo;
  categories: AdminCategoryRecord[];
  brands: AdminBrandRecord[];
  sizes: AdminSizeRecord[];
  colors: AdminColorRecord[];
  coupons: AdminCouponRecord[];
  flashSales: AdminFlashSaleRecord[];
  heroSlides: AdminHeroSlideRecord[];
  navigationItems: AdminNavigationItemRecord[];
  deliveryZones: AdminDeliveryZoneRecord[];
  enumLabels: AdminEnumLabels;
}) {
  const { t, locale } = useLocale();
  const navigationParentOptions = [{ label: t('Top level'), value: '' }].concat(
    navigationItems.map((item) => ({
      label: `${item.label}${item.parent_id ? ` / ${t('child')}` : ''}`,
      value: item.id,
    }))
  );

  return (
    <AdminShell
      session={session}
      title="Admin settings"
      subtitle="Lookup tables and structural catalog settings are editable from drawer-based CRUD panels."
      active="Settings"
    >
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="lg">
        <Paper
          radius={0}
          p="lg"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
          }}
        >
          <Text size="xs" tt="uppercase" c="var(--muted)" style={{ letterSpacing: 2.2 }}>
            {t('Categories')}
          </Text>
          <Text fw={800} size="2.1rem" mt={8}>
            {categories.length}
          </Text>
          <Text size="sm" c="var(--text-secondary)" mt={6}>
            {t('Control storefront categories, Arabic names, sorting, and active state here.')}
          </Text>
        </Paper>
        <Paper
          radius={0}
          p="lg"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
          }}
        >
          <Text size="xs" tt="uppercase" c="var(--muted)" style={{ letterSpacing: 2.2 }}>
            {t('Enums')}
          </Text>
          <Text fw={800} size="2.1rem" mt={8}>
            {Object.values(enumLabels).reduce((sum, group) => sum + Object.keys(group).length, 0)}
          </Text>
          <Text size="sm" c="var(--text-secondary)" mt={6}>
            {t(
              'Control English and Arabic labels for statuses, roles, payment methods, and other enum values here.'
            )}
          </Text>
        </Paper>
      </SimpleGrid>

      <Tabs
        defaultValue="categories"
        variant="outline"
        radius={0}
        styles={{
          tab: {
            borderColor: 'var(--border)',
            color: 'var(--text)',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
          },
          list: {
            borderColor: 'var(--border)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          },
          panel: {
            paddingTop: 20,
          },
        }}
      >
        <Tabs.List mb="lg">
          <Tabs.Tab value="categories">{t('Categories')}</Tabs.Tab>
          <Tabs.Tab value="coupons">{t('Coupons')}</Tabs.Tab>
          <Tabs.Tab value="delivery-zones">{t('Delivery zones')}</Tabs.Tab>
          <Tabs.Tab value="navigation">{t('Navigation')}</Tabs.Tab>
          <Tabs.Tab value="hero-slides">{t('Hero slides')}</Tabs.Tab>
          <Tabs.Tab value="flash-sales">{t('Flash sales')}</Tabs.Tab>
          <Tabs.Tab value="enums">{t('Enums')}</Tabs.Tab>
          <Tabs.Tab value="brands">{t('Brands')}</Tabs.Tab>
          <Tabs.Tab value="sizes">{t('Sizes')}</Tabs.Tab>
          <Tabs.Tab value="colors">{t('Colors')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="categories">
          <CrudManager
            title="Categories"
            description="Organize storefront navigation and category metadata."
            records={categories}
            defaults={{
              name: '',
              nameAr: '',
              slug: '',
              slugAr: '',
              description: '',
              descriptionAr: '',
              image: undefined,
              sortOrder: 0,
              isActive: true,
            }}
            fields={[
              {
                name: 'name',
                label: 'Name',
                type: 'text',
                required: true,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'nameAr',
                label: 'Arabic name',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'slug',
                label: 'Slug',
                type: 'text',
                required: true,
                editableOn: ['create'],
              },
              {
                name: 'slugAr',
                label: 'Arabic slug',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'description',
                label: 'Description',
                type: 'textarea',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'descriptionAr',
                label: 'Arabic description',
                type: 'textarea',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'image',
                label: 'Primary image',
                type: 'file',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'sortOrder',
                label: 'Sort order',
                type: 'number',
                min: 0,
                step: 1,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'isActive',
                label: 'Active',
                type: 'switch',
                editableOn: ['create', 'edit'],
              },
            ]}
            columns={[
              { key: 'name', label: 'Name', render: (row) => row.name },
              {
                key: 'name_ar',
                label: 'Arabic name',
                render: (row) => row.name_ar || '—',
              },
              { key: 'slug', label: 'Slug', render: (row) => row.slug },
              {
                key: 'slug_ar',
                label: 'Arabic slug',
                render: (row) => row.slug_ar || '—',
              },
              {
                key: 'sort_order',
                label: 'Sort order',
                render: (row) => row.sort_order,
              },
              {
                key: 'is_active',
                label: 'Active',
                render: (row) => (row.is_active ? t('Yes') : t('No')),
              },
            ]}
            drawerExtras={({ mode, selected }) =>
              mode === 'view' && selected && selected.image_url ? (
                <Paper
                  radius={0}
                  p="md"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--surface-border)',
                  }}
                >
                  <Text size="xs" tt="uppercase" c="dimmed" mb="sm">
                    {t('Primary image')}
                  </Text>
                  <Image
                    src={selected.image_url}
                    alt={selected.name}
                    h={220}
                    fit="cover"
                    radius={0}
                  />
                </Paper>
              ) : null
            }
            createRequest={{ url: '/api/admin/categories', method: 'POST' }}
            updateRequest={(id) => ({
              url: `/api/admin/categories/${id}`,
              method: 'PATCH',
            })}
            deleteRequest={(id) => ({
              url: `/api/admin/categories/${id}`,
              method: 'DELETE',
            })}
          />
        </Tabs.Panel>

        <Tabs.Panel value="coupons">
          <CrudManager
            title="Coupons"
            description="Create promo codes with percentage or fixed discounts, optional minimum basket values, and activation windows."
            records={coupons}
            defaults={{
              code: '',
              name: '',
              description: '',
              discountType: 'percentage',
              discountValue: 0,
              minSubtotal: '',
              startsAt: '',
              endsAt: '',
              isActive: true,
            }}
            fields={[
              {
                name: 'code',
                label: 'Code',
                type: 'text',
                required: true,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'name',
                label: 'Name',
                type: 'text',
                required: true,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'description',
                label: 'Description',
                type: 'textarea',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'discountType',
                label: 'Discount type',
                type: 'select',
                required: true,
                editableOn: ['create', 'edit'],
                options: ['percentage', 'fixed'].map((value) => ({
                  label: getEnumLabel(enumLabels, 'discount_type', value, locale),
                  value,
                })),
              },
              {
                name: 'discountValue',
                label: 'Discount value',
                type: 'number',
                required: true,
                min: 0,
                step: 0.01,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'minSubtotal',
                label: 'Minimum subtotal',
                type: 'number',
                min: 0,
                step: 0.01,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'startsAt',
                label: 'Starts at',
                type: 'datetime',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'endsAt',
                label: 'Ends at',
                type: 'datetime',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'isActive',
                label: 'Active',
                type: 'switch',
                editableOn: ['create', 'edit'],
              },
            ]}
            columns={[
              { key: 'code', label: 'Code', render: (row) => row.code },
              { key: 'name', label: 'Name', render: (row) => row.name },
              {
                key: 'discount_type',
                label: 'Discount',
                render: (row) =>
                  `${row.discount_value}${row.discount_type === 'percentage' ? '%' : ''} ${getEnumLabel(enumLabels, 'discount_type', row.discount_type, locale)}`,
              },
              {
                key: 'min_subtotal',
                label: 'Minimum subtotal',
                render: (row) =>
                  row.min_subtotal === null ? '—' : formatCurrency(row.min_subtotal),
              },
              {
                key: 'starts_at',
                label: 'Starts',
                render: (row) => (row.starts_at ? formatDateTime(row.starts_at) : '—'),
              },
              {
                key: 'ends_at',
                label: 'Ends',
                render: (row) => (row.ends_at ? formatDateTime(row.ends_at) : '—'),
              },
              {
                key: 'is_active',
                label: 'Active',
                render: (row) =>
                  row.is_active
                    ? statusBadge('active', t('Active'))
                    : statusBadge('inactive', t('Inactive')),
              },
            ]}
            createRequest={{ url: '/api/admin/coupons', method: 'POST' }}
            updateRequest={(id) => ({
              url: `/api/admin/coupons/${id}`,
              method: 'PATCH',
            })}
            deleteRequest={(id) => ({
              url: `/api/admin/coupons/${id}`,
              method: 'DELETE',
            })}
          />
        </Tabs.Panel>

        <Tabs.Panel value="navigation">
          <CrudManager
            title="Navigation"
            description="Control storefront catalog products, nested sub-navigation, and explicit paths."
            records={navigationItems}
            defaults={{
              parentId: '',
              label: '',
              labelAr: '',
              path: '',
              sortOrder: 0,
              isActive: true,
            }}
            fields={[
              {
                name: 'parentId',
                label: 'Parent item',
                type: 'select',
                editableOn: ['create', 'edit'],
                options: navigationParentOptions,
              },
              {
                name: 'label',
                label: 'Label',
                type: 'text',
                required: true,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'labelAr',
                label: 'Arabic label',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'path',
                label: 'Path',
                type: 'text',
                required: true,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'sortOrder',
                label: 'Sort order',
                type: 'number',
                min: 0,
                step: 1,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'isActive',
                label: 'Active',
                type: 'switch',
                editableOn: ['create', 'edit'],
              },
            ]}
            columns={[
              {
                key: 'label',
                label: 'Label',
                render: (row) => `${row.parent_id ? '↳ ' : ''}${row.label}`,
              },
              {
                key: 'label_ar',
                label: 'Arabic label',
                render: (row) => row.label_ar || '—',
              },
              {
                key: 'parent_id',
                label: 'Parent item',
                render: (row) =>
                  navigationItems.find((item) => item.id === row.parent_id)?.label || '—',
              },
              { key: 'path', label: 'Path', render: (row) => row.path },
              {
                key: 'sort_order',
                label: 'Sort order',
                render: (row) => row.sort_order,
              },
              {
                key: 'is_active',
                label: 'Active',
                render: (row) => (row.is_active ? t('Yes') : t('No')),
              },
            ]}
            createRequest={{ url: '/api/admin/navigation', method: 'POST' }}
            updateRequest={(id) => ({
              url: `/api/admin/navigation/${id}`,
              method: 'PATCH',
            })}
            deleteRequest={(id) => ({
              url: `/api/admin/navigation/${id}`,
              method: 'DELETE',
            })}
          />
        </Tabs.Panel>

        <Tabs.Panel value="delivery-zones">
          <CrudManager
            title="Delivery zones"
            description="Control delivery fees by country and city. Leave city empty to create a country-wide fallback fee."
            records={deliveryZones}
            defaults={{
              country: '',
              countryAr: '',
              city: '',
              cityAr: '',
              fee: 0,
              sortOrder: 0,
              isActive: true,
            }}
            fields={[
              {
                name: 'country',
                label: 'Country',
                type: 'text',
                required: true,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'countryAr',
                label: 'Arabic country',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'city',
                label: 'City',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'cityAr',
                label: 'Arabic city',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'fee',
                label: 'Delivery fee',
                type: 'number',
                required: true,
                min: 0,
                step: 0.01,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'sortOrder',
                label: 'Sort order',
                type: 'number',
                min: 0,
                step: 1,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'isActive',
                label: 'Active',
                type: 'switch',
                editableOn: ['create', 'edit'],
              },
            ]}
            columns={[
              {
                key: 'country',
                label: 'Country',
                render: (row) => row.country,
              },
              {
                key: 'country_ar',
                label: 'Arabic country',
                render: (row) => row.country_ar || '—',
              },
              { key: 'city', label: 'City', render: (row) => row.city || '—' },
              {
                key: 'city_ar',
                label: 'Arabic city',
                render: (row) => row.city_ar || '—',
              },
              {
                key: 'fee',
                label: 'Delivery fee',
                render: (row) => formatCurrency(row.fee),
              },
              {
                key: 'sort_order',
                label: 'Sort order',
                render: (row) => row.sort_order,
              },
              {
                key: 'is_active',
                label: 'Active',
                render: (row) => (row.is_active ? t('Yes') : t('No')),
              },
            ]}
            createRequest={{ url: '/api/admin/delivery-zones', method: 'POST' }}
            updateRequest={(id) => ({
              url: `/api/admin/delivery-zones/${id}`,
              method: 'PATCH',
            })}
            deleteRequest={(id) => ({
              url: `/api/admin/delivery-zones/${id}`,
              method: 'DELETE',
            })}
          />
        </Tabs.Panel>

        <Tabs.Panel value="hero-slides">
          <CrudManager
            title="Hero slides"
            description="Control the home hero carousel with separate English and Arabic artwork, auto-slide timing, and CTA copy. Recommended size: 2200 x 1400 px for each image."
            records={heroSlides}
            defaults={{
              eyebrow: '',
              eyebrowAr: '',
              title: '',
              titleAr: '',
              description: '',
              descriptionAr: '',
              buttonText: '',
              buttonTextAr: '',
              buttonUrl: '',
              imageEn: undefined,
              imageAr: undefined,
              displaySeconds: 6,
              sortOrder: 0,
              isActive: true,
            }}
            fields={[
              {
                name: 'eyebrow',
                label: 'Eyebrow',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'eyebrowAr',
                label: 'Arabic eyebrow',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'title',
                label: 'Title',
                type: 'text',
                required: true,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'titleAr',
                label: 'Arabic title',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'description',
                label: 'Description',
                type: 'textarea',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'descriptionAr',
                label: 'Arabic description',
                type: 'textarea',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'buttonText',
                label: 'Button text',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'buttonTextAr',
                label: 'Arabic button text',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'buttonUrl',
                label: 'Button URL',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'imageEn',
                label: 'English image',
                type: 'file',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'imageAr',
                label: 'Arabic image',
                type: 'file',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'displaySeconds',
                label: 'Display seconds',
                type: 'number',
                required: true,
                min: 2,
                step: 1,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'sortOrder',
                label: 'Sort order',
                type: 'number',
                min: 0,
                step: 1,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'isActive',
                label: 'Active',
                type: 'switch',
                editableOn: ['create', 'edit'],
              },
            ]}
            columns={[
              { key: 'title', label: 'Title', render: (row) => row.title },
              {
                key: 'title_ar',
                label: 'Arabic title',
                render: (row) => row.title_ar || '—',
              },
              {
                key: 'display_seconds',
                label: 'Seconds',
                render: (row) => row.display_seconds,
              },
              {
                key: 'sort_order',
                label: 'Sort order',
                render: (row) => row.sort_order,
              },
              {
                key: 'is_active',
                label: 'Active',
                render: (row) => (row.is_active ? t('Yes') : t('No')),
              },
            ]}
            drawerExtras={({ mode, selected }) =>
              mode === 'view' && selected ? (
                <SimpleGrid cols={{ base: 1, md: 2 }}>
                  {selected.image_en_url ? (
                    <Paper
                      radius={0}
                      p="md"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--surface-border)',
                      }}
                    >
                      <Text size="xs" tt="uppercase" c="dimmed" mb="sm">
                        {t('English image')}
                      </Text>
                      <Image
                        src={selected.image_en_url}
                        alt={selected.title}
                        h={220}
                        fit="cover"
                        radius={0}
                      />
                    </Paper>
                  ) : null}
                  {selected.image_ar_url ? (
                    <Paper
                      radius={0}
                      p="md"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--surface-border)',
                      }}
                    >
                      <Text size="xs" tt="uppercase" c="dimmed" mb="sm">
                        {t('Arabic image')}
                      </Text>
                      <Image
                        src={selected.image_ar_url}
                        alt={selected.title_ar || selected.title}
                        h={220}
                        fit="cover"
                        radius={0}
                      />
                    </Paper>
                  ) : null}
                </SimpleGrid>
              ) : (
                <Text size="sm" c="dimmed">
                  {t(
                    'Use 2200 x 1400 px images. Keep the subject centered so mobile crops stay safe.'
                  )}
                </Text>
              )
            }
            createRequest={{ url: '/api/admin/hero-slides', method: 'POST' }}
            updateRequest={(id) => ({
              url: `/api/admin/hero-slides/${id}`,
              method: 'PATCH',
            })}
            deleteRequest={(id) => ({
              url: `/api/admin/hero-slides/${id}`,
              method: 'DELETE',
            })}
          />
        </Tabs.Panel>

        <Tabs.Panel value="flash-sales">
          <CrudManager
            title="Flash sales"
            description="Schedule time-boxed discounts, promo copy, CTA links, and modal behavior from one place."
            records={flashSales}
            defaults={{
              title: '',
              description: '',
              discountType: 'percentage',
              discountValue: 0,
              startsAt: '',
              endsAt: '',
              showAsModal: false,
              modalTitle: '',
              modalDescription: '',
              buttonText: '',
              buttonUrl: '',
              image: undefined,
              sortOrder: 0,
              isActive: true,
            }}
            fields={[
              {
                name: 'title',
                label: 'Title',
                type: 'text',
                required: true,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'description',
                label: 'Description',
                type: 'textarea',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'discountType',
                label: 'Discount type',
                type: 'select',
                required: true,
                editableOn: ['create', 'edit'],
                options: ['percentage', 'fixed'].map((value) => ({
                  label: getEnumLabel(enumLabels, 'discount_type', value, locale),
                  value,
                })),
              },
              {
                name: 'discountValue',
                label: 'Discount value',
                type: 'number',
                required: true,
                min: 0,
                step: 0.01,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'startsAt',
                label: 'Starts at',
                type: 'datetime',
                required: true,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'endsAt',
                label: 'Ends at',
                type: 'datetime',
                required: true,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'showAsModal',
                label: 'Show as modal',
                type: 'switch',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'modalTitle',
                label: 'Modal title',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'modalDescription',
                label: 'Modal description',
                type: 'textarea',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'buttonText',
                label: 'Button text',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'buttonUrl',
                label: 'Button URL',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'image',
                label: 'Promo image',
                type: 'file',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'sortOrder',
                label: 'Sort order',
                type: 'number',
                min: 0,
                step: 1,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'isActive',
                label: 'Active',
                type: 'switch',
                editableOn: ['create', 'edit'],
              },
            ]}
            columns={[
              { key: 'title', label: 'Title', render: (row) => row.title },
              {
                key: 'discount_type',
                label: 'Discount',
                render: (row) =>
                  `${row.discount_value}${row.discount_type === 'percentage' ? '%' : ''} ${getEnumLabel(enumLabels, 'discount_type', row.discount_type, locale)}`,
              },
              {
                key: 'starts_at',
                label: 'Starts',
                render: (row) => formatDateTime(row.starts_at),
              },
              {
                key: 'ends_at',
                label: 'Ends',
                render: (row) => formatDateTime(row.ends_at),
              },
              {
                key: 'show_as_modal',
                label: 'Modal',
                render: (row) => (row.show_as_modal ? t('Yes') : t('No')),
              },
              {
                key: 'is_active',
                label: 'Active',
                render: (row) =>
                  row.is_active
                    ? statusBadge('active', t('Active'))
                    : statusBadge('inactive', t('Inactive')),
              },
            ]}
            drawerExtras={({ mode, selected }) =>
              mode === 'view' && selected && selected.image_url ? (
                <Paper
                  radius={0}
                  p="md"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--surface-border)',
                  }}
                >
                  <Text size="xs" tt="uppercase" c="dimmed" mb="sm">
                    {t('Promo image')}
                  </Text>
                  <Image
                    src={selected.image_url}
                    alt={selected.title}
                    h={220}
                    fit="cover"
                    radius={0}
                  />
                </Paper>
              ) : null
            }
            createRequest={{ url: '/api/admin/flash-sales', method: 'POST' }}
            updateRequest={(id) => ({
              url: `/api/admin/flash-sales/${id}`,
              method: 'PATCH',
            })}
            deleteRequest={(id) => ({
              url: `/api/admin/flash-sales/${id}`,
              method: 'DELETE',
            })}
          />
        </Tabs.Panel>

        <Tabs.Panel value="enums">
          <EnumLabelsManager enumLabels={enumLabels} />
        </Tabs.Panel>

        <Tabs.Panel value="brands">
          <CrudManager
            title="Brands"
            description="Edit label taxonomy for brand-driven filtering and merchandising."
            records={brands}
            defaults={{
              name: '',
              nameAr: '',
              slug: '',
              slugAr: '',
              description: '',
              descriptionAr: '',
              logoUrl: '',
              isActive: true,
            }}
            fields={[
              {
                name: 'name',
                label: 'Name',
                type: 'text',
                required: true,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'nameAr',
                label: 'Arabic name',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'slug',
                label: 'Slug',
                type: 'text',
                required: true,
                editableOn: ['create'],
              },
              {
                name: 'slugAr',
                label: 'Arabic slug',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'description',
                label: 'Description',
                type: 'textarea',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'descriptionAr',
                label: 'Arabic description',
                type: 'textarea',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'logoUrl',
                label: 'Brand logo',
                type: 'file',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'isActive',
                label: 'Active',
                type: 'switch',
                editableOn: ['edit'],
              },
            ]}
            columns={[
              { key: 'name', label: 'Name', render: (row) => row.name },
              {
                key: 'name_ar',
                label: 'Arabic name',
                render: (row) => row.name_ar || '—',
              },
              { key: 'slug', label: 'Slug', render: (row) => row.slug },
              {
                key: 'slug_ar',
                label: 'Arabic slug',
                render: (row) => row.slug_ar || '—',
              },
              {
                key: 'is_active',
                label: 'Active',
                render: (row) => (row.is_active ? t('Yes') : t('No')),
              },
            ]}
            drawerExtras={({ mode, selected }) =>
              mode === 'view' && selected && selected.logo_url ? (
                <Paper
                  radius="xs"
                  p="md"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <Text size="xs" tt="uppercase" c="dimmed" mb="sm">
                    {t('Brand logo')}
                  </Text>
                  <Image src={selected.logo_url} alt={selected.name} h={180} fit="contain" />
                </Paper>
              ) : null
            }
            createRequest={{ url: '/api/admin/lookups/brands', method: 'POST' }}
            updateRequest={() => ({
              url: '/api/admin/lookups/brands',
              method: 'PATCH',
            })}
            deleteRequest={(id) => ({
              url: `/api/admin/lookups/brands?id=${id}`,
              method: 'DELETE',
            })}
          />
        </Tabs.Panel>

        <Tabs.Panel value="sizes">
          <CrudManager
            title="Sizes"
            description="Maintain sizing options used across variants."
            records={sizes}
            defaults={{
              code: '',
              name: '',
              nameAr: '',
              sortOrder: 0,
              isActive: true,
            }}
            fields={[
              {
                name: 'code',
                label: 'Code',
                type: 'text',
                required: true,
                editableOn: ['create'],
              },
              {
                name: 'name',
                label: 'Name',
                type: 'text',
                required: true,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'nameAr',
                label: 'Arabic name',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'sortOrder',
                label: 'Sort order',
                type: 'number',
                min: 0,
                step: 1,
                editableOn: ['edit'],
              },
              {
                name: 'isActive',
                label: 'Active',
                type: 'switch',
                editableOn: ['edit'],
              },
            ]}
            columns={[
              { key: 'code', label: 'Code', render: (row) => row.code },
              { key: 'name', label: 'Name', render: (row) => row.name },
              {
                key: 'name_ar',
                label: 'Arabic name',
                render: (row) => row.name_ar || '—',
              },
              {
                key: 'sort_order',
                label: 'Sort order',
                render: (row) => row.sort_order,
              },
              {
                key: 'is_active',
                label: 'Active',
                render: (row) => (row.is_active ? t('Yes') : t('No')),
              },
            ]}
            createRequest={{ url: '/api/admin/lookups/sizes', method: 'POST' }}
            updateRequest={() => ({
              url: '/api/admin/lookups/sizes',
              method: 'PATCH',
            })}
            deleteRequest={(id) => ({
              url: `/api/admin/lookups/sizes?id=${id}`,
              method: 'DELETE',
            })}
          />
        </Tabs.Panel>

        <Tabs.Panel value="colors">
          <CrudManager
            title="Colors"
            description="Manage color swatches and variant color naming."
            records={colors}
            defaults={{
              code: '',
              name: '',
              nameAr: '',
              hexCode: '',
              sortOrder: 0,
              isActive: true,
            }}
            fields={[
              {
                name: 'code',
                label: 'Code',
                type: 'text',
                required: true,
                editableOn: ['create'],
              },
              {
                name: 'name',
                label: 'Name',
                type: 'text',
                required: true,
                editableOn: ['create', 'edit'],
              },
              {
                name: 'nameAr',
                label: 'Arabic name',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'hexCode',
                label: 'Hex code',
                type: 'text',
                editableOn: ['create', 'edit'],
              },
              {
                name: 'sortOrder',
                label: 'Sort order',
                type: 'number',
                min: 0,
                step: 1,
                editableOn: ['edit'],
              },
              {
                name: 'isActive',
                label: 'Active',
                type: 'switch',
                editableOn: ['edit'],
              },
            ]}
            columns={[
              { key: 'code', label: 'Code', render: (row) => row.code },
              { key: 'name', label: 'Name', render: (row) => row.name },
              {
                key: 'name_ar',
                label: 'Arabic name',
                render: (row) => row.name_ar || '—',
              },
              {
                key: 'hex_code',
                label: 'Hex code',
                render: (row) => row.hex_code || '—',
              },
              {
                key: 'is_active',
                label: 'Active',
                render: (row) => (row.is_active ? t('Yes') : t('No')),
              },
            ]}
            createRequest={{ url: '/api/admin/lookups/colors', method: 'POST' }}
            updateRequest={() => ({
              url: '/api/admin/lookups/colors',
              method: 'PATCH',
            })}
            deleteRequest={(id) => ({
              url: `/api/admin/lookups/colors?id=${id}`,
              method: 'DELETE',
            })}
          />
        </Tabs.Panel>
      </Tabs>
    </AdminShell>
  );
}

export function AdminLoginScreen() {
  const router = useRouter();
  const { t, dir } = useLocale();
  const [modalError, setModalError] = useState<ModalErrorState | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const schema = z.object({
    email: z.string().email(t('Enter a valid email')),
    password: z.string().min(1, t('This field is required')),
  });
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string; password: string }>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  function handleInvalidSubmit(formErrors: unknown) {
    openFieldErrorModal(formErrors, setModalError, t('Please fix the form errors'));
  }

  async function onSubmit(values: { email: string; password: string }) {
    setModalError(null);
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setModalError({
        title: t('Login failed'),
        messages: [payload?.error ?? t('Something went wrong')],
      });
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <Box
      dir={dir}
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 12% 18%, rgba(210,235,245,0.12), transparent 24%), radial-gradient(circle at 88% 78%, rgba(199,32,47,0.14), transparent 28%), var(--admin-background)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '58vw',
          height: '34vw',
          minWidth: 360,
          minHeight: 220,
          top: '-12vw',
          left: '-10vw',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(225,242,248,0.16), rgba(225,242,248,0) 70%)',
          filter: 'blur(30px)',
          transform: 'rotate(-16deg)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '52vw',
          height: '38vw',
          minWidth: 340,
          minHeight: 250,
          right: '-12vw',
          bottom: '-14vw',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(199,32,47,0.18), rgba(199,32,47,0) 70%)',
          filter: 'blur(36px)',
          transform: 'rotate(18deg)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '8% 22%',
          border: '1px solid rgba(215,239,246,0.08)',
          borderRadius: '46% 54% 52% 48%',
          transform: 'rotate(-9deg)',
          boxShadow: 'inset 0 0 100px rgba(210,240,248,0.035), 0 0 70px rgba(210,240,248,0.03)',
          pointerEvents: 'none',
        }}
      />
      <ErrorModal error={modalError} onClose={() => setModalError(null)} />
      <Box maw={1080} w="100%" style={{ position: 'relative', zIndex: 1 }}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={0}>
          <Paper
            radius="md"
            p="xl"
            style={{
              minHeight: 640,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #080909 0%, #151718 62%, #c7202f 180%)',
              color: '#ffffff',
              border: '1px solid var(--border)',
              borderRight: 'none',
              boxShadow: '0 30px 90px rgba(0,0,0,0.28)',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 360,
                height: 360,
                top: -150,
                right: -120,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(220,245,255,0.18), rgba(220,245,255,0) 68%)',
                filter: 'blur(8px)',
                pointerEvents: 'none',
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 420,
                height: 190,
                left: -150,
                bottom: 80,
                borderRadius: '50%',
                background:
                  'radial-gradient(ellipse, rgba(230,238,240,0.14), rgba(230,238,240,0) 70%)',
                filter: 'blur(22px)',
                transform: 'rotate(-18deg)',
                pointerEvents: 'none',
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 220,
                height: 440,
                top: 120,
                right: 38,
                border: '1px solid rgba(210,240,248,0.1)',
                borderRadius: '48% 52% 42% 58%',
                transform: 'rotate(22deg)',
                boxShadow: 'inset 0 0 50px rgba(208,239,248,0.06), 0 0 50px rgba(208,239,248,0.04)',
                pointerEvents: 'none',
              }}
            />
            <Group
              justify="space-between"
              align="start"
              style={{ position: 'relative', zIndex: 1 }}
            >
              <Group gap="sm" align="center">
                <img
                  src="/puff-jordan-logo-light.png"
                  alt="Puff Jo"
                  style={{
                    width: 76,
                    height: 42,
                    objectFit: 'contain',
                    objectPosition: 'left center',
                  }}
                />
                <Text
                  size="xs"
                  tt="uppercase"
                  c="rgba(255,255,255,0.72)"
                  style={{ letterSpacing: 3 }}
                >
                  {t('Admin panel')}
                </Text>
              </Group>
              <LocaleSwitcher />
            </Group>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Text
                fw={800}
                size="clamp(2.4rem, 8vw, 3.4rem)"
                mt="md"
                tt="uppercase"
                style={{ lineHeight: 0.95, letterSpacing: 1.4 }}
              >
                {t('PUFF JORDAN')}
              </Text>
              <Text
                mt="lg"
                c="rgba(255,255,255,0.78)"
                maw={420}
                style={{ lineHeight: 1.8, overflowWrap: 'anywhere' }}
              >
                {t(
                  'Manage the PUFF Jordan storefront, from products and orders to customers and settings.'
                )}
              </Text>
            </div>

            <Stack gap="sm" style={{ position: 'relative', zIndex: 1 }}>
              {['Catalog control', 'Orders and customers', 'Store settings'].map((item) => (
                <Paper
                  key={item}
                  radius="md"
                  p="md"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  <Text size="sm" c="rgba(255,255,255,0.82)">
                    {t(item)}
                  </Text>
                </Paper>
              ))}
            </Stack>
          </Paper>

          <Paper
            radius="md"
            p="xl"
            style={{
              minHeight: 640,
              display: 'flex',
              alignItems: 'center',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 32px 120px rgba(0, 0, 0, 0.18)',
            }}
          >
            <Box w="100%">
              <Text size="xs" tt="uppercase" c="#c7202f" fw={700} style={{ letterSpacing: 3 }}>
                {t('PUFF JO / ADMIN')}
              </Text>
              <Text
                fw={800}
                size="2.4rem"
                mt="sm"
                tt="uppercase"
                c="var(--text)"
                style={{ lineHeight: 1 }}
              >
                {t('Sign in to continue')}
              </Text>
              <Text c="var(--text-secondary)" mt="sm" style={{ overflowWrap: 'anywhere' }}>
                {t('Use your admin credentials to access the PUFF Jordan dashboard.')}
              </Text>

              <Divider my="xl" color="var(--border)" />

              <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)}>
                <Stack gap="md">
                  <TextInput
                    label={t('Email')}
                    error={errors.email?.message}
                    radius="md"
                    styles={adminInputStyles}
                    {...register('email')}
                  />
                  <TextInput
                    type={showPassword ? 'text' : 'password'}
                    label={t('Password')}
                    error={errors.password?.message}
                    radius="md"
                    styles={adminInputStyles}
                    rightSection={
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={t(showPassword ? 'Hide password' : 'Show password')}
                      >
                        {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                      </ActionIcon>
                    }
                    rightSectionPointerEvents="auto"
                    {...register('password')}
                  />
                  <Button
                    type="submit"
                    radius="xl"
                    loading={isSubmitting}
                    mt="md"
                    styles={adminPrimaryButtonStyles}
                  >
                    {t('LOG IN')}
                  </Button>
                </Stack>
              </form>
            </Box>
          </Paper>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
