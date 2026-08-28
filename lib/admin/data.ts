import {
  listDeliveryZones,
  listNavigationItems,
  listCoupons,
  listFlashSales,
  listHeroSlides,
  listAdminLookups,
  listBrands,
  listCategories,
  listColors,
  listOrders,
  listProductOptionGroupLinks,
  listProductOptionGroups,
  listProductOptionItemLinks,
  listProductOptionItems,
  listProductVariants,
  listProducts,
  listProfiles,
  listSizes,
} from '@/lib/api/store-api';
import { AdminEnumLabels, readAdminEnumLabels } from '@/lib/admin/enum-labels';
import { getAdminAccessToken } from '@/lib/admin/auth';

export type AdminCategoryRecord = {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  slug_ar: string;
  description: string;
  description_ar: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

export type AdminBrandRecord = {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  slug_ar: string;
  description: string;
  description_ar: string;
  logo_url: string;
  is_active: boolean;
};

export type AdminSizeRecord = {
  id: string;
  code: string;
  name: string;
  name_ar: string;
  sort_order: number;
  is_active: boolean;
};

export type AdminColorRecord = {
  id: string;
  code: string;
  name: string;
  name_ar: string;
  hex_code: string;
  sort_order: number;
  is_active: boolean;
};

export type AdminProductRecord = {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  slug_ar: string;
  short_description: string;
  short_description_ar: string;
  description: string;
  description_ar: string;
  base_price: number;
  compare_at_price: number | null;
  currency: string;
  status: string;
  is_featured: boolean;
  category_id: string;
  brand_id: string;
  primary_image_url: string;
  sub_image_urls: string[];
  variant_count: number;
  total_stock: number;
  max_order_quantity: number | null;
  created_at: string;
};

export type AdminProductVariantRecord = {
  id: string;
  product_id: string;
  size_id: string;
  color_id: string;
  sku: string;
  barcode: string;
  price: number | null;
  compare_at_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  allow_backorder: boolean;
  weight_grams: number | null;
  is_active: boolean;
  created_at: string;
};

export type AdminProductOptionGroupRecord = {
  id: string;
  code: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  selection_type: 'radio' | 'checkbox';
  is_active: boolean;
  sort_order: number;
};

export type AdminProductOptionItemRecord = {
  id: string;
  group_id: string;
  code: string;
  name: string;
  name_ar: string;
  image_url: string;
  price_delta: number;
  stock_quantity: number;
  track_inventory: boolean;
  allow_backorder: boolean;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
};

export type AdminProductOptionGroupLinkRecord = {
  product_id: string;
  option_group_id: string;
  selection_type: 'radio' | 'checkbox';
  is_required: boolean;
  min_selections: number | null;
  max_selections: number | null;
  sort_order: number;
};

export type AdminProductOptionItemLinkRecord = {
  product_id: string;
  option_group_id: string;
  option_item_id: string;
  sort_order: number;
};

export type AdminOrderRecord = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  tracking_number: string;
  shipping_carrier: string;
  notes: string;
  created_at: string;
};

export type AdminCustomerRecord = {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
};

export type AdminFlashSaleRecord = {
  id: string;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number;
  starts_at: string;
  ends_at: string;
  show_as_modal: boolean;
  modal_title: string;
  modal_description: string;
  button_text: string;
  button_url: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type AdminHeroSlideRecord = {
  id: string;
  eyebrow: string;
  eyebrow_ar: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  button_text: string;
  button_text_ar: string;
  button_url: string;
  image_en_url: string;
  image_ar_url: string;
  display_seconds: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type AdminCouponRecord = {
  id: string;
  code: string;
  name: string;
  description: string;
  discount_type: string;
  discount_value: number;
  min_subtotal: number | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
};

export type AdminNavigationItemRecord = {
  id: string;
  parent_id: string;
  label: string;
  label_ar: string;
  path: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type AdminDeliveryZoneRecord = {
  id: string;
  country: string;
  country_ar: string;
  city: string;
  city_ar: string;
  fee: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return Number(value);
}

async function getAdminSupabaseAuth() {
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    return undefined;
  }

  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
}

export async function getAdminProducts(): Promise<AdminProductRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listProducts({}, auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    name_ar: row.name_ar ?? '',
    slug: row.slug,
    slug_ar: row.slug_ar ?? '',
    short_description: row.short_description ?? '',
    short_description_ar: row.short_description_ar ?? '',
    description: row.description ?? '',
    description_ar: row.description_ar ?? '',
    base_price: Number(row.base_price),
    compare_at_price: toNumber(row.compare_at_price),
    currency: row.currency,
    status: row.status,
    is_featured: Boolean(row.is_featured),
    category_id: row.category_id ?? '',
    brand_id: row.brand_id ?? '',
    primary_image_url: row.images?.[0]?.image_url ?? '',
    sub_image_urls: row.images?.slice(1).map((image) => image.image_url) ?? [],
    variant_count: row.variants?.length ?? 0,
    total_stock: (row.variants ?? []).reduce(
      (sum, variant) => sum + Number(variant.stock_quantity ?? 0),
      0
    ),
    max_order_quantity: row.max_order_quantity ?? null,
    created_at: row.created_at,
  }));
}

