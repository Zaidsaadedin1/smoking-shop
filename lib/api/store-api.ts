import {
  deleteSupabaseRow,
  fetchSupabaseRest,
  fetchSupabaseSingle,
  insertSupabaseRow,
  requestSupabaseRest,
  updateSupabaseRow,
  upsertSupabaseRow,
} from '@/lib/supabase/rest';

type SupabaseRequestAuth = {
  headers?: Record<string, string>;
};

type CategoryApiRow = {
  id: string;
  name: string;
  name_ar?: string | null;
  slug: string;
  slug_ar?: string | null;
  description: string | null;
  description_ar?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
};

type BrandApiRow = {
  id: string;
  name: string;
  name_ar?: string | null;
  slug: string;
  slug_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  logo_url?: string | null;
  is_active?: boolean;
  created_at?: string;
};

type SizeApiRow = {
  id: string;
  code: string;
  name: string;
  name_ar?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
};

type ColorApiRow = {
  id: string;
  code: string;
  name: string;
  name_ar?: string | null;
  hex_code?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
};

type ProfileApiRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  is_blocked: boolean;
  created_at: string;
  updated_at?: string;
};

type ProductApiRow = {
  id: string;
  name: string;
  name_ar?: string | null;
  slug: string;
  slug_ar?: string | null;
  description: string | null;
  description_ar?: string | null;
  short_description: string | null;
  short_description_ar?: string | null;
  base_price: string | number;
  compare_at_price?: string | number | null;
  status: string;
  currency: string;
  is_featured?: boolean;
  category_id: string | null;
  brand_id?: string | null;
  created_at: string;
  max_order_quantity?: number | null;
};

type VariantApiRow = {
  id: string;
  product_id: string;
  sku: string;
  size_id?: string | null;
  color_id?: string | null;
  barcode?: string | null;
  price: string | number | null;
  compare_at_price?: string | number | null;
  stock_quantity: number;
  low_stock_threshold?: number;
  track_inventory?: boolean;
  allow_backorder?: boolean;
  weight_grams?: number | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type ProductImageApiRow = {
  id?: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order?: number;
  alt_text?: string | null;
};

type ProductOptionGroupRow = {
  id: string;
  code: string;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  selection_type: 'radio' | 'checkbox';
  is_active: boolean;
  sort_order: number;
  created_at?: string;
};

type ProductOptionItemRow = {
  id: string;
  group_id: string;
  code: string;
  name: string;
  name_ar?: string | null;
  image_url?: string | null;
  price_delta: string | number;
  stock_quantity: number;
  track_inventory: boolean;
  allow_backorder: boolean;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
};

type ProductOptionGroupLinkRow = {
  product_id: string;
  option_group_id: string;
  selection_type: 'radio' | 'checkbox';
  is_required: boolean;
  min_selections: number | null;
  max_selections: number | null;
  sort_order: number;
  created_at?: string;
};

type ProductOptionItemLinkRow = {
  product_id: string;
  option_group_id: string;
  option_item_id: string;
  sort_order: number;
  created_at?: string;
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
  image_url?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at?: string;
};

type HeroSlideRow = {
  id: string;
  eyebrow: string | null;
  eyebrow_ar: string | null;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  button_text: string | null;
  button_text_ar: string | null;
  button_url: string | null;
  image_en_url: string | null;
  image_ar_url: string | null;
  display_seconds: number | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at?: string;
};

type CouponRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: string;
  discount_value: string | number;
  min_subtotal: string | number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean | null;
  created_at?: string;
  updated_at?: string;
};

type NavigationItemRow = {
  id: string;
  parent_id: string | null;
  label: string;
  label_ar: string | null;
  path: string;
  sort_order: number | null;
  is_active: boolean | null;
  created_at?: string;
  updated_at?: string;
};

