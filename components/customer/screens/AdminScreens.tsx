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
import { IconEye, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { AdminShell } from '@/components/customer/AdminShell';
import { LocaleSwitcher, useLocale } from '@/components/storefront/locale-provider';
import { useThemeMode } from '@/components/storefront/theme-provider';
import {
  AdminBrandRecord,
  AdminCategoryRecord,
  AdminColorRecord,
  AdminCustomerRecord,
  AdminFlashSaleRecord,
  AdminHeroSlideRecord,
  AdminOrderRecord,
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
    product_name: string;
    sku: string | null;
    size_name: string | null;
    color_name: string | null;
    image_url: string | null;
    unit_price: string | number;
    quantity: number;
    line_total: string | number;
  }>;
};

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
  }) => ReactNode;
  allowCreate?: boolean;
  allowDelete?: boolean;
};

const adminInputStyles = {
  input: {
    borderRadius: '0.25rem',
    background: 'var(--card)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  },
  label: {
    marginBottom: 6,
    color: 'var(--text)',
    fontSize: '0.82rem',
    letterSpacing: '0.04em',
  },
  error: {
    marginTop: 4,
  },
} as const;

const adminSelectStyles = {
  input: {
    borderRadius: '0.25rem',
    background: 'var(--card)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  },
  label: {
    marginBottom: 6,
    color: 'var(--text)',
    fontSize: '0.82rem',
    letterSpacing: '0.04em',
  },
  section: {
    color: 'var(--muted)',
  },
} as const;

const adminPrimaryButtonStyles = {
  root: {
    background: 'var(--accent)',
    color: 'var(--background)',
    border: '1px solid var(--border)',
  },
  label: {
    color: 'var(--background)',
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
} as const;

const adminSecondaryButtonStyles = {
  root: {
    background: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
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
    setModalError({ title, messages: ['Please review the highlighted fields.'] });
    return;
  }

  setModalError({ title, messages });
}

function ErrorModal({
  error,
  onClose,
}: {
  error: ModalErrorState | null;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={Boolean(error)}
      onClose={onClose}
      centered
      title={error?.title}
      styles={{
        content: {
          background: 'var(--surface)',
          color: 'var(--text)',
          border: '1px solid var(--surface-border)',
        },
        header: {
          background: 'var(--surface)',
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
            {message}
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

function AdminOrderDetailPanel({ orderId }: { orderId: string }) {
  const { t } = useLocale();
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/orders/${orderId}`);
        const payload = (await response.json()) as { data?: AdminOrderDetail; error?: string };

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

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Paper
          p="md"
          radius={0}
          style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
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
                    {t(key.replaceAll('_', ' '))}
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
          style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
        >
          <Text size="xs" tt="uppercase" c="dimmed" mb="sm">
            {t('Billing')}
          </Text>
          <Stack gap={6}>
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
            <Divider my="xs" />
            {Object.entries(billingAddress).length ? (
              Object.entries(billingAddress).map(([key, value]) => (
                <Group key={key} justify="space-between" align="start">
                  <Text size="xs" c="dimmed" tt="uppercase">
                    {t(key.replaceAll('_', ' '))}
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
        style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
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
                style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}
              >
                <Image
                  src={item.image_url || '/products/product-placeholder.svg'}
                  alt={item.product_name}
                  w={72}
                  h={92}
                  radius={0}
                  fit="cover"
                />
                <Stack gap={6} style={{ flex: 1 }}>
                  <Text fw={600}>{item.product_name}</Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <Text size="sm" c="dimmed">
                      {t('Color')}: {item.color_name || '—'}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {t('Size')}: {item.size_name || '—'}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {t('Quantity')}: {item.quantity}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {t('SKU')}: {item.sku || '—'}
                    </Text>
                  </SimpleGrid>
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

      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {t('Placed on')}: {formatDate(detail.created_at)}
        </Text>
        <Badge color="gray" radius={0}>
          {detail.order_number}
        </Badge>
      </Group>
    </Stack>
  );
}

function inventoryBadge(quantity: number) {
  const tone = quantity <= 0 ? 'red' : quantity <= 5 ? 'yellow' : 'teal';
  const label =
    quantity <= 0 ? 'Out of stock' : quantity <= 5 ? `Low: ${quantity}` : `${quantity} in stock`;

  return (
    <Badge color={tone} variant="light" radius="sm">
      {label}
    </Badge>
  );
}

function rowValue(row: Record<string, unknown>, field: CrudField) {
  const value = getRowFieldValue(row, field.name);

  if (field.type === 'switch') {
    return value ? 'Yes' : 'No';
  }

  if (field.type === 'datetime') {
    return formatDateTime(String(value));
  }

  if (value === null || value === undefined || value === '') {
    return '—';
  }

  return String(value);
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
  allowCreate = true,
  allowDelete = true,
}: CrudManagerProps<T>) {
  const router = useRouter();
  const { t } = useLocale();
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
        const value =
          getRowFieldValue(selected as Record<string, unknown>, field.name) ?? defaults[field.name];
        nextValues[field.name] = field.type === 'datetime' ? toDateTimeInputValue(value) : value;

        if (field.type === 'file') {
          const existingUrl = getRowFieldValue(
            selected as Record<string, unknown>,
            `${field.name}Url`
          );

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
    setValue(fieldName, undefined, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  }

  function handleInvalidSubmit(formErrors: unknown) {
    openFieldErrorModal(formErrors, setModalError, t('Please fix the form errors'));
  }

  async function onSubmit(values: Record<string, unknown>) {
    setSubmitting(true);
    setModalError(null);

    const request = mode === 'edit' && selected ? updateRequest(selected.id) : createRequest;
    const hasFileFields = editableFields.some((field) => field.type === 'file');
    let response: Response;

    if (hasFileFields) {
      const formData = new FormData();

      for (const field of editableFields) {
        const value = values[field.name];

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
            Object.entries(values).map(([key, value]) => {
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
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
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
    if (!window.confirm(t('Are you sure you want to delete this record?'))) {
      return;
    }

    const request = deleteRequest(row.id);
    const response = await fetch(request.url, { method: request.method });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
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
            {t(title)}
          </Text>
          <Text size="sm" c="dimmed">
            {t(description)}
          </Text>
        </Stack>
        {allowCreate ? (
          <Button
            leftSection={<IconPlus size={16} />}
            radius={0}
            variant="default"
            styles={adminPrimaryButtonStyles}
            onClick={() => setMode('create')}
          >
            {t(createLabel ?? 'Add new')}
          </Button>
        ) : null}
      </Group>

      <ScrollArea>
        <Table verticalSpacing="md" striped highlightOnHover withTableBorder>
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
        position="right"
        size="lg"
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
          },
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
          <Stack gap="sm">
            {drawerExtras ? drawerExtras({ mode, selected }) : null}
            {fields.map((field) => (
              <Box key={field.name}>
                <Text size="xs" tt="uppercase" c="dimmed" mb={4}>
                  {t(field.label)}
                </Text>
                <Text>{rowValue(selected as Record<string, unknown>, field)}</Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)}>
            <Stack gap="md">
              {drawerExtras ? drawerExtras({ mode, selected }) : null}
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
                          color="dark"
                        />
                      )}
                    />
                  );
                }

                if (field.type === 'file') {
                  const previewItems = filePreviews[field.name] ?? [];
                  const fileRegistration = register(field.name);

                  return (
                    <Box key={field.name}>
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
                              radius={0}
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              <Group justify="space-between" align="start" wrap="nowrap">
                                <Group align="start" wrap="nowrap">
                                  <Image src={item.url} alt={item.name} w={72} h={92} fit="cover" />
                                  <Stack gap={2}>
                                    <Text size="sm" fw={600}>
                                      {item.isExisting ? t('Current image') : t('Selected image')}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                      {item.name}
                                    </Text>
                                  </Stack>
                                </Group>
                                <Button
                                  type="button"
                                  size="xs"
                                  variant="default"
                                  radius={0}
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

function getEnumLabel(
  enumLabels: AdminEnumLabels,
  enumKey: AdminEnumKey,
  value: string,
  locale: 'en' | 'ar'
) {
  return enumLabels[enumKey]?.[value]?.[locale] ?? value;
}

function EnumLabelsManager({ enumLabels }: { enumLabels: AdminEnumLabels }) {
  const { t } = useLocale();
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
        { name: 'en', label: 'English label', type: 'text', required: true, editableOn: ['edit'] },
        { name: 'ar', label: 'Arabic label', type: 'text', required: true, editableOn: ['edit'] },
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
    { label: 'Products', value: products.length, detail: 'Live catalog records' },
    { label: 'Orders', value: orders.length, detail: 'Trackable orders' },
    { label: 'Customers', value: customers.length, detail: 'Profiles and roles' },
    {
      label: 'Categories',
      value: categories.length + brands.length,
      detail: 'Taxonomy and brands',
    },
  ];

  return (
    <AdminShell
      session={session}
      title="Operations dashboard"
      subtitle="Connected admin dashboard with live catalog, customer, order, and settings control."
      active="Dashboard"
    >
      <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="lg">
        {cards.map((card) => (
          <Paper
            key={card.label}
            radius={0}
            p="lg"
            style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
          >
            <Text size="xs" tt="uppercase" c="var(--muted)" style={{ letterSpacing: 2.2 }}>
              {t(card.label)}
            </Text>
            <Text fw={800} size="2.2rem" mt={8}>
              {card.value}
            </Text>
            <Text size="sm" c="var(--text-secondary)" mt={6}>
              {t(card.detail)}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg" mt="lg">
        <Paper
          radius={0}
          p="lg"
          style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
        >
          <Text fw={700} mb="md">
            {t('Recent orders')}
          </Text>
          <Table striped>
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
        </Paper>

        <Paper
          radius={0}
          p="lg"
          style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
        >
          <Text fw={700} mb="md">
            {t('Recent products')}
          </Text>
          <Table striped>
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
  sizes,
  colors,
  variants,
  enumLabels,
}: {
  session: AdminSessionInfo;
  products: AdminProductRecord[];
  categories: AdminCategoryRecord[];
  brands: AdminBrandRecord[];
  sizes: AdminSizeRecord[];
  colors: AdminColorRecord[];
  variants: AdminProductVariantRecord[];
  enumLabels: AdminEnumLabels;
}) {
  const { locale } = useLocale();
  const productVariantMap = new Map(
    products.map((product) => [
      product.id,
      variants.filter((variant) => variant.product_id === product.id),
    ])
  );

  return (
    <AdminShell
      session={session}
      title="Product management"
      subtitle="Every product is editable in place with create, view, edit, and delete flows."
      active="Products"
    >
      <ProductCrudManager
        products={products}
        categories={categories}
        brands={brands}
        sizes={sizes}
        colors={colors}
        variants={variants}
        enumLabels={enumLabels}
      />
    </AdminShell>
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
  sizes,
  colors,
  variants,
  enumLabels,
}: {
  products: AdminProductRecord[];
  categories: AdminCategoryRecord[];
  brands: AdminBrandRecord[];
  sizes: AdminSizeRecord[];
  colors: AdminColorRecord[];
  variants: AdminProductVariantRecord[];
  enumLabels: AdminEnumLabels;
}) {
  const router = useRouter();
  const { t, locale } = useLocale();
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
    () =>
      (sizes.length
        ? sizes
        : [{ id: '', name: '', name_ar: '', code: '', sort_order: 0, is_active: true }]
      ).map((size) => ({
        ...emptyVariantRow(),
        sizeId: size.id,
        colorId: colors[0]?.id ?? '',
        sku: buildVariantSku(size.code, colors[0]?.code),
        barcode: buildVariantBarcode(),
      })),
    [colors, sizes]
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
    }),
    [brands, categories, defaultVariantRows]
  );
  const {
    control,
    formState: { errors },
    getValues,
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
  const {
    fields: variantFields,
    append,
    remove,
    replace,
  } = useFieldArray<any>({
    control,
    name: 'variants',
  });
  const watchedBasePrice = useWatch({ control, name: 'basePrice' });
  const watchedCompareAtPrice = useWatch({ control, name: 'compareAtPrice' });
  const watchedVariants = useWatch({ control, name: 'variants' }) as
    | ProductVariantFormRow[]
    | undefined;

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
      replace(defaultVariantRows);
      setExistingMainImageUrl('');
      setExistingSubImageUrls([]);
      return;
    }

    if (selected) {
      const mappedVariants = (productVariantMap.get(selected.id) ?? []).map(
        (variant: AdminProductVariantRecord) => ({
          sizeId: variant.size_id ?? '',
          colorId: variant.color_id ?? colors[0]?.id ?? '',
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
        })
      );

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
      });
      replace(mappedVariants.length ? mappedVariants : defaultVariantRows);
      setExistingMainImageUrl(selected.primary_image_url ?? '');
      setExistingSubImageUrls([...(selected.sub_image_urls ?? [])]);
    }
  }, [
    defaultVariantRows,
    defaults,
    mode,
    productVariantMap,
    replace,
    reset,
    selected?.id,
  ]);

  useEffect(() => {
    return () => {
      revokePreviewItems(mainImagePreview);
      revokePreviewItems(subImagePreviews);
    };
  }, [mainImagePreview, subImagePreviews]);

  useEffect(() => {
    if (mode !== 'create') {
      return;
    }

    (watchedVariants ?? []).forEach((variant, index) => {
      if (variant?.price === '' || variant?.price === undefined || variant?.price === null) {
        setValue(
          `variants.${index}.price`,
          watchedBasePrice === '' || watchedBasePrice === undefined ? '' : watchedBasePrice,
          {
            shouldDirty: false,
            shouldTouch: false,
          }
        );
      }

      if (
        variant?.compareAtPrice === '' ||
        variant?.compareAtPrice === undefined ||
        variant?.compareAtPrice === null
      ) {
        setValue(
          `variants.${index}.compareAtPrice`,
          watchedCompareAtPrice === '' || watchedCompareAtPrice === undefined
            ? ''
            : watchedCompareAtPrice,
          {
            shouldDirty: false,
            shouldTouch: false,
          }
        );
      }
    });
  }, [mode, setValue, watchedBasePrice, watchedCompareAtPrice, watchedVariants]);

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
        ? { url: `/api/admin/products/${selected.id}`, method: 'PATCH' as const }
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
        'variantsJson',
        JSON.stringify(
          (values.variants as ProductVariantFormRow[]).map((variant: ProductVariantFormRow) => ({
            ...variant,
            price: variant.price === '' ? values.basePrice : variant.price,
            compareAtPrice:
              variant.compareAtPrice === ''
                ? values.compareAtPrice === ''
                  ? null
                  : values.compareAtPrice
                : variant.compareAtPrice,
            weightGrams: variant.weightGrams === '' ? 300 : variant.weightGrams,
          }))
        ),
      ],
    ];

    for (const [key, value] of entries) {
      if (value === undefined || value === null) continue;
      formData.append(key, String(value));
    }

    formData.append('mainImageUrl', existingMainImageUrl);
    formData.append('subImageUrlsJson', JSON.stringify(existingSubImageUrls));

    for (const file of mainImageFiles) {
      if (file.size > 0) formData.append('mainImage', file);
    }
    for (const file of subImageFiles) {
      if (file.size > 0) formData.append('subImages', file);
    }

    const response = await fetch(request.url, { method: request.method, body: formData });
    setSubmitting(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
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
    if (!window.confirm(t('Are you sure you want to delete this record?'))) return;
    const response = await fetch(`/api/admin/products/${row.id}`, { method: 'DELETE' });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
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
      style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
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
              <Table.Th>{t('Variants')}</Table.Th>
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
                <Table.Td>{row.variant_count}</Table.Td>
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
        position="right"
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
          header: { background: 'var(--card)', borderBottom: '1px solid var(--border)' },
          title: { textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700 },
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
                    {inventoryBadge(selected.total_stock)}
                    <Badge variant="light" radius="sm" color="gray">
                      {selected.variant_count} variants
                    </Badge>
                  </Group>
                  <Divider my="xs" />
                  <SimpleGrid cols={2} spacing="xs">
                    <Box>
                      <Text size="xs" tt="uppercase" c="dimmed">
                        Category
                      </Text>
                      <Text size="sm">
                        {categories.find((item) => item.id === selected.category_id)?.name ?? '—'}
                      </Text>
                    </Box>
                    <Box>
                      <Text size="xs" tt="uppercase" c="dimmed">
                        Slug
                      </Text>
                      <Text size="sm">{selected.slug}</Text>
                    </Box>
                  </SimpleGrid>
                  {selected.short_description ? (
                    <>
                      <Text size="xs" tt="uppercase" c="dimmed" mt="xs">
                        Short description
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
              style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
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
              <Text size="xs" tt="uppercase" c="dimmed" mb="sm" style={{ letterSpacing: 2 }}>
                Variants
              </Text>
              <Stack gap="sm">
                {(productVariantMap.get(selected.id) ?? []).length ? (
                  (productVariantMap.get(selected.id) ?? []).map((variant) => (
                    <Paper
                      key={variant.id}
                      radius={0}
                      p="sm"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Group justify="space-between" align="start">
                        <Stack gap={4}>
                          <Group gap="xs">
                            <Badge variant="light" radius="sm" color="gray">
                              {colors.find((item) => item.id === variant.color_id)?.name ??
                                'Default color'}
                            </Badge>
                            <Badge variant="light" radius="sm" color="gray">
                              {sizes.find((item) => item.id === variant.size_id)?.name ??
                                'One size'}
                            </Badge>
                            {variant.is_active ? (
                              <Badge variant="light" radius="sm" color="teal">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="light" radius="sm" color="gray">
                                Inactive
                              </Badge>
                            )}
                          </Group>
                          <Text fw={700}>{variant.sku}</Text>
                          <Group gap="md">
                            <Text size="sm" c="var(--text-secondary)">
                              {t('Price')}:{' '}
                              {variant.price !== null ? formatCurrency(variant.price) : '—'}
                            </Text>
                            <Text size="sm" c="var(--text-secondary)">
                              {t('Low stock threshold')}: {variant.low_stock_threshold}
                            </Text>
                            <Text size="sm" c="var(--text-secondary)">
                              {t('Weight grams')}: {variant.weight_grams ?? 300}
                            </Text>
                          </Group>
                        </Stack>
                        <Stack gap={6} align="end">
                          {inventoryBadge(variant.stock_quantity)}
                          <Text size="xs" c="dimmed">
                            {variant.track_inventory ? t('Track inventory') : t('Inventory off')}
                          </Text>
                          {variant.allow_backorder ? (
                            <Badge variant="light" radius="sm" color="yellow">
                              {t('Allow backorder')}
                            </Badge>
                          ) : null}
                        </Stack>
                      </Group>
                    </Paper>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">
                    No variants configured.
                  </Text>
                )}
              </Stack>
            </Paper>
            {selected.description ? (
              <Paper
                radius={0}
                p="md"
                style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
              >
                <Text size="xs" tt="uppercase" c="dimmed" mb="sm" style={{ letterSpacing: 2 }}>
                  Description
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
                  data={categories.map((item) => ({ label: item.name, value: item.id }))}
                  {...register('categoryId')}
                />
                <NativeSelect
                  label={t('Brand')}
                  radius="xs"
                  styles={adminSelectStyles}
                  data={brands.map((item) => ({ label: item.name, value: item.id }))}
                  {...register('brandId')}
                />
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
                            {mainImagePreview.length ? t('Selected main image') : t('Current main image')}
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
                          <Image src={imageUrl} alt={t('Sub image')} h={180} fit="cover" radius={0} />
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
                              const nextFiles = subImageFiles.filter((_, fileIndex) => fileIndex !== index);
                              const nextPreviews = subImagePreviews.filter((preview) => preview.id !== item.id);
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

              <Paper
                radius={0}
                p="md"
                style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
              >
                <Group justify="space-between" mb="sm">
                  <div>
                    <Text fw={700}>{t('Product variants')}</Text>
                    <Text size="sm" c="dimmed">
                      {t('Set available sizes, colors, and stock in the same product drawer.')}
                    </Text>
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    radius={0}
                    styles={adminPrimaryButtonStyles}
                    onClick={() =>
                      append({
                        ...emptyVariantRow(),
                        colorId: colors[0]?.id ?? '',
                        sku: buildVariantSku(undefined, colors[0]?.code),
                        barcode: buildVariantBarcode(),
                        price: getValues('basePrice') ?? '',
                        compareAtPrice: getValues('compareAtPrice') ?? '',
                      })
                    }
                  >
                    {t('Add variant')}
                  </Button>
                </Group>
                <Stack gap="md">
                  {variantFields.map((field, index) => (
                    <Paper
                      key={field.id}
                      radius={0}
                      p="sm"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Group justify="space-between" mb="sm">
                        <Text fw={600}>
                          {t('Variant')} #{index + 1}
                        </Text>
                        {variantFields.length > 1 ? (
                          <ActionIcon variant="subtle" color="red" onClick={() => remove(index)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        ) : null}
                      </Group>
                      <SimpleGrid cols={{ base: 1, md: 2 }}>
                        <NativeSelect
                          label={t('Size')}
                          radius="xs"
                          styles={adminSelectStyles}
                          data={[
                            { label: '—', value: '' },
                            ...sizes.map((item) => ({ label: item.name, value: item.id })),
                          ]}
                          {...register(`variants.${index}.sizeId` as const)}
                        />
                        <NativeSelect
                          label={t('Color')}
                          radius="xs"
                          styles={adminSelectStyles}
                          data={[
                            { label: '—', value: '' },
                            ...colors.map((item) => ({ label: item.name, value: item.id })),
                          ]}
                          {...register(`variants.${index}.colorId` as const)}
                        />
                        <TextInput
                          label="SKU"
                          error={
                            (errors.variants as any)?.[index]?.sku?.message
                              ? String((errors.variants as any)[index].sku.message)
                              : undefined
                          }
                          radius="xs"
                          styles={adminInputStyles}
                          {...register(`variants.${index}.sku` as const)}
                        />
                        <TextInput
                          label={t('Barcode')}
                          radius="xs"
                          styles={adminInputStyles}
                          {...register(`variants.${index}.barcode` as const)}
                        />
                        <TextInput
                          label={t('Price')}
                          type="number"
                          step={0.01}
                          min={0}
                          radius="xs"
                          styles={adminInputStyles}
                          {...register(`variants.${index}.price` as const)}
                        />
                        <TextInput
                          label={t('Compare at price')}
                          type="number"
                          step={0.01}
                          min={0}
                          radius="xs"
                          styles={adminInputStyles}
                          {...register(`variants.${index}.compareAtPrice` as const)}
                        />
                        <TextInput
                          label={t('Stock quantity')}
                          type="number"
                          step={1}
                          min={0}
                          max={9999}
                          radius="xs"
                          styles={adminInputStyles}
                          {...register(`variants.${index}.stockQuantity` as const)}
                        />
                        <TextInput
                          label={t('Low stock threshold')}
                          type="number"
                          step={1}
                          min={0}
                          max={9999}
                          radius="xs"
                          styles={adminInputStyles}
                          {...register(`variants.${index}.lowStockThreshold` as const)}
                        />
                        <TextInput
                          label={t('Weight grams')}
                          type="number"
                          step={1}
                          min={0}
                          radius="xs"
                          styles={adminInputStyles}
                          {...register(`variants.${index}.weightGrams` as const)}
                        />
                        <Stack gap="xs" justify="end">
                          <Controller
                            control={control}
                            name={`variants.${index}.trackInventory` as const}
                            render={({ field }) => (
                              <Switch
                                checked={Boolean(field.value)}
                                label={t('Track inventory')}
                                onChange={(event) => field.onChange(event.currentTarget.checked)}
                                radius="xs"
                                size="md"
                                color="dark"
                              />
                            )}
                          />
                          <Controller
                            control={control}
                            name={`variants.${index}.allowBackorder` as const}
                            render={({ field }) => (
                              <Switch
                                checked={Boolean(field.value)}
                                label={t('Allow backorder')}
                                onChange={(event) => field.onChange(event.currentTarget.checked)}
                                radius="xs"
                                size="md"
                                color="dark"
                              />
                            )}
                          />
                          <Controller
                            control={control}
                            name={`variants.${index}.isActive` as const}
                            render={({ field }) => (
                              <Switch
                                checked={Boolean(field.value)}
                                label={t('Active')}
                                onChange={(event) => field.onChange(event.currentTarget.checked)}
                                radius="xs"
                                size="md"
                                color="dark"
                              />
                            )}
                          />
                        </Stack>
                      </SimpleGrid>
                    </Paper>
                  ))}
                </Stack>
              </Paper>

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
}: {
  session: AdminSessionInfo;
  orders: AdminOrderRecord[];
  enumLabels: AdminEnumLabels;
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
          discountAmount: 0,
          shippingAmount: 0,
          taxAmount: 0,
          totalAmount: 0,
          currency: 'JOD',
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
            name: 'discountAmount',
            label: 'Discount amount',
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
            name: 'taxAmount',
            label: 'Tax amount',
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
          { name: 'trackingNumber', label: 'Tracking number', type: 'text', editableOn: ['edit'] },
          {
            name: 'shippingCarrier',
            label: 'Shipping carrier',
            type: 'text',
            editableOn: ['edit'],
          },
          { name: 'notes', label: 'Notes', type: 'textarea', editableOn: ['edit'] },
        ]}
        columns={[
          { key: 'order_number', label: 'Order', render: (row) => row.order_number },
          { key: 'customer_name', label: 'Customer', render: (row) => row.customer_name || '—' },
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
        drawerExtras={({ mode, selected }) =>
          mode === 'view' && selected ? <AdminOrderDetailPanel orderId={selected.id} /> : null
        }
        createRequest={{ url: '/api/admin/orders', method: 'POST' }}
        updateRequest={(id) => ({ url: `/api/admin/orders/${id}`, method: 'PATCH' })}
        deleteRequest={(id) => ({ url: `/api/admin/orders/${id}`, method: 'DELETE' })}
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
  const { locale } = useLocale();

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
          { name: 'id', label: 'User id', type: 'text', required: true, editableOn: ['create'] },
          {
            name: 'fullName',
            label: 'Full name',
            type: 'text',
            required: true,
            editableOn: ['create', 'edit'],
          },
          { name: 'phone', label: 'Phone', type: 'text', editableOn: ['create', 'edit'] },
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
          { name: 'isBlocked', label: 'Blocked', type: 'switch', editableOn: ['edit'] },
        ]}
        columns={[
          { key: 'id', label: 'User id', render: (row) => row.id },
          { key: 'full_name', label: 'Full name', render: (row) => row.full_name || '—' },
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
            render: (row) => (row.is_blocked ? statusBadge('blocked') : 'No'),
          },
          { key: 'created_at', label: 'Created', render: (row) => formatDate(row.created_at) },
        ]}
        createRequest={{ url: '/api/admin/customers', method: 'POST' }}
        updateRequest={(id) => ({ url: `/api/admin/customers/${id}`, method: 'PATCH' })}
        deleteRequest={(id) => ({ url: `/api/admin/customers/${id}`, method: 'DELETE' })}
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
  flashSales,
  heroSlides,
  enumLabels,
}: {
  session: AdminSessionInfo;
  categories: AdminCategoryRecord[];
  brands: AdminBrandRecord[];
  sizes: AdminSizeRecord[];
  colors: AdminColorRecord[];
  flashSales: AdminFlashSaleRecord[];
  heroSlides: AdminHeroSlideRecord[];
  enumLabels: AdminEnumLabels;
}) {
  const { t, locale } = useLocale();

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
          style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
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
          style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
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
          },
          panel: {
            paddingTop: 20,
          },
        }}
      >
        <Tabs.List mb="lg">
          <Tabs.Tab value="categories">{t('Categories')}</Tabs.Tab>
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
              { name: 'slug', label: 'Slug', type: 'text', required: true, editableOn: ['create'] },
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
              { name: 'isActive', label: 'Active', type: 'switch', editableOn: ['create', 'edit'] },
            ]}
            columns={[
              { key: 'name', label: 'Name', render: (row) => row.name },
              { key: 'name_ar', label: 'Arabic name', render: (row) => row.name_ar || '—' },
              { key: 'slug', label: 'Slug', render: (row) => row.slug },
              { key: 'slug_ar', label: 'Arabic slug', render: (row) => row.slug_ar || '—' },
              { key: 'sort_order', label: 'Sort order', render: (row) => row.sort_order },
              {
                key: 'is_active',
                label: 'Active',
                render: (row) => (row.is_active ? 'Yes' : 'No'),
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
            updateRequest={(id) => ({ url: `/api/admin/categories/${id}`, method: 'PATCH' })}
            deleteRequest={(id) => ({ url: `/api/admin/categories/${id}`, method: 'DELETE' })}
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
              { name: 'eyebrow', label: 'Eyebrow', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'eyebrowAr', label: 'Arabic eyebrow', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'title', label: 'Title', type: 'text', required: true, editableOn: ['create', 'edit'] },
              { name: 'titleAr', label: 'Arabic title', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'description', label: 'Description', type: 'textarea', editableOn: ['create', 'edit'] },
              { name: 'descriptionAr', label: 'Arabic description', type: 'textarea', editableOn: ['create', 'edit'] },
              { name: 'buttonText', label: 'Button text', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'buttonTextAr', label: 'Arabic button text', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'buttonUrl', label: 'Button URL', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'imageEn', label: 'English image', type: 'file', editableOn: ['create', 'edit'] },
              { name: 'imageAr', label: 'Arabic image', type: 'file', editableOn: ['create', 'edit'] },
              {
                name: 'displaySeconds',
                label: 'Display seconds',
                type: 'number',
                required: true,
                min: 2,
                step: 1,
                editableOn: ['create', 'edit'],
              },
              { name: 'sortOrder', label: 'Sort order', type: 'number', min: 0, step: 1, editableOn: ['create', 'edit'] },
              { name: 'isActive', label: 'Active', type: 'switch', editableOn: ['create', 'edit'] },
            ]}
            columns={[
              { key: 'title', label: 'Title', render: (row) => row.title },
              { key: 'title_ar', label: 'Arabic title', render: (row) => row.title_ar || '—' },
              { key: 'display_seconds', label: 'Seconds', render: (row) => row.display_seconds },
              { key: 'sort_order', label: 'Sort order', render: (row) => row.sort_order },
              { key: 'is_active', label: 'Active', render: (row) => (row.is_active ? 'Yes' : 'No') },
            ]}
            drawerExtras={({ mode, selected }) =>
              mode === 'view' && selected ? (
                <SimpleGrid cols={{ base: 1, md: 2 }}>
                  {selected.image_en_url ? (
                    <Paper radius={0} p="md" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                      <Text size="xs" tt="uppercase" c="dimmed" mb="sm">
                        {t('English image')}
                      </Text>
                      <Image src={selected.image_en_url} alt={selected.title} h={220} fit="cover" radius={0} />
                    </Paper>
                  ) : null}
                  {selected.image_ar_url ? (
                    <Paper radius={0} p="md" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                      <Text size="xs" tt="uppercase" c="dimmed" mb="sm">
                        {t('Arabic image')}
                      </Text>
                      <Image src={selected.image_ar_url} alt={selected.title_ar || selected.title} h={220} fit="cover" radius={0} />
                    </Paper>
                  ) : null}
                </SimpleGrid>
              ) : (
                <Text size="sm" c="dimmed">
                  {t('Use 2200 x 1400 px images. Keep the subject centered so mobile crops stay safe.')}
                </Text>
              )
            }
            createRequest={{ url: '/api/admin/hero-slides', method: 'POST' }}
            updateRequest={(id) => ({ url: `/api/admin/hero-slides/${id}`, method: 'PATCH' })}
            deleteRequest={(id) => ({ url: `/api/admin/hero-slides/${id}`, method: 'DELETE' })}
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
              { name: 'isActive', label: 'Active', type: 'switch', editableOn: ['create', 'edit'] },
            ]}
            columns={[
              { key: 'title', label: 'Title', render: (row) => row.title },
              {
                key: 'discount_type',
                label: 'Discount',
                render: (row) =>
                  `${row.discount_value}${row.discount_type === 'percentage' ? '%' : ''} ${getEnumLabel(enumLabels, 'discount_type', row.discount_type, locale)}`,
              },
              { key: 'starts_at', label: 'Starts', render: (row) => formatDateTime(row.starts_at) },
              { key: 'ends_at', label: 'Ends', render: (row) => formatDateTime(row.ends_at) },
              {
                key: 'show_as_modal',
                label: 'Modal',
                render: (row) => (row.show_as_modal ? 'Yes' : 'No'),
              },
              {
                key: 'is_active',
                label: 'Active',
                render: (row) => (row.is_active ? statusBadge('active') : statusBadge('inactive')),
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
            updateRequest={(id) => ({ url: `/api/admin/flash-sales/${id}`, method: 'PATCH' })}
            deleteRequest={(id) => ({ url: `/api/admin/flash-sales/${id}`, method: 'DELETE' })}
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
              { name: 'slug', label: 'Slug', type: 'text', required: true, editableOn: ['create'] },
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
              { name: 'logoUrl', label: 'Logo URL', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'isActive', label: 'Active', type: 'switch', editableOn: ['edit'] },
            ]}
            columns={[
              { key: 'name', label: 'Name', render: (row) => row.name },
              { key: 'name_ar', label: 'Arabic name', render: (row) => row.name_ar || '—' },
              { key: 'slug', label: 'Slug', render: (row) => row.slug },
              { key: 'slug_ar', label: 'Arabic slug', render: (row) => row.slug_ar || '—' },
              {
                key: 'is_active',
                label: 'Active',
                render: (row) => (row.is_active ? 'Yes' : 'No'),
              },
            ]}
            createRequest={{ url: '/api/admin/lookups/brands', method: 'POST' }}
            updateRequest={() => ({ url: '/api/admin/lookups/brands', method: 'PATCH' })}
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
            defaults={{ code: '', name: '', nameAr: '', sortOrder: 0, isActive: true }}
            fields={[
              { name: 'code', label: 'Code', type: 'text', required: true, editableOn: ['create'] },
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
              { name: 'isActive', label: 'Active', type: 'switch', editableOn: ['edit'] },
            ]}
            columns={[
              { key: 'code', label: 'Code', render: (row) => row.code },
              { key: 'name', label: 'Name', render: (row) => row.name },
              { key: 'name_ar', label: 'Arabic name', render: (row) => row.name_ar || '—' },
              { key: 'sort_order', label: 'Sort order', render: (row) => row.sort_order },
              {
                key: 'is_active',
                label: 'Active',
                render: (row) => (row.is_active ? 'Yes' : 'No'),
              },
            ]}
            createRequest={{ url: '/api/admin/lookups/sizes', method: 'POST' }}
            updateRequest={() => ({ url: '/api/admin/lookups/sizes', method: 'PATCH' })}
            deleteRequest={(id) => ({ url: `/api/admin/lookups/sizes?id=${id}`, method: 'DELETE' })}
          />
        </Tabs.Panel>

        <Tabs.Panel value="colors">
          <CrudManager
            title="Colors"
            description="Manage color swatches and variant color naming."
            records={colors}
            defaults={{ code: '', name: '', nameAr: '', hexCode: '', sortOrder: 0, isActive: true }}
            fields={[
              { name: 'code', label: 'Code', type: 'text', required: true, editableOn: ['create'] },
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
              { name: 'hexCode', label: 'Hex code', type: 'text', editableOn: ['create', 'edit'] },
              {
                name: 'sortOrder',
                label: 'Sort order',
                type: 'number',
                min: 0,
                step: 1,
                editableOn: ['edit'],
              },
              { name: 'isActive', label: 'Active', type: 'switch', editableOn: ['edit'] },
            ]}
            columns={[
              { key: 'code', label: 'Code', render: (row) => row.code },
              { key: 'name', label: 'Name', render: (row) => row.name },
              { key: 'name_ar', label: 'Arabic name', render: (row) => row.name_ar || '—' },
              { key: 'hex_code', label: 'Hex code', render: (row) => row.hex_code || '—' },
              {
                key: 'is_active',
                label: 'Active',
                render: (row) => (row.is_active ? 'Yes' : 'No'),
              },
            ]}
            createRequest={{ url: '/api/admin/lookups/colors', method: 'POST' }}
            updateRequest={() => ({ url: '/api/admin/lookups/colors', method: 'PATCH' })}
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
  const { t } = useLocale();
  const { isDark } = useThemeMode();
  const [modalError, setModalError] = useState<ModalErrorState | null>(null);
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
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
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
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        background: 'var(--admin-background)',
      }}
    >
      <ErrorModal error={modalError} onClose={() => setModalError(null)} />
      <Box maw={1080} w="100%">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={0}>
          <Paper
            radius={0}
            p="xl"
            style={{
              minHeight: 640,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: isDark
                ? 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
                : 'linear-gradient(160deg, rgba(255,255,255,0.92), rgba(255,247,242,0.78))',
              border: '1px solid var(--border)',
              borderRight: 'none',
              backdropFilter: 'blur(24px)',
            }}
          >
            <Group justify="space-between" align="start">
              <div>
                <Text size="xs" tt="uppercase" c="dimmed" style={{ letterSpacing: 3 }}>
                  {t('Admin panel')}
                </Text>
              </div>
              <LocaleSwitcher />
            </Group>
            <div>
              <Text
                fw={800}
                size="3rem"
                mt="md"
                tt="uppercase"
                style={{ lineHeight: 0.95, letterSpacing: 1.4 }}
              >
                {t('Ice control room')}
              </Text>
              <Text mt="lg" c="var(--text-secondary)" maw={420} style={{ lineHeight: 1.8 }}>
                {t('Use an admin or super admin account to access the dashboard.')}
              </Text>
            </div>

            <Stack gap="sm">
              {[
                'Connected admin dashboard with live catalog, customer, order, and settings control.',
                'Trackable orders',
                'Profiles and roles',
                'Taxonomy and brands',
              ].map((item) => (
                <Paper
                  key={item}
                  radius={0}
                  p="md"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(23,23,23,0.04)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Text size="sm" c="var(--text-secondary)">
                    {t(item)}
                  </Text>
                </Paper>
              ))}
            </Stack>
          </Paper>

          <Paper
            radius={0}
            p="xl"
            style={{
              minHeight: 640,
              display: 'flex',
              alignItems: 'center',
              background: isDark ? 'rgba(12,12,12,0.9)' : 'rgba(255,252,249,0.92)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(24px)',
              boxShadow: isDark ? 'none' : '0 32px 120px rgba(50, 26, 24, 0.10)',
            }}
          >
            <Box w="100%">
              <Text size="xs" tt="uppercase" c="dimmed" style={{ letterSpacing: 3 }}>
                {t('Operations dashboard')}
              </Text>
              <Text fw={800} size="2.4rem" mt="sm" tt="uppercase" style={{ lineHeight: 1 }}>
                {t('Sign in to continue')}
              </Text>
              <Text c="var(--text-secondary)" mt="sm">
                {t('Use an admin or super admin account to access the dashboard.')}
              </Text>

              <Divider my="xl" color="var(--border)" />

              <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)}>
                <Stack gap="md">
                  <TextInput
                    label={t('Email')}
                    error={errors.email?.message}
                    radius="xs"
                    styles={adminInputStyles}
                    {...register('email')}
                  />
                  <TextInput
                    type="password"
                    label={t('Password')}
                    error={errors.password?.message}
                    radius="xs"
                    styles={adminInputStyles}
                    {...register('password')}
                  />
                  <Button
                    type="submit"
                    radius={0}
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
