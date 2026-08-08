import {
  deleteSupabaseRow,
  fetchSupabaseRest,
  fetchSupabaseSingle,
  insertSupabaseRow,
  requestSupabaseRest,
  updateSupabaseRow,
  upsertSupabaseRow,
} from '@/lib/supabase/rest';

type CategoryApiRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
};

type ProductApiRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  base_price: string | number;
  compare_at_price?: string | number | null;
  status: string;
  currency: string;
  is_featured?: boolean;
  category_id: string | null;
  brand_id?: string | null;
  created_at: string;
};

type VariantApiRow = {
  id: string;
  product_id: string;
  sku: string;
  price: string | number | null;
  stock_quantity: number;
  is_active: boolean;
};

type ProductImageApiRow = {
  product_id: string;
  image_url: string;
  is_primary: boolean;
};

type FlashSaleRow = {
  id: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: string | number;
  starts_at: string;
  ends_at: string;
  show_as_modal: boolean;
  modal_title: string | null;
  modal_description: string | null;
  button_text: string | null;
  button_url: string | null;
};

type ReviewRow = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
};

type AddressRow = {
  id: string;
  user_id: string;
  label: string | null;
  full_name: string;
  phone: string;
  country: string;
  city: string;
  area: string | null;
  street: string | null;
  building: string | null;
  floor: string | null;
  apartment: string | null;
  postal_code: string | null;
  notes: string | null;
  is_default: boolean;
};

type CartRow = {
  id: string;
  user_id: string;
};

type CartItemRow = {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
};

type FavoriteRow = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  user_id: string | null;
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
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  sku: string | null;
  size_name: string | null;
  color_name: string | null;
  image_url: string | null;
  unit_price: string | number;
  quantity: number;
  line_total: string | number;
};

function groupBy<TItem>(items: TItem[], key: (item: TItem) => string) {
  return items.reduce<Record<string, TItem[]>>((acc, item) => {
    const groupKey = key(item);
    acc[groupKey] = [...(acc[groupKey] ?? []), item];
    return acc;
  }, {});
}

function buildOrderNumber() {
  return `TC-${Date.now()}`;
}

export async function listCategories() {
  return fetchSupabaseRest<CategoryApiRow[]>('categories', {
    query: {
      select: 'id,name,slug,description,image_url,is_active,sort_order',
      order: 'sort_order.asc',
    },
    revalidate: 0,
  });
}

export async function createCategory(payload: Record<string, unknown>) {
  return insertSupabaseRow<CategoryApiRow>('categories', payload, true);
}

export async function updateCategory(id: string, payload: Record<string, unknown>) {
  return updateSupabaseRow<CategoryApiRow>('categories', payload, { id: `eq.${id}` }, true);
}

export async function listProducts(filters: {
  categoryId?: string | null;
  featured?: boolean | null;
  search?: string | null;
  status?: string | null;
  limit?: number | null;
}) {
  const query: Record<string, string | number | undefined> = {
    select:
      'id,name,slug,description,short_description,base_price,compare_at_price,status,currency,is_featured,category_id,brand_id,created_at',
    order: 'created_at.desc',
  };

  if (filters.categoryId) {
    query.category_id = `eq.${filters.categoryId}`;
  }

  if (filters.featured === true) {
    query.is_featured = 'eq.true';
  }

  if (filters.status) {
    query.status = `eq.${filters.status}`;
  }

  if (filters.search) {
    query.or = `(name.ilike.*${filters.search}*,slug.ilike.*${filters.search}*)`;
  }

  if (filters.limit) {
    query.limit = filters.limit;
  }

  const [products, variants, images] = await Promise.all([
    fetchSupabaseRest<ProductApiRow[]>('products', { query, revalidate: 0 }),
    fetchSupabaseRest<VariantApiRow[]>('product_variants', {
      query: {
        select: 'id,product_id,sku,price,stock_quantity,is_active',
        is_active: 'eq.true',
      },
      revalidate: 0,
    }),
    fetchSupabaseRest<ProductImageApiRow[]>('product_images', {
      query: {
        select: 'product_id,image_url,is_primary',
        order: 'sort_order.asc',
      },
      revalidate: 0,
    }),
  ]);

  const groupedVariants = groupBy(variants ?? [], (item) => item.product_id);
  const groupedImages = groupBy(images ?? [], (item) => item.product_id);

  return (products ?? []).map((product) => ({
    ...product,
    variants: groupedVariants[product.id] ?? [],
    images: groupedImages[product.id] ?? [],
  }));
}

