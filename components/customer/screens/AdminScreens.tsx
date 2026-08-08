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
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AdminShell } from '@/components/customer/AdminShell';
import { useLocale } from '@/components/storefront/locale-provider';
import {
  AdminBrandRecord,
  AdminCategoryRecord,
  AdminColorRecord,
  AdminCustomerRecord,
  AdminOrderRecord,
  AdminProductRecord,
  AdminSizeRecord,
} from '@/lib/admin/data';
import { AdminEnumKey, AdminEnumLabelRow, AdminEnumLabels } from '@/lib/admin/enum-labels';
import { formatCurrency } from '@/lib/commerce-utils';

type AdminSessionInfo = {
  fullName: string;
  email: string;
  role: 'admin' | 'super_admin';
};

type Option = {
  label: string;
  value: string;
};

type CrudField = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'switch' | 'file';
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
  drawerExtras?: (args: { mode: 'create' | 'edit' | 'view' | null; selected: T | null }) => ReactNode;
  allowCreate?: boolean;
  allowDelete?: boolean;
};

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
    shape[field.name] = field.required ? base.trim().min(1, t('This field is required')) : base.optional();
  });

  return z.object(shape);
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

function rowValue(row: Record<string, unknown>, field: CrudField) {
  const value = getRowFieldValue(row, field.name);

  if (field.type === 'switch') {
    return value ? 'Yes' : 'No';
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
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!mode) {
      return;
    }

    if (mode === 'create') {
      reset(defaults);
      return;
    }

    if (selected) {
      const nextValues: Record<string, unknown> = { ...defaults };

      for (const field of fields) {
        nextValues[field.name] = getRowFieldValue(selected as Record<string, unknown>, field.name) ?? defaults[field.name];
      }

      reset(nextValues);
    }
  }, [defaults, fields, mode, reset, selected]);

  async function onSubmit(values: Record<string, unknown>) {
    setSubmitting(true);

    const request = mode === 'edit' && selected ? updateRequest(selected.id) : createRequest;
    const hasFileFields = editableFields.some((field) => field.type === 'file');
    let response: Response;

    if (hasFileFields) {
      const formData = new FormData();

      for (const field of editableFields) {
        const value = values[field.name];

        if (field.type === 'file') {
          const files = value instanceof FileList ? Array.from(value) : [];
          if (field.required && mode === 'create' && files.length === 0) {
            setSubmitting(false);
            window.alert(t('This field is required'));
            return;
          }
          for (const file of files) {
            if (file.size > 0) {
              formData.append(field.name, file);
            }
          }
          continue;
        }

        if (value === undefined || value === null) {
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
        body: JSON.stringify(values),
      });
    }

    setSubmitting(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      window.alert(payload?.error ?? t('Something went wrong'));
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
      window.alert(payload?.error ?? t('Something went wrong'));
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
          <Button leftSection={<IconPlus size={16} />} radius={0} variant="default" onClick={() => setMode('create')}>
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
                    <ActionIcon variant="subtle" color="gray" onClick={() => {
                      setSelected(row);
                      setMode('view');
                    }}>
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="gray" onClick={() => {
                      setSelected(row);
                      setMode('edit');
                    }}>
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
        title={mode === 'view' ? t('View record') : mode === 'edit' ? t('Edit record') : t('Create record')}
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
              {drawerExtras ? drawerExtras({ mode, selected }) : null}
              {editableFields.map((field) => {
                const errorMessage = errors[field.name]?.message ? String(errors[field.name]?.message) : undefined;

                if (field.type === 'textarea') {
                  return (
                    <Textarea
                      key={field.name}
                      label={t(field.label)}
                      placeholder={field.placeholder ? t(field.placeholder) : undefined}
                      minRows={4}
                      error={errorMessage}
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
                          onChange={(event) => controllerField.onChange(event.currentTarget.checked)}
                        />
                      )}
                    />
                  );
                }

                if (field.type === 'file') {
                  return (
                    <Box key={field.name}>
                      <Text size="sm" mb={6}>
                        {t(field.label)}
                      </Text>
                      <input type="file" accept="image/*" multiple={field.multiple} {...register(field.name)} />
                      {errorMessage ? (
                        <Text c="red" size="xs" mt={4}>
                          {errorMessage}
                        </Text>
                      ) : null}
                    </Box>
                  );
                }

                return (
                  <TextInput
                    key={field.name}
                    label={t(field.label)}
                    placeholder={field.placeholder ? t(field.placeholder) : undefined}
                    type={field.type === 'number' ? 'number' : 'text'}
                    step={field.step}
                    min={field.min}
                    error={errorMessage}
                    {...register(field.name)}
                  />
                );
              })}

              <Group justify="flex-end" mt="md">
                <Button variant="default" radius={0} onClick={() => setMode(null)}>
                  {t('Cancel')}
                </Button>
                <Button type="submit" loading={submitting} radius={0}>
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