export async function getAdminProductVariants(): Promise<AdminProductVariantRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listProductVariants(auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    product_id: row.product_id,
    size_id: row.size_id ?? '',
    color_id: row.color_id ?? '',
    sku: row.sku,
    barcode: row.barcode ?? '',
    price: toNumber(row.price),
    compare_at_price: toNumber(row.compare_at_price),
    stock_quantity: Number(row.stock_quantity ?? 0),
    low_stock_threshold: Number(row.low_stock_threshold ?? 0),
    track_inventory: Boolean(row.track_inventory),
    allow_backorder: Boolean(row.allow_backorder),
    weight_grams: toNumber(row.weight_grams),
    is_active: Boolean(row.is_active),
    created_at: row.created_at ?? '',
  }));
}

export async function getAdminProductOptionGroups(): Promise<AdminProductOptionGroupRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listProductOptionGroups(auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    name_ar: row.name_ar ?? '',
    description: row.description ?? '',
    description_ar: row.description_ar ?? '',
    selection_type: row.selection_type,
    is_active: Boolean(row.is_active),
    sort_order: Number(row.sort_order ?? 0),
  }));
}

export async function getAdminProductOptionItems(): Promise<AdminProductOptionItemRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listProductOptionItems(auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    group_id: row.group_id,
    code: row.code,
    name: row.name,
    name_ar: row.name_ar ?? '',
    image_url: row.image_url ?? '',
    price_delta: Number(row.price_delta ?? 0),
    stock_quantity: Number(row.stock_quantity ?? 0),
    track_inventory: Boolean(row.track_inventory),
    allow_backorder: Boolean(row.allow_backorder),
    is_default: Boolean(row.is_default),
    is_active: Boolean(row.is_active),
    sort_order: Number(row.sort_order ?? 0),
  }));
}

export async function getAdminProductOptionGroupLinks(): Promise<
  AdminProductOptionGroupLinkRecord[]
> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listProductOptionGroupLinks(auth);
  return (rows ?? []).map((row) => ({
    product_id: row.product_id,
    option_group_id: row.option_group_id,
    selection_type: row.selection_type ?? 'radio',
    is_required: Boolean(row.is_required),
    min_selections: row.min_selections,
    max_selections: row.max_selections,
    sort_order: Number(row.sort_order ?? 0),
  }));
}

export async function getAdminProductOptionItemLinks(): Promise<
  AdminProductOptionItemLinkRecord[]
> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listProductOptionItemLinks(auth);
  return (rows ?? []).map((row) => ({
    product_id: row.product_id,
    option_group_id: row.option_group_id,
    option_item_id: row.option_item_id,
    sort_order: Number(row.sort_order ?? 0),
  }));
}

export async function getAdminOrders(): Promise<AdminOrderRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listOrders(undefined, auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    order_number: row.order_number,
    status: row.status,
    payment_status: row.payment_status,
    payment_method: row.payment_method,
    customer_name: row.customer_name ?? '',
    customer_email: row.customer_email ?? '',
    customer_phone: row.customer_phone ?? '',
    subtotal: Number(row.subtotal),
    discount_amount: Number(row.discount_amount),
    shipping_amount: Number(row.shipping_amount),
    tax_amount: Number(row.tax_amount),
    total_amount: Number(row.total_amount),
    currency: row.currency,
    tracking_number: row.tracking_number ?? '',
    shipping_carrier: row.shipping_carrier ?? '',
    notes: row.notes ?? '',
    created_at: row.created_at,
  }));
}

export async function getAdminCustomers(): Promise<AdminCustomerRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listProfiles(auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    full_name: row.full_name ?? '',
    phone: row.phone ?? '',
    avatar_url: row.avatar_url ?? '',
    role: row.role,
    is_blocked: row.is_blocked,
    created_at: row.created_at,
  }));
}

