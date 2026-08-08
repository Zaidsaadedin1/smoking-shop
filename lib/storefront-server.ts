import { addresses as fallbackAddresses, categories as fallbackCategories, orders as fallbackOrders, products as fallbackProducts } from './storefront-data';
import { fetchSupabaseRest } from './supabase/rest';
import { Address, Category, Order, Product, ProductStatus } from './storefront-types';

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  base_price: string | number;
  status: string;
  currency: string;
  created_at: string;
  category_id: string | null;
};

type VariantRow = {
  product_id: string;
  price: string | number | null;
  stock_quantity: number;
};

type OrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  status: Order['status'];
  total_amount: string | number;
};

type AddressRow = {
  id: string;
  label: string | null;
  full_name: string;
  city: string;
  area: string | null;
  phone: string;
  is_default: boolean;
};

function mapProductStatus(status: string, createdAt: string): ProductStatus {
  if (status === 'active') {
    const createdDate = new Date(createdAt);
    const freshThreshold = new Date('2026-07-01T00:00:00.000Z');
    return createdDate >= freshThreshold ? 'new' : 'active';
  }

  if (status === 'draft' || status === 'inactive' || status === 'archived') {
    return status;
  }

  return 'active';
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export async function getCategories(): Promise<Category[]> {
  const rows = await fetchSupabaseRest<CategoryRow[]>('categories', {
    query: {
      select: 'id,name,slug,description',
      is_active: 'eq.true',
      order: 'sort_order.asc',
    },
  });

  if (!rows || rows.length === 0) {
    return fallbackCategories;
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? 'Category description coming from Supabase.',
    accent: row.name,
  }));
}

export async function getProducts(): Promise<Product[]> {
  const [productRows, variantRows, categoryRows] = await Promise.all([
    fetchSupabaseRest<ProductRow[]>('products', {
      query: {
        select: 'id,name,slug,description,short_description,base_price,status,currency,created_at,category_id',
        status: 'in.(active,draft,inactive,archived)',
        order: 'created_at.desc',
      },
    }),
    fetchSupabaseRest<VariantRow[]>('product_variants', {
      query: {
        select: 'product_id,price,stock_quantity',
        is_active: 'eq.true',
      },
    }),
    fetchSupabaseRest<CategoryRow[]>('categories', {
      query: {
        select: 'id,slug,name,description',
      },
    }),
  ]);

  if (!productRows || productRows.length === 0) {
    return fallbackProducts;
  }

  const categoryById = new Map((categoryRows ?? []).map((row) => [row.id, row]));
  const variantsByProductId = new Map<string, VariantRow[]>();

  (variantRows ?? []).forEach((variant) => {
    const bucket = variantsByProductId.get(variant.product_id) ?? [];
    bucket.push(variant);
    variantsByProductId.set(variant.product_id, bucket);
  });

  return productRows.map((row) => {
    const variants = variantsByProductId.get(row.id) ?? [];
    const pricedVariant = variants.find((variant) => variant.price !== null);
    const derivedPrice = pricedVariant?.price ?? row.base_price;
    const category = row.category_id ? categoryById.get(row.category_id) : null;
    const stock = variants.reduce((sum, variant) => sum + variant.stock_quantity, 0);

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      categorySlug: category?.slug ?? 'uncategorized',
      price: Number(derivedPrice),
      status: stock > 0 && stock < 3 ? 'limited' : mapProductStatus(row.status, row.created_at),
      description: row.short_description ?? row.description ?? 'Product description coming from Supabase.',
      color: row.currency === 'JOD' ? 'Tourmaline black' : row.currency,
      sizeRange: variants.length > 0 ? `${variants.length} variants` : 'Single size',
    };
  });
}

export async function getOrders(): Promise<Order[]> {
  const rows = await fetchSupabaseRest<OrderRow[]>('orders', {
    query: {
      select: 'id,order_number,created_at,status,total_amount',
      order: 'created_at.desc',
    },
  });

  if (!rows || rows.length === 0) {
    return fallbackOrders;
  }

  return rows.map((row) => ({
    id: row.id,
    number: row.order_number,
    createdAt: formatDate(row.created_at),
    status: row.status,
    total: Number(row.total_amount),
    items: 0,
  }));
}

export async function getAddresses(): Promise<Address[]> {
  const rows = await fetchSupabaseRest<AddressRow[]>('addresses', {
    query: {
      select: 'id,label,full_name,city,area,phone,is_default',
      order: 'created_at.desc',
    },
  });

  if (!rows || rows.length === 0) {
    return fallbackAddresses;
  }

  return rows.map((row) => ({
    id: row.id,
    label: row.label ?? 'Address',
    fullName: row.full_name,
    city: row.city,
    area: row.area ?? '',
    phone: row.phone,
    isDefault: row.is_default,
  }));
}

export async function getStorefrontSnapshot() {
  const [categories, products, orders, addresses] = await Promise.all([
    getCategories(),
    getProducts(),
    getOrders(),
    getAddresses(),
  ]);

  return {
    categories,
    products,
    orders,
    addresses,
  };
}