function getEnumLabel(enumLabels: AdminEnumLabels, enumKey: AdminEnumKey, value: string, locale: 'en' | 'ar') {
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
    { label: 'Categories', value: categories.length + brands.length, detail: 'Taxonomy and brands' },
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
          <Paper key={card.label} radius={0} p="lg" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
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
        <Paper radius={0} p="lg" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
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
                  <Table.Td>{statusBadge(order.status, getEnumLabel(enumLabels, 'order_status', order.status, locale))}</Table.Td>
                  <Table.Td>{formatCurrency(order.total_amount)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        <Paper radius={0} p="lg" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
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
                  <Table.Td>{statusBadge(product.status, getEnumLabel(enumLabels, 'product_status', product.status, locale))}</Table.Td>
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
  enumLabels,
}: {
  session: AdminSessionInfo;
  products: AdminProductRecord[];
  categories: AdminCategoryRecord[];
  brands: AdminBrandRecord[];
  enumLabels: AdminEnumLabels;
}) {
  const { locale } = useLocale();

  return (
    <AdminShell
      session={session}
      title="Product management"
      subtitle="Every product is editable in place with create, view, edit, and delete flows."
      active="Products"
    >
      <CrudManager
        title="Catalog products"
        description="Manage multilingual product records, pricing, status, and catalog assignments."
        records={products}
        defaults={{
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
        }}
        fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'nameAr', label: 'Arabic name', type: 'text', editableOn: ['create', 'edit'] },
          { name: 'slug', label: 'Slug', type: 'text', required: true, editableOn: ['create'] },
          { name: 'slugAr', label: 'Arabic slug', type: 'text', editableOn: ['create', 'edit'] },
          { name: 'shortDescription', label: 'Short description', type: 'textarea', editableOn: ['create', 'edit'] },
          { name: 'shortDescriptionAr', label: 'Arabic short description', type: 'textarea', editableOn: ['create', 'edit'] },
          { name: 'description', label: 'Description', type: 'textarea', editableOn: ['create', 'edit'] },
          { name: 'descriptionAr', label: 'Arabic description', type: 'textarea', editableOn: ['create', 'edit'] },
          { name: 'mainImage', label: 'Main image', type: 'file', required: true, editableOn: ['create', 'edit'] },
          { name: 'subImages', label: 'Sub images', type: 'file', editableOn: ['create', 'edit'], multiple: true },
          { name: 'basePrice', label: 'Base price', type: 'number', required: true, min: 0, step: 0.01 },
          { name: 'compareAtPrice', label: 'Compare at price', type: 'number', min: 0, step: 0.01, editableOn: ['create', 'edit'] },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            editableOn: ['edit'],
            options: ['draft', 'active', 'inactive', 'archived'].map((value) => ({
              label: getEnumLabel(enumLabels, 'product_status', value, locale),
              value,
            })),
          },
          {
            name: 'categoryId',
            label: 'Category',
            type: 'select',
            editableOn: ['create', 'edit'],
            options: categories.map((item) => ({ label: item.name, value: item.id })),
          },
          {
            name: 'brandId',
            label: 'Brand',
            type: 'select',
            editableOn: ['create', 'edit'],
            options: brands.map((item) => ({ label: item.name, value: item.id })),
          },
          { name: 'isFeatured', label: 'Featured product', type: 'switch', editableOn: ['edit'] },
        ]}
        columns={[
          { key: 'name', label: 'Name', render: (row) => row.name },
          { key: 'name_ar', label: 'Arabic name', render: (row) => row.name_ar || '—' },
          { key: 'primary_image_url', label: 'Main image', render: (row) => (row.primary_image_url ? 'Set' : '—') },
          { key: 'sub_image_urls', label: 'Sub images', render: (row) => (row.sub_image_urls.length ? String(row.sub_image_urls.length) : '—') },
          { key: 'slug', label: 'Slug', render: (row) => row.slug },
          { key: 'slug_ar', label: 'Arabic slug', render: (row) => row.slug_ar || '—' },
          { key: 'category_id', label: 'Category', render: (row) => categories.find((item) => item.id === row.category_id)?.name ?? '—' },
          { key: 'brand_id', label: 'Brand', render: (row) => brands.find((item) => item.id === row.brand_id)?.name ?? '—' },
          {
            key: 'status',
            label: 'Status',
            render: (row) => statusBadge(row.status, getEnumLabel(enumLabels, 'product_status', row.status, locale)),
          },
          { key: 'base_price', label: 'Price', render: (row) => formatCurrency(row.base_price) },
          { key: 'created_at', label: 'Created', render: (row) => formatDate(row.created_at) },
        ]}
        drawerExtras={({ selected }) =>
          selected ? (
            <Stack gap="xs">
              {selected.primary_image_url ? <Image src={selected.primary_image_url} alt={selected.name} h={140} fit="cover" radius={0} /> : null}
              {selected.sub_image_urls.length ? (
                <Group gap="xs">
                  {selected.sub_image_urls.map((url) => (
                    <Image key={url} src={url} alt={selected.name} h={72} w={72} fit="cover" radius={0} />
                  ))}
                </Group>
              ) : null}
            </Stack>
          ) : null
        }
        createRequest={{ url: '/api/admin/products', method: 'POST' }}
        updateRequest={(id) => ({ url: `/api/admin/products/${id}`, method: 'PATCH' })}
        deleteRequest={(id) => ({ url: `/api/admin/products/${id}`, method: 'DELETE' })}
      />
    </AdminShell>
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
          { name: 'orderNumber', label: 'Order number', type: 'text', required: true, editableOn: ['create'] },
          { name: 'customerName', label: 'Customer name', type: 'text', required: true, editableOn: ['create', 'edit'] },
          { name: 'customerEmail', label: 'Customer email', type: 'text', editableOn: ['create', 'edit'] },
          { name: 'customerPhone', label: 'Customer phone', type: 'text', required: true, editableOn: ['create', 'edit'] },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            editableOn: ['create', 'edit'],
            options: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'failed', 'refunded'].map((value) => ({
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
            options: ['pending', 'authorized', 'paid', 'failed', 'cancelled', 'partially_refunded', 'refunded'].map((value) => ({
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
            options: ['cash_on_delivery', 'card', 'bank_transfer', 'apple_pay', 'google_pay'].map((value) => ({
              label: getEnumLabel(enumLabels, 'payment_method', value, locale),
              value,
            })),
          },
          { name: 'subtotal', label: 'Subtotal', type: 'number', required: true, min: 0, step: 0.01, editableOn: ['create', 'edit'] },
          { name: 'discountAmount', label: 'Discount amount', type: 'number', min: 0, step: 0.01, editableOn: ['create', 'edit'] },
          { name: 'shippingAmount', label: 'Shipping amount', type: 'number', min: 0, step: 0.01, editableOn: ['create', 'edit'] },
          { name: 'taxAmount', label: 'Tax amount', type: 'number', min: 0, step: 0.01, editableOn: ['create', 'edit'] },
          { name: 'totalAmount', label: 'Total amount', type: 'number', required: true, min: 0, step: 0.01, editableOn: ['create', 'edit'] },
          {
            name: 'currency',
            label: 'Currency',
            type: 'select',
            required: true,
            editableOn: ['create', 'edit'],
            options: [{ label: 'JOD', value: 'JOD' }, { label: 'USD', value: 'USD' }],
          },
          { name: 'trackingNumber', label: 'Tracking number', type: 'text', editableOn: ['edit'] },
          { name: 'shippingCarrier', label: 'Shipping carrier', type: 'text', editableOn: ['edit'] },
          { name: 'notes', label: 'Notes', type: 'textarea', editableOn: ['edit'] },
        ]}
        columns={[
          { key: 'order_number', label: 'Order', render: (row) => row.order_number },
          { key: 'customer_name', label: 'Customer', render: (row) => row.customer_name || '—' },
          { key: 'status', label: 'Status', render: (row) => statusBadge(row.status, getEnumLabel(enumLabels, 'order_status', row.status, locale)) },
          { key: 'payment_status', label: 'Payment', render: (row) => statusBadge(row.payment_status, getEnumLabel(enumLabels, 'payment_status', row.payment_status, locale)) },
          { key: 'payment_method', label: 'Payment method', render: (row) => getEnumLabel(enumLabels, 'payment_method', row.payment_method, locale) },
          { key: 'total_amount', label: 'Total', render: (row) => formatCurrency(row.total_amount) },
        ]}
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
          { name: 'fullName', label: 'Full name', type: 'text', required: true, editableOn: ['create', 'edit'] },
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
          { key: 'role', label: 'Role', render: (row) => statusBadge(row.role, getEnumLabel(enumLabels, 'user_role', row.role, locale)) },
          { key: 'is_blocked', label: 'Blocked', render: (row) => (row.is_blocked ? statusBadge('blocked') : 'No') },
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
  enumLabels,
}: {
  session: AdminSessionInfo;
  categories: AdminCategoryRecord[];
  brands: AdminBrandRecord[];
  sizes: AdminSizeRecord[];
  colors: AdminColorRecord[];
  enumLabels: AdminEnumLabels;
}) {
  const { t } = useLocale();

  return (
    <AdminShell
      session={session}
      title="Admin settings"
      subtitle="Lookup tables and structural catalog settings are editable from drawer-based CRUD panels."
      active="Settings"
    >
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="lg">
        <Paper radius={0} p="lg" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
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
        <Paper radius={0} p="lg" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
          <Text size="xs" tt="uppercase" c="var(--muted)" style={{ letterSpacing: 2.2 }}>
            {t('Enums')}
          </Text>
          <Text fw={800} size="2.1rem" mt={8}>
            {Object.values(enumLabels).reduce((sum, group) => sum + Object.keys(group).length, 0)}
          </Text>
          <Text size="sm" c="var(--text-secondary)" mt={6}>
            {t('Control English and Arabic labels for statuses, roles, payment methods, and other enum values here.')}
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
            defaults={{ name: '', nameAr: '', slug: '', slugAr: '', description: '', descriptionAr: '', imageUrl: '', sortOrder: 0, isActive: true }}
            fields={[
              { name: 'name', label: 'Name', type: 'text', required: true, editableOn: ['create', 'edit'] },
              { name: 'nameAr', label: 'Arabic name', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'slug', label: 'Slug', type: 'text', required: true, editableOn: ['create'] },
              { name: 'slugAr', label: 'Arabic slug', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'description', label: 'Description', type: 'textarea', editableOn: ['create', 'edit'] },
              { name: 'descriptionAr', label: 'Arabic description', type: 'textarea', editableOn: ['create', 'edit'] },
              { name: 'imageUrl', label: 'Image URL', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'sortOrder', label: 'Sort order', type: 'number', min: 0, step: 1, editableOn: ['edit'] },
              { name: 'isActive', label: 'Active', type: 'switch', editableOn: ['edit'] },
            ]}
            columns={[
              { key: 'name', label: 'Name', render: (row) => row.name },
              { key: 'name_ar', label: 'Arabic name', render: (row) => row.name_ar || '—' },
              { key: 'slug', label: 'Slug', render: (row) => row.slug },
              { key: 'slug_ar', label: 'Arabic slug', render: (row) => row.slug_ar || '—' },
              { key: 'sort_order', label: 'Sort order', render: (row) => row.sort_order },
              { key: 'is_active', label: 'Active', render: (row) => (row.is_active ? 'Yes' : 'No') },
            ]}
            createRequest={{ url: '/api/admin/lookups/categories', method: 'POST' }}
            updateRequest={() => ({ url: '/api/admin/lookups/categories', method: 'PATCH' })}
            deleteRequest={(id) => ({ url: `/api/admin/lookups/categories?id=${id}`, method: 'DELETE' })}
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
            defaults={{ name: '', nameAr: '', slug: '', slugAr: '', description: '', descriptionAr: '', logoUrl: '', isActive: true }}
            fields={[
              { name: 'name', label: 'Name', type: 'text', required: true, editableOn: ['create', 'edit'] },
              { name: 'nameAr', label: 'Arabic name', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'slug', label: 'Slug', type: 'text', required: true, editableOn: ['create'] },
              { name: 'slugAr', label: 'Arabic slug', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'description', label: 'Description', type: 'textarea', editableOn: ['create', 'edit'] },
              { name: 'descriptionAr', label: 'Arabic description', type: 'textarea', editableOn: ['create', 'edit'] },
              { name: 'logoUrl', label: 'Logo URL', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'isActive', label: 'Active', type: 'switch', editableOn: ['edit'] },
            ]}
            columns={[
              { key: 'name', label: 'Name', render: (row) => row.name },
              { key: 'name_ar', label: 'Arabic name', render: (row) => row.name_ar || '—' },
              { key: 'slug', label: 'Slug', render: (row) => row.slug },
              { key: 'slug_ar', label: 'Arabic slug', render: (row) => row.slug_ar || '—' },
              { key: 'is_active', label: 'Active', render: (row) => (row.is_active ? 'Yes' : 'No') },
            ]}
            createRequest={{ url: '/api/admin/lookups/brands', method: 'POST' }}
            updateRequest={() => ({ url: '/api/admin/lookups/brands', method: 'PATCH' })}
            deleteRequest={(id) => ({ url: `/api/admin/lookups/brands?id=${id}`, method: 'DELETE' })}
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
              { name: 'name', label: 'Name', type: 'text', required: true, editableOn: ['create', 'edit'] },
              { name: 'nameAr', label: 'Arabic name', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'sortOrder', label: 'Sort order', type: 'number', min: 0, step: 1, editableOn: ['edit'] },
              { name: 'isActive', label: 'Active', type: 'switch', editableOn: ['edit'] },
            ]}
            columns={[
              { key: 'code', label: 'Code', render: (row) => row.code },
              { key: 'name', label: 'Name', render: (row) => row.name },
              { key: 'name_ar', label: 'Arabic name', render: (row) => row.name_ar || '—' },
              { key: 'sort_order', label: 'Sort order', render: (row) => row.sort_order },
              { key: 'is_active', label: 'Active', render: (row) => (row.is_active ? 'Yes' : 'No') },
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
              { name: 'name', label: 'Name', type: 'text', required: true, editableOn: ['create', 'edit'] },
              { name: 'nameAr', label: 'Arabic name', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'hexCode', label: 'Hex code', type: 'text', editableOn: ['create', 'edit'] },
              { name: 'sortOrder', label: 'Sort order', type: 'number', min: 0, step: 1, editableOn: ['edit'] },
              { name: 'isActive', label: 'Active', type: 'switch', editableOn: ['edit'] },
            ]}
            columns={[
              { key: 'code', label: 'Code', render: (row) => row.code },
              { key: 'name', label: 'Name', render: (row) => row.name },
              { key: 'name_ar', label: 'Arabic name', render: (row) => row.name_ar || '—' },
              { key: 'hex_code', label: 'Hex code', render: (row) => row.hex_code || '—' },
              { key: 'is_active', label: 'Active', render: (row) => (row.is_active ? 'Yes' : 'No') },
            ]}
            createRequest={{ url: '/api/admin/lookups/colors', method: 'POST' }}
            updateRequest={() => ({ url: '/api/admin/lookups/colors', method: 'PATCH' })}
            deleteRequest={(id) => ({ url: `/api/admin/lookups/colors?id=${id}`, method: 'DELETE' })}
          />
        </Tabs.Panel>

      </Tabs>
    </AdminShell>
  );
}