export async function getProductById(idOrSlug: string) {
  const result = await fetchSupabaseSingle<ProductApiRow>('products', {
    select:
      'id,name,slug,description,short_description,base_price,compare_at_price,status,currency,is_featured,category_id,brand_id,created_at',
    or: `(id.eq.${idOrSlug},slug.eq.${idOrSlug})`,
  });

  if (!result.data) {
    return { data: null, error: result.error, status: result.status };
  }

  const [variants, images, reviews] = await Promise.all([
    fetchSupabaseRest<VariantApiRow[]>('product_variants', {
      query: {
        select: 'id,product_id,sku,price,stock_quantity,is_active',
        product_id: `eq.${result.data.id}`,
        order: 'created_at.asc',
      },
      revalidate: 0,
    }),
    fetchSupabaseRest<ProductImageApiRow[]>('product_images', {
      query: {
        select: 'product_id,image_url,is_primary',
        product_id: `eq.${result.data.id}`,
        order: 'sort_order.asc',
      },
      revalidate: 0,
    }),
    fetchSupabaseRest<ReviewRow[]>('reviews', {
      query: {
        select: 'id,product_id,user_id,rating,title,comment,created_at',
        product_id: `eq.${result.data.id}`,
        is_approved: 'eq.true',
        order: 'created_at.desc',
      },
      revalidate: 0,
    }),
  ]);

  return {
    data: {
      ...result.data,
      variants: variants ?? [],
      images: images ?? [],
      reviews: reviews ?? [],
    },
    error: null,
    status: 200,
  };
}

export async function createProduct(payload: Record<string, unknown>) {
  return insertSupabaseRow<ProductApiRow>('products', payload, true);
}

export async function updateProduct(id: string, payload: Record<string, unknown>) {
  return updateSupabaseRow<ProductApiRow>('products', payload, { id: `eq.${id}` }, true);
}

export async function listActiveFlashSales(nowIso: string) {
  return fetchSupabaseRest<FlashSaleRow[]>('flash_sales', {
    query: {
      select:
        'id,title,description,discount_type,discount_value,starts_at,ends_at,show_as_modal,modal_title,modal_description,button_text,button_url',
      is_active: 'eq.true',
      starts_at: `lte.${nowIso}`,
      ends_at: `gte.${nowIso}`,
      order: 'sort_order.asc',
    },
    revalidate: 0,
  });
}

export async function listReviews(productId: string) {
  return fetchSupabaseRest<ReviewRow[]>('reviews', {
    query: {
      select: 'id,product_id,user_id,rating,title,comment,created_at',
      product_id: `eq.${productId}`,
      order: 'created_at.desc',
    },
    revalidate: 0,
  });
}

export async function createReview(payload: Record<string, unknown>) {
  return insertSupabaseRow<ReviewRow>('reviews', payload, true);
}

export async function listAddresses(userId: string) {
  return fetchSupabaseRest<AddressRow[]>('addresses', {
    query: {
      select:
        'id,user_id,label,full_name,phone,country,city,area,street,building,floor,apartment,postal_code,notes,is_default',
      user_id: `eq.${userId}`,
      order: 'created_at.desc',
    },
    revalidate: 0,
  });
}

export async function createAddress(payload: Record<string, unknown>) {
  return insertSupabaseRow<AddressRow>('addresses', payload, true);
}

export async function updateAddress(id: string, payload: Record<string, unknown>) {
  return updateSupabaseRow<AddressRow>('addresses', payload, { id: `eq.${id}` }, true);
}