export async function getAdminFlashSales(): Promise<AdminFlashSaleRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listFlashSales(auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    discount_type: row.discount_type,
    discount_value: Number(row.discount_value),
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    show_as_modal: Boolean(row.show_as_modal),
    modal_title: row.modal_title ?? '',
    modal_description: row.modal_description ?? '',
    button_text: row.button_text ?? '',
    button_url: row.button_url ?? '',
    image_url: row.image_url ?? '',
    sort_order: Number(row.sort_order ?? 0),
    is_active: row.is_active ?? true,
    created_at: row.created_at ?? '',
  }));
}

export async function getAdminHeroSlides(): Promise<AdminHeroSlideRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listHeroSlides(auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    eyebrow: row.eyebrow ?? '',
    eyebrow_ar: row.eyebrow_ar ?? '',
    title: row.title,
    title_ar: row.title_ar ?? '',
    description: row.description ?? '',
    description_ar: row.description_ar ?? '',
    button_text: row.button_text ?? '',
    button_text_ar: row.button_text_ar ?? '',
    button_url: row.button_url ?? '',
    image_en_url: row.image_en_url ?? '',
    image_ar_url: row.image_ar_url ?? '',
    display_seconds: Number(row.display_seconds ?? 6),
    sort_order: Number(row.sort_order ?? 0),
    is_active: Boolean(row.is_active),
    created_at: row.created_at ?? '',
  }));
}

export async function getAdminCoupons(): Promise<AdminCouponRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listCoupons(auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description ?? '',
    discount_type: row.discount_type,
    discount_value: Number(row.discount_value),
    min_subtotal: toNumber(row.min_subtotal),
    starts_at: row.starts_at ?? '',
    ends_at: row.ends_at ?? '',
    is_active: row.is_active ?? true,
    created_at: row.created_at ?? '',
  }));
}

export async function getAdminNavigationItems(): Promise<AdminNavigationItemRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listNavigationItems(auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    parent_id: row.parent_id ?? '',
    label: row.label,
    label_ar: row.label_ar ?? '',
    path: row.path,
    sort_order: Number(row.sort_order ?? 0),
    is_active: row.is_active ?? true,
    created_at: row.created_at ?? '',
  }));
}

export async function getAdminDeliveryZones(): Promise<AdminDeliveryZoneRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listDeliveryZones(auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    country: row.country,
    country_ar: row.country_ar ?? '',
    city: row.city ?? '',
    city_ar: row.city_ar ?? '',
    fee: Number(row.fee),
    sort_order: Number(row.sort_order ?? 0),
    is_active: row.is_active ?? true,
    created_at: row.created_at ?? '',
  }));
}

export async function getAdminCategories(): Promise<AdminCategoryRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listCategories(auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    name_ar: row.name_ar ?? '',
    slug: row.slug,
    slug_ar: row.slug_ar ?? '',
    description: row.description ?? '',
    description_ar: row.description_ar ?? '',
    image_url: row.image_url ?? '',
    sort_order: row.sort_order ?? 0,
    is_active: row.is_active ?? true,
  }));
}

export async function getAdminBrands(): Promise<AdminBrandRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listBrands(auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    name_ar: row.name_ar ?? '',
    slug: row.slug,
    slug_ar: row.slug_ar ?? '',
    description: row.description ?? '',
    description_ar: row.description_ar ?? '',
    logo_url: row.logo_url ?? '',
    is_active: row.is_active ?? true,
  }));
}

export async function getAdminSizes(): Promise<AdminSizeRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listSizes(auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    name_ar: row.name_ar ?? '',
    sort_order: row.sort_order,
    is_active: row.is_active,
  }));
}

export async function getAdminColors(): Promise<AdminColorRecord[]> {
  const auth = await getAdminSupabaseAuth();
  const rows = await listColors(auth);
  return (rows ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    name_ar: row.name_ar ?? '',
    hex_code: row.hex_code ?? '',
    sort_order: row.sort_order,
    is_active: row.is_active,
  }));
}

export async function getAdminDashboardData() {
  const auth = await getAdminSupabaseAuth();

  const [products, orders, customers, categories, brands, sizes, colors, lookups, enumLabels] =
    await Promise.all([
      getAdminProducts(),
      getAdminOrders(),
      getAdminCustomers(),
      getAdminCategories(),
      getAdminBrands(),
      getAdminSizes(),
      getAdminColors(),
      listAdminLookups(auth),
      readAdminEnumLabels(),
    ]);

  return {
    products,
    orders,
    customers,
    categories,
    brands,
    sizes,
    colors,
    lookups,
    enumLabels,
  };
}

export async function getAdminEnumLabels(): Promise<AdminEnumLabels> {
  return readAdminEnumLabels();
}