export function AdminLoginScreen() {
  const router = useRouter();
  const { t } = useLocale();
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
  });

  async function onSubmit(values: { email: string; password: string }) {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      window.alert(payload?.error ?? t('Something went wrong'));
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
        background:
          'radial-gradient(circle at top, rgba(210,238,255,0.22), transparent 30%), linear-gradient(180deg, #091118 0%, #0f1b22 100%)',
      }}
      px="md"
    >
      <Paper radius={28} p="xl" maw={520} w="100%" style={{ background: 'rgba(10,18,24,0.88)', border: '1px solid rgba(195,230,255,0.18)', backdropFilter: 'blur(24px)' }}>
        <Text size="xs" tt="uppercase" c="#9cc8e8" style={{ letterSpacing: 3 }}>
          {t('Admin panel')}
        </Text>
        <Text fw={800} size="2.4rem" mt="sm" style={{ lineHeight: 1 }}>
          {t('Sign in to continue')}
        </Text>
        <Text c="rgba(221,235,245,0.72)" mt="sm">
          {t('Use an admin or super admin account to access the dashboard.')}
        </Text>

        <Divider my="xl" color="rgba(195,230,255,0.12)" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput label={t('Email')} error={errors.email?.message} {...register('email')} />
            <TextInput type="password" label={t('Password')} error={errors.password?.message} {...register('password')} />
            <Button type="submit" radius="xl" loading={isSubmitting} mt="md">
              {t('LOG IN')}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