export async function deleteAddress(id: string) {
  return deleteSupabaseRow<AddressRow>('addresses', { id: `eq.${id}` }, true);
}

export async function listFavorites(userId: string) {
  const [favorites, products] = await Promise.all([
    fetchSupabaseRest<FavoriteRow[]>('favorites', {
      query: {
        select: 'id,user_id,product_id,created_at',
        user_id: `eq.${userId}`,
        order: 'created_at.desc',
      },
      revalidate: 0,
    }),
    listProducts({}),
  ]);

  const productMap = new Map((products ?? []).map((product) => [product.id, product]));

  return (favorites ?? []).map((favorite) => ({
    ...favorite,
    product: productMap.get(favorite.product_id) ?? null,
  }));
}

export async function addFavorite(payload: Record<string, unknown>) {
  return insertSupabaseRow<FavoriteRow>('favorites', payload, true);
}

export async function removeFavorite(userId: string, productId: string) {
  return deleteSupabaseRow<FavoriteRow>(
    'favorites',
    {
      user_id: `eq.${userId}`,
      product_id: `eq.${productId}`,
    },
    true
  );
}

export async function ensureCart(userId: string) {
  const existing = await fetchSupabaseSingle<CartRow>('carts', {
    select: 'id,user_id',
    user_id: `eq.${userId}`,
  });

  if (existing.data) {
    return existing;
  }

  return insertSupabaseRow<CartRow>('carts', { user_id: userId }, true);
}

export async function getCart(userId: string) {
  const cart = await ensureCart(userId);

  if (!cart.data) {
    return cart;
  }

  const [items, variants, products] = await Promise.all([
    fetchSupabaseRest<CartItemRow[]>('cart_items', {
      query: {
        select: 'id,cart_id,variant_id,quantity',
        cart_id: `eq.${cart.data.id}`,
        order: 'created_at.asc',
      },
      revalidate: 0,
    }),
    fetchSupabaseRest<VariantApiRow[]>('product_variants', {
      query: {
        select: 'id,product_id,sku,price,stock_quantity,is_active',
      },
      revalidate: 0,
    }),
    listProducts({}),
  ]);

  const variantMap = new Map((variants ?? []).map((variant) => [variant.id, variant]));
  const productMap = new Map((products ?? []).map((product) => [product.id, product]));

  return {
    data: {
      ...cart.data,
      items: (items ?? []).map((item) => {
        const variant = variantMap.get(item.variant_id) ?? null;
        const product = variant ? productMap.get(variant.product_id) ?? null : null;

        return {
          ...item,
          variant,
          product,
        };
      }),
    },
    error: null,
    status: 200,
  };
}

export async function addCartItem(userId: string, variantId: string, quantity: number) {
  const cart = await ensureCart(userId);

  if (!cart.data) {
    return cart;
  }

  return upsertSupabaseRow<CartItemRow>(
    'cart_items',
    {
      cart_id: cart.data.id,
      variant_id: variantId,
      quantity,
    },
    'merge-duplicates'
  );
}

export async function updateCartItem(id: string, quantity: number) {
  return updateSupabaseRow<CartItemRow>('cart_items', { quantity }, { id: `eq.${id}` }, true);
}

export async function deleteCartItem(id: string) {
  return deleteSupabaseRow<CartItemRow>('cart_items', { id: `eq.${id}` }, true);
}

export async function listOrders(userId?: string | null) {
  const query: Record<string, string> = {
    select:
      'id,order_number,user_id,status,payment_status,payment_method,customer_name,customer_email,customer_phone,shipping_address,billing_address,subtotal,discount_amount,shipping_amount,tax_amount,total_amount,currency,coupon_code,notes,tracking_number,shipping_carrier,created_at',
    order: 'created_at.desc',
  };

  if (userId) {
    query.user_id = `eq.${userId}`;
  }

  return fetchSupabaseRest<OrderRow[]>('orders', { query, revalidate: 0 });
}

