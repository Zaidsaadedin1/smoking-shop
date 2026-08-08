import { fallbackFlashSale, fallbackProducts, storeCategories, storeSettings } from '@/lib/commerce-data';
import { CatalogFilters, FlashSale, StoreCategory, StoreProduct, StoreSettings } from '@/lib/commerce-types';
import { filterProducts } from '@/lib/commerce-utils';
import { fetchSupabaseRest } from '@/lib/supabase/rest';

type SupabaseCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url?: string | null;
};

type SupabaseProduct = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  brand_name?: string | null;
  status: string;
  is_featured?: boolean | null;
};

type SupabaseVariant = {
  id: string;
  product_id: string;
  sku: string | null;
  color_name?: string | null;
  color_hex?: string | null;
  size_name?: string | null;
  price: string | number | null;
  compare_at_price?: string | number | null;
  stock_quantity: number;
  allow_backorder?: boolean | null;
};

type SupabaseImage = {
  id?: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  is_primary?: boolean | null;
};

type SupabaseFlashSale = {
  id: string;
  title: string;
  description: string | null;
  discount_value: string | number;
  starts_at: string;
  ends_at: string;
  button_text?: string | null;
  button_url?: string | null;
  show_as_modal?: boolean | null;
  image_url?: string | null;
  is_active?: boolean | null;
};

function groupBy<TItem>(items: TItem[], getKey: (item: TItem) => string) {
  return items.reduce<Record<string, TItem[]>>((acc, item) => {
    const key = getKey(item);
    acc[key] = [...(acc[key] ?? []), item];
    return acc;
  }, {});
}

export async function getStoreSettings(): Promise<StoreSettings> {
  return storeSettings;
}

export async function getCategories(): Promise<StoreCategory[]> {
  const categories = await fetchSupabaseRest<SupabaseCategory[]>('categories', {
    query: {
      select: 'id,slug,name,description,image_url',
      is_active: 'eq.true',
      order: 'sort_order.asc',
    },
    revalidate: 60,
  });

  if (!categories?.length) {
    return storeCategories;
  }

  return categories.map((category, index) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description ?? storeCategories[index % storeCategories.length].description,
    accent: storeCategories[index % storeCategories.length].accent,
    image: category.image_url ?? storeCategories[index % storeCategories.length].image,
  }));
}

export async function getProducts(): Promise<StoreProduct[]> {
  const [products, categories, variants, images] = await Promise.all([
    fetchSupabaseRest<SupabaseProduct[]>('products', {
      query: {
        select: 'id,slug,name,short_description,description,category_id,brand_name,status,is_featured',
        status: 'eq.active',
        order: 'created_at.desc',
      },
      revalidate: 60,
    }),
    fetchSupabaseRest<SupabaseCategory[]>('categories', {
      query: {
        select: 'id,slug,name,description,image_url',
      },
      revalidate: 60,
    }),
    fetchSupabaseRest<SupabaseVariant[]>('product_variants', {
      query: {
        select: 'id,product_id,sku,color_name,color_hex,size_name,price,compare_at_price,stock_quantity,allow_backorder',
        is_active: 'eq.true',
      },
      revalidate: 60,
    }),
    fetchSupabaseRest<SupabaseImage[]>('product_images', {
      query: {
        select: 'id,product_id,image_url,alt_text,is_primary',
        order: 'sort_order.asc',
      },
      revalidate: 60,
    }),
  ]);

  if (!products?.length || !variants?.length) {
    return fallbackProducts;
  }

  const categoriesById = new Map((categories ?? []).map((category) => [category.id, category]));
  const variantsByProduct = groupBy(variants, (variant) => variant.product_id);
  const imagesByProduct = groupBy(images ?? [], (image) => image.product_id);

  return products.reduce<StoreProduct[]>((acc, product) => {
      const productVariants = variantsByProduct[product.id] ?? [];

      if (!productVariants.length) {
        return acc;
      }

      const category = product.category_id ? categoriesById.get(product.category_id) : null;
      const primaryFallback = fallbackProducts.find((item) => item.categorySlug === category?.slug) ?? fallbackProducts[0];

      acc.push({
        id: product.id,
        slug: product.slug,
        name: product.name,
        shortDescription: product.short_description ?? 'A sharp, limited piece from the latest drop.',
        description: product.description ?? product.short_description ?? 'Product description coming from Supabase.',
        categorySlug: category?.slug ?? 'tops',
        brand: product.brand_name ?? 'Tourmaline Coven',
        tags: [category?.name ?? 'fashion', 'dark feminine', 'gothic'],
        images:
          imagesByProduct[product.id]?.map((image, index) => ({
            id: image.id ?? `${product.id}-${index}`,
            url: image.image_url,
            alt: image.alt_text ?? product.name,
            isPrimary: Boolean(image.is_primary),
          })) ?? primaryFallback.images,
        variants: productVariants.map((variant) => ({
          id: variant.id,
          sku: variant.sku ?? `${product.slug}-${variant.id}`,
          color: variant.color_name ?? 'Black',
          colorHex: variant.color_hex ?? '#111111',
          size: variant.size_name ?? 'ONE SIZE',
          price: Number(variant.price ?? 0),
          compareAtPrice: variant.compare_at_price ? Number(variant.compare_at_price) : null,
          stockQuantity: Number(variant.stock_quantity ?? 0),
          allowBackorder: Boolean(variant.allow_backorder),
        })),
        status: product.status === 'active' ? 'active' : 'inactive',
        isFeatured: Boolean(product.is_featured),
        isNew: false,
        rating: primaryFallback.rating,
        reviewCount: primaryFallback.reviewCount,
      } satisfies StoreProduct);

      return acc;
    }, []);
}

export async function getFlashSale(nowIso = new Date().toISOString()): Promise<FlashSale | null> {
  const sales = await fetchSupabaseRest<SupabaseFlashSale[]>('flash_sales', {
    query: {
      select: 'id,title,description,discount_value,starts_at,ends_at,button_text,button_url,show_as_modal,image_url,is_active',
      is_active: 'eq.true',
      starts_at: `lte.${nowIso}`,
      ends_at: `gte.${nowIso}`,
      order: 'starts_at.asc',
      limit: 1,
    },
    revalidate: 0,
  });

  const sale = sales?.[0];

  if (!sale) {
    return fallbackFlashSale;
  }

  return {
    id: sale.id,
    title: sale.title,
    description: sale.description ?? fallbackFlashSale.description,
    discountLabel: `${sale.discount_value}% OFF`,
    startsAt: sale.starts_at,
    endsAt: sale.ends_at,
    ctaText: sale.button_text ?? fallbackFlashSale.ctaText,
    ctaUrl: sale.button_url ?? fallbackFlashSale.ctaUrl,
    showAsModal: Boolean(sale.show_as_modal),
    image: sale.image_url ?? fallbackFlashSale.image,
  };
}

export async function getStorefrontData(filters: CatalogFilters = {}) {
  const [settings, categories, products, flashSale] = await Promise.all([
    getStoreSettings(),
    getCategories(),
    getProducts(),
    getFlashSale(),
  ]);

  return {
    settings,
    categories,
    products,
    filteredProducts: filterProducts(products, filters),
    flashSale,
  };
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