type DeliveryZoneRow = {
  id: string;
  country: string;
  country_ar: string | null;
  city: string | null;
  city_ar: string | null;
  fee: string | number;
  sort_order: number | null;
  is_active: boolean | null;
  created_at?: string;
  updated_at?: string;
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
  options?: Record<string, unknown> | null;
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

export async function listCategories(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<CategoryApiRow[]>('categories', {
    query: {
      select:
        'id,name,name_ar,slug,slug_ar,description,description_ar,image_url,is_active,sort_order',
      order: 'sort_order.asc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function createCategory(payload: Record<string, unknown>, auth?: SupabaseRequestAuth) {
  return insertSupabaseRow<CategoryApiRow>('categories', payload, true, auth);
}

export async function updateCategory(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<CategoryApiRow>('categories', payload, { id: `eq.${id}` }, true, auth);
}

export async function deleteCategory(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<CategoryApiRow>('categories', { id: `eq.${id}` }, true, auth);
}

export async function listBrands(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<BrandApiRow[]>('brands', {
    query: {
      select:
        'id,name,name_ar,slug,slug_ar,description,description_ar,logo_url,is_active,created_at',
      order: 'name.asc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function createBrand(payload: Record<string, unknown>, auth?: SupabaseRequestAuth) {
  return insertSupabaseRow<BrandApiRow>('brands', payload, true, auth);
}

export async function updateBrand(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<BrandApiRow>('brands', payload, { id: `eq.${id}` }, true, auth);
}

export async function deleteBrand(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<BrandApiRow>('brands', { id: `eq.${id}` }, true, auth);
}

export async function listSizes(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<SizeApiRow[]>('sizes', {
    query: {
      select: 'id,code,name,name_ar,sort_order,is_active,created_at',
      order: 'sort_order.asc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function createSize(payload: Record<string, unknown>, auth?: SupabaseRequestAuth) {
  return insertSupabaseRow<SizeApiRow>('sizes', payload, true, auth);
}

export async function updateSize(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<SizeApiRow>('sizes', payload, { id: `eq.${id}` }, true, auth);
}

export async function deleteSize(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<SizeApiRow>('sizes', { id: `eq.${id}` }, true, auth);
}

export async function listColors(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<ColorApiRow[]>('colors', {
    query: {
      select: 'id,code,name,name_ar,hex_code,sort_order,is_active,created_at',
      order: 'sort_order.asc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function createColor(payload: Record<string, unknown>, auth?: SupabaseRequestAuth) {
  return insertSupabaseRow<ColorApiRow>('colors', payload, true, auth);
}

export async function updateColor(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<ColorApiRow>('colors', payload, { id: `eq.${id}` }, true, auth);
}

export async function deleteColor(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<ColorApiRow>('colors', { id: `eq.${id}` }, true, auth);
}

export async function listProfiles(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<ProfileApiRow[]>('profiles', {
    query: {
      select: 'id,full_name,phone,avatar_url,role,is_blocked,created_at,updated_at',
      order: 'created_at.desc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function createProfile(payload: Record<string, unknown>, auth?: SupabaseRequestAuth) {
  return insertSupabaseRow<ProfileApiRow>('profiles', payload, true, auth);
}

export async function upsertProfile(payload: Record<string, unknown>, auth?: SupabaseRequestAuth) {
  return upsertSupabaseRow<ProfileApiRow>('profiles', payload, 'merge-duplicates', {
    headers: auth?.headers,
    single: true,
  });
}

export async function updateProfile(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<ProfileApiRow>('profiles', payload, { id: `eq.${id}` }, true, auth);
}

export async function deleteProfile(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<ProfileApiRow>('profiles', { id: `eq.${id}` }, true, auth);
}

export async function listProducts(
  filters: {
    categoryId?: string | null;
    featured?: boolean | null;
    search?: string | null;
    status?: string | null;
    limit?: number | null;
  },
  auth?: SupabaseRequestAuth
) {
  const query: Record<string, string | number | undefined> = {
    select:
      'id,name,name_ar,slug,slug_ar,description,description_ar,short_description,short_description_ar,base_price,compare_at_price,status,currency,is_featured,category_id,brand_id,max_order_quantity,created_at',
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
    fetchSupabaseRest<ProductApiRow[]>('products', {
      query,
      ...(auth?.headers ? { headers: auth.headers } : {}),
      revalidate: 0,
    }),
    fetchSupabaseRest<VariantApiRow[]>('product_variants', {
      query: {
        select:
          'id,product_id,size_id,color_id,sku,barcode,price,compare_at_price,stock_quantity,low_stock_threshold,track_inventory,allow_backorder,weight_grams,is_active',
        is_active: 'eq.true',
      },
      ...(auth?.headers ? { headers: auth.headers } : {}),
      revalidate: 0,
    }),
    fetchSupabaseRest<ProductImageApiRow[]>('product_images', {
      query: {
        select: 'product_id,image_url,is_primary',
        order: 'sort_order.asc',
      },
      ...(auth?.headers ? { headers: auth.headers } : {}),
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

export async function getProductById(idOrSlug: string, auth?: SupabaseRequestAuth) {
  const result = await fetchSupabaseSingle<ProductApiRow>(
    'products',
    {
      select:
        'id,name,name_ar,slug,slug_ar,description,description_ar,short_description,short_description_ar,base_price,compare_at_price,status,currency,is_featured,category_id,brand_id,max_order_quantity,created_at',
      or: `(id.eq.${idOrSlug},slug.eq.${idOrSlug})`,
    },
    auth
  );

  if (!result.data) {
    return { data: null, error: result.error, status: result.status };
  }

  const [variants, images, reviews] = await Promise.all([
    fetchSupabaseRest<VariantApiRow[]>('product_variants', {
      query: {
        select:
          'id,product_id,size_id,color_id,sku,barcode,price,compare_at_price,stock_quantity,low_stock_threshold,track_inventory,allow_backorder,weight_grams,is_active,created_at,updated_at',
        product_id: `eq.${result.data.id}`,
        order: 'created_at.asc',
      },
      ...(auth?.headers ? { headers: auth.headers } : {}),
      revalidate: 0,
    }),
    fetchSupabaseRest<ProductImageApiRow[]>('product_images', {
      query: {
        select: 'product_id,image_url,is_primary',
        product_id: `eq.${result.data.id}`,
        order: 'sort_order.asc',
      },
      ...(auth?.headers ? { headers: auth.headers } : {}),
      revalidate: 0,
    }),
    fetchSupabaseRest<ReviewRow[]>('reviews', {
      query: {
        select: 'id,product_id,user_id,rating,title,comment,created_at',
        product_id: `eq.${result.data.id}`,
        is_approved: 'eq.true',
        order: 'created_at.desc',
      },
      ...(auth?.headers ? { headers: auth.headers } : {}),
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

export async function createProduct(payload: Record<string, unknown>, auth?: SupabaseRequestAuth) {
  return insertSupabaseRow<ProductApiRow>('products', payload, true, auth);
}

export async function listProductVariants(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<VariantApiRow[]>('product_variants', {
    query: {
      select:
        'id,product_id,size_id,color_id,sku,barcode,price,compare_at_price,stock_quantity,low_stock_threshold,track_inventory,allow_backorder,weight_grams,is_active,created_at,updated_at',
      order: 'created_at.desc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function createProductVariant(
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return insertSupabaseRow<VariantApiRow>('product_variants', payload, true, auth);
}

export async function replaceProductVariants(
  productId: string,
  variants: Array<Record<string, unknown>>,
  auth?: SupabaseRequestAuth
) {
  const removeResult = await deleteSupabaseRow<VariantApiRow>(
    'product_variants',
    { product_id: `eq.${productId}` },
    false,
    auth
  );

  if (removeResult.error) {
    return removeResult;
  }

  if (variants.length === 0) {
    return {
      data: [],
      error: null,
      status: 200,
    };
  }

  return insertSupabaseRow<VariantApiRow[]>(
    'product_variants',
    variants.map((variant) => ({
      ...variant,
      product_id: productId,
    })),
    false,
    auth
  );
}

export async function updateProductVariant(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<VariantApiRow>(
    'product_variants',
    payload,
    { id: `eq.${id}` },
    true,
    auth
  );
}

export async function deleteProductVariant(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<VariantApiRow>('product_variants', { id: `eq.${id}` }, true, auth);
}

export async function listProductOptionGroups(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<ProductOptionGroupRow[]>('product_option_groups', {
    query: {
      select:
        'id,code,name,name_ar,description,description_ar,selection_type,is_active,sort_order,created_at',
      order: 'sort_order.asc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function createProductOptionGroup(
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return insertSupabaseRow<ProductOptionGroupRow>('product_option_groups', payload, true, auth);
}

export async function updateProductOptionGroup(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<ProductOptionGroupRow>(
    'product_option_groups',
    payload,
    { id: `eq.${id}` },
    true,
    auth
  );
}

export async function deleteProductOptionGroup(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<ProductOptionGroupRow>(
    'product_option_groups',
    { id: `eq.${id}` },
    true,
    auth
  );
}

export async function listProductOptionItems(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<ProductOptionItemRow[]>('product_option_items', {
    query: {
      select:
        'id,group_id,code,name,name_ar,image_url,price_delta,stock_quantity,track_inventory,allow_backorder,is_default,is_active,sort_order,created_at',
      order: 'sort_order.asc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function createProductOptionItem(
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return insertSupabaseRow<ProductOptionItemRow>('product_option_items', payload, true, auth);
}

export async function updateProductOptionItem(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<ProductOptionItemRow>(
    'product_option_items',
    payload,
    { id: `eq.${id}` },
    true,
    auth
  );
}

export async function deleteProductOptionItem(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<ProductOptionItemRow>(
    'product_option_items',
    { id: `eq.${id}` },
    true,
    auth
  );
}

export async function listProductOptionGroupLinks(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<ProductOptionGroupLinkRow[]>('product_option_group_links', {
    query: {
      select:
        'product_id,option_group_id,selection_type,is_required,min_selections,max_selections,sort_order,created_at',
      order: 'sort_order.asc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function listProductOptionItemLinks(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<ProductOptionItemLinkRow[]>('product_option_item_links', {
    query: {
      select: 'product_id,option_group_id,option_item_id,sort_order,created_at',
      order: 'sort_order.asc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function replaceProductOptionGroupLinks(
  productId: string,
  links: Array<Record<string, unknown>>,
  auth?: SupabaseRequestAuth
) {
  const removeResult = await deleteSupabaseRow<ProductOptionGroupLinkRow>(
    'product_option_group_links',
    { product_id: `eq.${productId}` },
    false,
    auth
  );

  if (removeResult.error) {
    return removeResult;
  }

  if (links.length === 0) {
    return {
      data: [],
      error: null,
      status: 200,
    };
  }

  return insertSupabaseRow<ProductOptionGroupLinkRow[]>(
    'product_option_group_links',
    links.map((link, index) => ({
      ...link,
      product_id: productId,
      sort_order: link.sort_order ?? index,
    })),
    false,
    auth
  );
}

export async function replaceProductOptionItemLinks(
  productId: string,
  links: Array<Record<string, unknown>>,
  auth?: SupabaseRequestAuth
) {
  const removeResult = await deleteSupabaseRow<ProductOptionItemLinkRow>(
    'product_option_item_links',
    { product_id: `eq.${productId}` },
    false,
    auth
  );

  if (removeResult.error || links.length === 0) {
    return removeResult.error ? removeResult : { data: [], error: null, status: 200 };
  }

  return insertSupabaseRow<ProductOptionItemLinkRow[]>(
    'product_option_item_links',
    links.map((link, index) => ({ ...link, product_id: productId, sort_order: index })),
    false,
    auth
  );
}

export async function updateProduct(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<ProductApiRow>('products', payload, { id: `eq.${id}` }, true, auth);
}

export async function replaceProductImages(
  productId: string,
  imageUrls: string[],
  auth?: SupabaseRequestAuth
) {
  const cleanedUrls = imageUrls.map((value) => value.trim()).filter(Boolean);

  const removeResult = await deleteSupabaseRow<ProductImageApiRow>(
    'product_images',
    { product_id: `eq.${productId}` },
    false,
    auth
  );

  if (removeResult.error) {
    return removeResult;
  }

  if (cleanedUrls.length === 0) {
    return {
      data: [],
      error: null,
      status: 200,
    };
  }

  const [primaryImageUrl, ...secondaryImageUrls] = cleanedUrls;

  const primaryInsert = await insertSupabaseRow<ProductImageApiRow>(
    'product_images',
    {
      product_id: productId,
      image_url: primaryImageUrl,
      is_primary: true,
      sort_order: 0,
      alt_text: null,
    },
    true,
    auth
  );

  if (primaryInsert.error) {
    return primaryInsert;
  }

  if (secondaryImageUrls.length === 0) {
    return {
      data: primaryInsert.data ? [primaryInsert.data] : [],
      error: null,
      status: primaryInsert.status,
    };
  }

  const secondaryInsert = await insertSupabaseRow<ProductImageApiRow[]>(
    'product_images',
    secondaryImageUrls.map((imageUrl, index) => ({
      product_id: productId,
      image_url: imageUrl,
      is_primary: false,
      sort_order: index + 1,
      alt_text: null,
    })),
    false,
    auth
  );

  if (secondaryInsert.error) {
    return secondaryInsert;
  }

  return {
    data: [...(primaryInsert.data ? [primaryInsert.data] : []), ...(secondaryInsert.data ?? [])],
    error: null,
    status: secondaryInsert.status,
  };
}

export async function deleteProduct(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<ProductApiRow>('products', { id: `eq.${id}` }, true, auth);
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

export async function listFlashSales(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<FlashSaleRow[]>('flash_sales', {
    query: {
      select:
        'id,title,description,discount_type,discount_value,starts_at,ends_at,show_as_modal,modal_title,modal_description,button_text,button_url,image_url,sort_order,is_active,created_at',
      order: 'starts_at.desc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function createFlashSale(
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return insertSupabaseRow<FlashSaleRow>('flash_sales', payload, true, auth);
}

export async function updateFlashSale(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<FlashSaleRow>('flash_sales', payload, { id: `eq.${id}` }, true, auth);
}

export async function deleteFlashSale(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<FlashSaleRow>('flash_sales', { id: `eq.${id}` }, true, auth);
}

export async function listCoupons(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<CouponRow[]>('coupons', {
    query: {
      select:
        'id,code,name,description,discount_type,discount_value,min_subtotal,starts_at,ends_at,is_active,created_at,updated_at',
      order: 'created_at.desc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function listActiveCoupons(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<CouponRow[]>('coupons', {
    query: {
      select:
        'id,code,name,description,discount_type,discount_value,min_subtotal,starts_at,ends_at,is_active,created_at,updated_at',
      is_active: 'eq.true',
      order: 'created_at.desc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function createCoupon(payload: Record<string, unknown>, auth?: SupabaseRequestAuth) {
  return insertSupabaseRow<CouponRow>('coupons', payload, true, auth);
}

export async function updateCoupon(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<CouponRow>('coupons', payload, { id: `eq.${id}` }, true, auth);
}

export async function deleteCoupon(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<CouponRow>('coupons', { id: `eq.${id}` }, true, auth);
}

export async function listNavigationItems(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<NavigationItemRow[]>('navigation_items', {
    query: {
      select: 'id,parent_id,label,label_ar,path,sort_order,is_active,created_at,updated_at',
      order: 'sort_order.asc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function listActiveNavigationItems(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<NavigationItemRow[]>('navigation_items', {
    query: {
      select: 'id,parent_id,label,label_ar,path,sort_order,is_active,created_at,updated_at',
      is_active: 'eq.true',
      order: 'sort_order.asc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function createNavigationItem(
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return insertSupabaseRow<NavigationItemRow>('navigation_items', payload, true, auth);
}

export async function updateNavigationItem(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<NavigationItemRow>(
    'navigation_items',
    payload,
    { id: `eq.${id}` },
    true,
    auth
  );
}

export async function deleteNavigationItem(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<NavigationItemRow>('navigation_items', { id: `eq.${id}` }, true, auth);
}

export async function listDeliveryZones(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<DeliveryZoneRow[]>('delivery_zones', {
    query: {
      select: 'id,country,country_ar,city,city_ar,fee,sort_order,is_active,created_at,updated_at',
      order: 'sort_order.asc,country.asc,city.asc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function listActiveDeliveryZones() {
  return fetchSupabaseRest<DeliveryZoneRow[]>('delivery_zones', {
    query: {
      select: 'id,country,country_ar,city,city_ar,fee,sort_order,is_active',
      is_active: 'eq.true',
      order: 'sort_order.asc,country.asc,city.asc',
    },
    revalidate: 60,
  });
}

export async function createDeliveryZone(
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return insertSupabaseRow<DeliveryZoneRow>('delivery_zones', payload, true, auth);
}

export async function updateDeliveryZone(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<DeliveryZoneRow>(
    'delivery_zones',
    payload,
    { id: `eq.${id}` },
    true,
    auth
  );
}

export async function deleteDeliveryZone(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<DeliveryZoneRow>('delivery_zones', { id: `eq.${id}` }, true, auth);
}

export async function listHeroSlides(auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<HeroSlideRow[]>('hero_slides', {
    query: {
      select:
        'id,eyebrow,eyebrow_ar,title,title_ar,description,description_ar,button_text,button_text_ar,button_url,image_en_url,image_ar_url,display_seconds,sort_order,is_active,created_at',
      order: 'sort_order.asc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function listActiveHeroSlides() {
  return fetchSupabaseRest<HeroSlideRow[]>('hero_slides', {
    query: {
      select:
        'id,eyebrow,eyebrow_ar,title,title_ar,description,description_ar,button_text,button_text_ar,button_url,image_en_url,image_ar_url,display_seconds,sort_order,is_active,created_at',
      is_active: 'eq.true',
      order: 'sort_order.asc',
    },
    revalidate: 0,
  });
}

export async function createHeroSlide(
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return insertSupabaseRow<HeroSlideRow>('hero_slides', payload, true, auth);
}

export async function updateHeroSlide(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<HeroSlideRow>('hero_slides', payload, { id: `eq.${id}` }, true, auth);
}

export async function deleteHeroSlide(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<HeroSlideRow>('hero_slides', { id: `eq.${id}` }, true, auth);
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

export async function createReview(payload: Record<string, unknown>, auth?: SupabaseRequestAuth) {
  return insertSupabaseRow<ReviewRow>('reviews', payload, true, auth);
}

export async function listAddresses(userId: string, auth?: SupabaseRequestAuth) {
  return fetchSupabaseRest<AddressRow[]>('addresses', {
    query: {
      select:
        'id,user_id,label,full_name,phone,country,city,area,street,building,floor,apartment,postal_code,notes,is_default',
      user_id: `eq.${userId}`,
      order: 'created_at.desc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function createAddress(payload: Record<string, unknown>, auth?: SupabaseRequestAuth) {
  return insertSupabaseRow<AddressRow>('addresses', payload, true, auth);
}

export async function updateAddress(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<AddressRow>('addresses', payload, { id: `eq.${id}` }, true, auth);
}

export async function deleteAddress(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<AddressRow>('addresses', { id: `eq.${id}` }, true, auth);
}

export async function listFavorites(userId: string, auth?: SupabaseRequestAuth) {
  const [favorites, products] = await Promise.all([
    fetchSupabaseRest<FavoriteRow[]>('favorites', {
      query: {
        select: 'id,user_id,product_id,created_at',
        user_id: `eq.${userId}`,
        order: 'created_at.desc',
      },
      ...(auth?.headers ? { headers: auth.headers } : {}),
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

export async function addFavorite(payload: Record<string, unknown>, auth?: SupabaseRequestAuth) {
  return insertSupabaseRow<FavoriteRow>('favorites', payload, true, auth);
}

export async function removeFavorite(
  userId: string,
  productId: string,
  auth?: SupabaseRequestAuth
) {
  return deleteSupabaseRow<FavoriteRow>(
    'favorites',
    {
      user_id: `eq.${userId}`,
      product_id: `eq.${productId}`,
    },
    true,
    auth
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
        const product = variant ? (productMap.get(variant.product_id) ?? null) : null;

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

export async function listOrders(userId?: string | null, auth?: SupabaseRequestAuth) {
  const query: Record<string, string> = {
    select:
      'id,order_number,user_id,status,payment_status,payment_method,customer_name,customer_email,customer_phone,shipping_address,billing_address,subtotal,discount_amount,shipping_amount,tax_amount,total_amount,currency,coupon_code,notes,tracking_number,shipping_carrier,created_at',
    order: 'created_at.desc',
  };

  if (userId) {
    query.user_id = `eq.${userId}`;
  }

  return fetchSupabaseRest<OrderRow[]>('orders', {
    query,
    ...(auth?.headers ? { headers: auth.headers } : {}),
    revalidate: 0,
  });
}

export async function createAdminOrder(
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return insertSupabaseRow<OrderRow>('orders', payload, true, auth);
}

export async function updateOrder(
  id: string,
  payload: Record<string, unknown>,
  auth?: SupabaseRequestAuth
) {
  return updateSupabaseRow<OrderRow>('orders', payload, { id: `eq.${id}` }, true, auth);
}

export async function replaceOrderItems(
  orderId: string,
  items: Array<{
    productId?: string | null;
    variantId?: string | null;
    productName: string;
    sku?: string | null;
    sizeName?: string | null;
    colorName?: string | null;
    imageUrl?: string | null;
    options?: Record<string, unknown> | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>,
  auth?: SupabaseRequestAuth
) {
  const removed = await deleteSupabaseRow<OrderItemRow>(
    'order_items',
    { order_id: `eq.${orderId}` },
    false,
    auth
  );

  if (removed.error) {
    return removed;
  }

  return requestSupabaseRest<OrderItemRow[]>('order_items', {
    method: 'POST',
    body: items.map((item) => ({
      order_id: orderId,
      product_id: item.productId ?? null,
      variant_id: item.variantId ?? null,
      product_name: item.productName,
      sku: item.sku ?? null,
      size_name: item.sizeName ?? null,
      color_name: item.colorName ?? null,
      image_url: item.imageUrl ?? null,
      options: item.options ?? {},
      unit_price: item.unitPrice,
      quantity: item.quantity,
      line_total: item.lineTotal,
    })),
    prefer: ['return=representation'],
    ...(auth?.headers ? { headers: auth.headers } : {}),
  });
}

export async function deleteOrder(id: string, auth?: SupabaseRequestAuth) {
  return deleteSupabaseRow<OrderRow>('orders', { id: `eq.${id}` }, true, auth);
}

export async function getOrderById(id: string, auth?: SupabaseRequestAuth) {
  const order = await fetchSupabaseSingle<OrderRow>(
    'orders',
    {
      select:
        'id,order_number,user_id,status,payment_status,payment_method,customer_name,customer_email,customer_phone,shipping_address,billing_address,subtotal,discount_amount,shipping_amount,tax_amount,total_amount,currency,coupon_code,notes,tracking_number,shipping_carrier,created_at',
      id: `eq.${id}`,
    },
    {
      ...(auth?.headers ? { headers: auth.headers } : {}),
      revalidate: 0,
    }
  );

  if (!order.data) {
    return order;
  }

  const items = await fetchSupabaseRest<OrderItemRow[]>('order_items', {
    query: {
      select:
        'id,order_id,product_id,variant_id,product_name,sku,size_name,color_name,image_url,options,unit_price,quantity,line_total',
      order_id: `eq.${order.data.id}`,
      order: 'created_at.asc',
    },
    ...(auth?.headers ? { headers: auth.headers } : {}),
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

export async function createOrder(
  payload: {
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
      options?: Record<string, unknown> | null;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }>;
  },
  auth?: SupabaseRequestAuth
) {
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
    true,
    auth
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
      options: item.options ?? {},
      unit_price: item.unitPrice,
      quantity: item.quantity,
      line_total: item.lineTotal,
    })),
    prefer: ['return=representation'],
    ...(auth?.headers ? { headers: auth.headers } : {}),
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

export async function listAdminLookups(auth?: { headers?: Record<string, string> }) {
  const [brands, sizes, colors] = await Promise.all([
    fetchSupabaseRest('brands', {
      query: {
        select: 'id,name,slug,is_active',
        order: 'name.asc',
      },
      ...(auth?.headers ? { headers: auth.headers } : {}),
      revalidate: 0,
    }),
    fetchSupabaseRest('sizes', {
      query: {
        select: 'id,code,name,is_active,sort_order',
        order: 'sort_order.asc',
      },
      ...(auth?.headers ? { headers: auth.headers } : {}),
      revalidate: 0,
    }),
    fetchSupabaseRest('colors', {
      query: {
        select: 'id,code,name,hex_code,is_active,sort_order',
        order: 'sort_order.asc',
      },
      ...(auth?.headers ? { headers: auth.headers } : {}),
      revalidate: 0,
    }),
  ]);

  return {
    brands: brands ?? [],
    sizes: sizes ?? [],
    colors: colors ?? [],
  };
}