export async function getOrderById(id: string) {
  const order = await fetchSupabaseSingle<OrderRow>('orders', {
    select:
      'id,order_number,user_id,status,payment_status,payment_method,customer_name,customer_email,customer_phone,shipping_address,billing_address,subtotal,discount_amount,shipping_amount,tax_amount,total_amount,currency,coupon_code,notes,tracking_number,shipping_carrier,created_at',
    id: `eq.${id}`,
  });

  if (!order.data) {
    return order;
  }

  const items = await fetchSupabaseRest<OrderItemRow[]>('order_items', {
    query: {
      select:
        'id,order_id,product_id,variant_id,product_name,sku,size_name,color_name,image_url,unit_price,quantity,line_total',
      order_id: `eq.${order.data.id}`,
      order: 'created_at.asc',
    },
    revalidate: 0,
  });

  return {
    data: {
      ...order.data,
      items: items ?? [],
    },
    error: null,
    status: 200,
  };
}

export async function createOrder(payload: {
  userId?: string | null;
  paymentMethod: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  shippingAddress: Record<string, unknown>;
  billingAddress?: Record<string, unknown> | null;
  subtotal: number;
  discountAmount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  currency?: string;
  couponCode?: string | null;
  notes?: string | null;
  items: Array<{
    productId?: string | null;
    variantId?: string | null;
    productName: string;
    sku?: string | null;
    sizeName?: string | null;
    colorName?: string | null;
    imageUrl?: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
}) {
  const orderInsert = await insertSupabaseRow<OrderRow>(
    'orders',
    {
      order_number: buildOrderNumber(),
      user_id: payload.userId ?? null,
      payment_method: payload.paymentMethod,
      customer_name: payload.customerName,
      customer_email: payload.customerEmail ?? null,
      customer_phone: payload.customerPhone,
      shipping_address: payload.shippingAddress,
      billing_address: payload.billingAddress ?? null,
      subtotal: payload.subtotal,
      discount_amount: payload.discountAmount ?? 0,
      shipping_amount: payload.shippingAmount ?? 0,
      tax_amount: payload.taxAmount ?? 0,
      total_amount: payload.totalAmount,
      currency: payload.currency ?? 'JOD',
      coupon_code: payload.couponCode ?? null,
      notes: payload.notes ?? null,
    },
    true
  );

  if (!orderInsert.data) {
    return orderInsert;
  }

  const itemsInsert = await requestSupabaseRest<OrderItemRow[]>('order_items', {
    method: 'POST',
    body: payload.items.map((item) => ({
      order_id: orderInsert.data!.id,
      product_id: item.productId ?? null,
      variant_id: item.variantId ?? null,
      product_name: item.productName,
      sku: item.sku ?? null,
      size_name: item.sizeName ?? null,
      color_name: item.colorName ?? null,
      image_url: item.imageUrl ?? null,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      line_total: item.lineTotal,
    })),
    prefer: ['return=representation'],
  });

  if (itemsInsert.error) {
    return {
      data: null,
      error: itemsInsert.error,
      status: itemsInsert.status,
    };
  }

  return {
    data: {
      order: orderInsert.data,
      items: itemsInsert.data ?? [],
    },
    error: null,
    status: 201,
  };
}

export async function cancelOrder(id: string) {
  return updateSupabaseRow<OrderRow>(
    'orders',
    {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    },
    { id: `eq.${id}` },
    true
  );
}

export async function listAdminLookups() {
  const [brands, sizes, colors] = await Promise.all([
    fetchSupabaseRest('brands', {
      query: {
        select: 'id,name,slug,is_active',
        order: 'name.asc',
      },
      revalidate: 0,
    }),
    fetchSupabaseRest('sizes', {
      query: {
        select: 'id,code,name,is_active,sort_order',
        order: 'sort_order.asc',
      },
      revalidate: 0,
    }),
    fetchSupabaseRest('colors', {
      query: {
        select: 'id,code,name,hex_code,is_active,sort_order',
        order: 'sort_order.asc',
      },
      revalidate: 0,
    }),
  ]);

  return {
    brands: brands ?? [],
    sizes: sizes ?? [],
    colors: colors ?? [],
  };
}
