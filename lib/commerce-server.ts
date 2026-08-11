import {
  fallbackProducts,
  storeCategories,
  storeSettings,
} from '@/lib/commerce-data';
import {
  CatalogFilters,
  FlashSale,
  HeroSlide,
  NavigationItem,
  StoreCategory,
  StoreProduct,
  StoreSettings,
} from '@/lib/commerce-types';
import { filterProducts } from '@/lib/commerce-utils';
import { fetchSupabaseRest } from '@/lib/supabase/rest';

type SupabaseCategory = {
  id: string;
  slug: string;
  slug_ar?: string | null;
  name: string;
  name_ar?: string | null;
  description: string | null;
  description_ar?: string | null;
  image_url?: string | null;
};

type SupabaseProduct = {
  id: string;
  slug: string;
  slug_ar?: string | null;
  name: string;
  name_ar?: string | null;
  short_description: string | null;
  short_description_ar?: string | null;
  description: string | null;
  description_ar?: string | null;
  base_price: string | number | null;
  compare_at_price?: string | number | null;
  category_id: string | null;
  brand_id?: string | null;
  status: string;
  is_featured?: boolean | null;
};

type SupabaseBrand = {
  id: string;
  name: string;
  name_ar?: string | null;
};

type SupabaseVariant = {
  id: string;
  product_id: string;
  sku: string | null;
  color_id?: string | null;
  size_id?: string | null;
  price: string | number | null;
  compare_at_price?: string | number | null;
  stock_quantity: number;
  allow_backorder?: boolean | null;
};

type SupabaseSize = {
  id: string;
  name: string;
  name_ar?: string | null;
};

type SupabaseColor = {
  id: string;
  name: string;
  name_ar?: string | null;
  hex_code?: string | null;
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
  discount_type: string;
  discount_value: string | number;
  starts_at: string;
  ends_at: string;
  modal_title?: string | null;
  modal_description?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  show_as_modal?: boolean | null;
  image_url?: string | null;
  is_active?: boolean | null;
};

type SupabaseHeroSlide = {
  id: string;
  eyebrow: string | null;
  eyebrow_ar?: string | null;
  title: string;
  title_ar?: string | null;
  description: string | null;
  description_ar?: string | null;
  button_text?: string | null;
  button_text_ar?: string | null;
  button_url?: string | null;
  image_en_url?: string | null;
  image_ar_url?: string | null;
  display_seconds?: number | null;
  sort_order?: number | null;
  is_active?: boolean | null;
};

type SupabaseNavigationItem = {
  id: string;
  parent_id: string | null;
  label: string;
  label_ar?: string | null;
  path: string;
  sort_order?: number | null;
  is_active?: boolean | null;
};

function formatFlashSaleDiscountLabel(discountType: string, discountValue: string | number) {
  return discountType === 'fixed' ? `Save ${discountValue}` : `${discountValue}% OFF`;
}

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

function buildNavigationTree(items: NavigationItem[]) {
  const byParent = items.reduce<Record<string, NavigationItem[]>>((acc, item) => {
    const key = item.parentId ?? 'root';
    acc[key] = [...(acc[key] ?? []), item];
    return acc;
  }, {});

  function attach(parentId: string | null): NavigationItem[] {
    const key = parentId ?? 'root';
    return (byParent[key] ?? [])
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((item) => ({
        ...item,
        children: attach(item.id),
      }));
  }

  return attach(null);
}

export async function getNavigationItems(): Promise<NavigationItem[]> {
  const rows = await fetchSupabaseRest<SupabaseNavigationItem[]>('navigation_items', {
    query: {
      select: 'id,parent_id,label,label_ar,path,sort_order,is_active',
      is_active: 'eq.true',
      order: 'sort_order.asc',
    },
    revalidate: 60,
  });

  if (!rows?.length) {
    return [];
  }

  return buildNavigationTree(
    rows.map((row) => ({
      id: row.id,
      parentId: row.parent_id,
      label: row.label,
      labelAr: row.label_ar ?? '',
      path: row.path,
      sortOrder: Number(row.sort_order ?? 0),
    }))
  );
}

export async function getCategories(): Promise<StoreCategory[]> {
  const categories = await fetchSupabaseRest<SupabaseCategory[]>('categories', {
    query: {
      select: 'id,slug,slug_ar,name,name_ar,description,description_ar,image_url',
      is_active: 'eq.true',
      order: 'sort_order.asc',
    },
    revalidate: 60,
  });

  if (!categories?.length) {
    return storeCategories;
  }

  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    slugAr: category.slug_ar ?? '',
    name: category.name,
    nameAr: category.name_ar ?? '',
    description: category.description ?? '',
    descriptionAr: category.description_ar ?? '',
    accent: category.name,
    accentAr: category.name_ar ?? '',
    image: category.image_url ?? '',
  }));
}

export async function getProducts(): Promise<StoreProduct[]> {
  const [products, categories, brands, sizes, colors, variants, images] = await Promise.all([
    fetchSupabaseRest<SupabaseProduct[]>('products', {
      query: {
        select:
          'id,slug,slug_ar,name,name_ar,short_description,short_description_ar,description,description_ar,base_price,compare_at_price,category_id,brand_id,status,is_featured',
        status: 'eq.active',
        order: 'created_at.desc',
      },
      revalidate: 60,
    }),
    fetchSupabaseRest<SupabaseCategory[]>('categories', {
      query: {
        select: 'id,slug,slug_ar,name,name_ar,description,description_ar,image_url',
      },
      revalidate: 60,
    }),
    fetchSupabaseRest<SupabaseBrand[]>('brands', {
      query: {
        select: 'id,name,name_ar',
        is_active: 'eq.true',
      },
      revalidate: 60,
    }),
    fetchSupabaseRest<SupabaseSize[]>('sizes', {
      query: {
        select: 'id,name,name_ar',
        is_active: 'eq.true',
      },
      revalidate: 60,
    }),
    fetchSupabaseRest<SupabaseColor[]>('colors', {
      query: {
        select: 'id,name,name_ar,hex_code',
        is_active: 'eq.true',
      },
      revalidate: 60,
    }),
    fetchSupabaseRest<SupabaseVariant[]>('product_variants', {
      query: {
        select:
          'id,product_id,sku,color_id,size_id,price,compare_at_price,stock_quantity,allow_backorder',
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

  if (!products?.length) {
    return fallbackProducts;
  }

  const categoriesById = new Map((categories ?? []).map((category) => [category.id, category]));
  const brandsById = new Map((brands ?? []).map((brand) => [brand.id, brand]));
  const sizesById = new Map((sizes ?? []).map((size) => [size.id, size]));
  const colorsById = new Map((colors ?? []).map((color) => [color.id, color]));
  const variantsByProduct = groupBy(variants ?? [], (variant) => variant.product_id);
  const imagesByProduct = groupBy(images ?? [], (image) => image.product_id);

  return products.reduce<StoreProduct[]>((acc, product) => {
    const productVariants = variantsByProduct[product.id] ?? [];

    const category = product.category_id ? categoriesById.get(product.category_id) : null;
    const productImages = (imagesByProduct[product.id] ?? [])
      .map((image, index) => ({
        id: image.id ?? `${product.id}-${index}`,
        url: image.image_url,
        alt: image.alt_text ?? product.name,
        isPrimary: Boolean(image.is_primary),
      }))
      .filter((image) => Boolean(image.url));

    acc.push({
      id: product.id,
      slug: product.slug,
      slugAr: product.slug_ar ?? '',
      name: product.name,
      nameAr: product.name_ar ?? '',
      shortDescription: product.short_description ?? '',
      shortDescriptionAr: product.short_description_ar ?? '',
      description: product.description ?? product.short_description ?? '',
      descriptionAr: product.description_ar ?? product.short_description_ar ?? '',
      categorySlug: category?.slug ?? 'uncategorized',
      brand:
        (product.brand_id ? brandsById.get(product.brand_id)?.name : null) ?? 'Tourmaline Coven',
      brandAr: (product.brand_id ? brandsById.get(product.brand_id)?.name_ar : null) ?? '',
      tags: [category?.name ?? 'fashion', 'dark feminine', 'gothic'],
      images: productImages,
      variants: productVariants.length
        ? productVariants.map((variant) => ({
            id: variant.id,
            sku: variant.sku ?? `${product.slug}-${variant.id}`,
            color: (variant.color_id ? colorsById.get(variant.color_id)?.name : null) ?? 'Default',
            colorAr: (variant.color_id ? colorsById.get(variant.color_id)?.name_ar : null) ?? '',
            colorHex:
              (variant.color_id ? colorsById.get(variant.color_id)?.hex_code : null) ?? '#111111',
            size: (variant.size_id ? sizesById.get(variant.size_id)?.name : null) ?? 'ONE SIZE',
            sizeAr: (variant.size_id ? sizesById.get(variant.size_id)?.name_ar : null) ?? '',
            price: Number(variant.price ?? 0),
            compareAtPrice: variant.compare_at_price ? Number(variant.compare_at_price) : null,
            stockQuantity: Number(variant.stock_quantity ?? 0),
            allowBackorder: Boolean(variant.allow_backorder),
          }))
        : [
            {
              id: `${product.id}-base`,
              sku: `${product.slug}-base`,
              color: 'Default',
              colorAr: 'افتراضي',
              colorHex: '#111111',
              size: 'ONE SIZE',
              sizeAr: 'مقاس واحد',
              price: Number(product.base_price ?? 0),
              compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : null,
              stockQuantity: 1,
              allowBackorder: true,
            },
          ],
      status: product.status === 'active' ? 'active' : 'inactive',
      isFeatured: Boolean(product.is_featured),
      isNew: false,
      rating: 0,
      reviewCount: 0,
    } satisfies StoreProduct);

    return acc;
  }, []);
}

export async function getFlashSale(nowIso = new Date().toISOString()): Promise<FlashSale | null> {
  const sales = await fetchSupabaseRest<SupabaseFlashSale[]>('flash_sales', {
    query: {
      select:
        'id,title,description,discount_type,discount_value,starts_at,ends_at,modal_title,modal_description,button_text,button_url,show_as_modal,image_url,is_active',
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
    return null;
  }

  return {
    id: sale.id,
    title: sale.title,
    description: sale.description ?? '',
    discountLabel: formatFlashSaleDiscountLabel(sale.discount_type, sale.discount_value),
    startsAt: sale.starts_at,
    endsAt: sale.ends_at,
    ctaText: sale.button_text?.trim() || 'SHOP THE SALE',
    ctaUrl: sale.button_url ?? '/shop?sale=true',
    showAsModal: Boolean(sale.show_as_modal),
    image: sale.image_url ?? '',
    modalTitle: sale.modal_title?.trim() || sale.title,
    modalDescription: sale.modal_description?.trim() || sale.description || '',
  };
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const slides = await fetchSupabaseRest<SupabaseHeroSlide[]>('hero_slides', {
    query: {
      select:
        'id,eyebrow,eyebrow_ar,title,title_ar,description,description_ar,button_text,button_text_ar,button_url,image_en_url,image_ar_url,display_seconds,sort_order,is_active',
      is_active: 'eq.true',
      order: 'sort_order.asc',
    },
    revalidate: 0,
  });

  return (slides ?? [])
    .filter((slide) => Boolean(slide.image_en_url || slide.image_ar_url))
    .map((slide) => ({
      id: slide.id,
      eyebrow: slide.eyebrow ?? 'Tourmaline Coven',
      eyebrowAr: slide.eyebrow_ar ?? '',
      title: slide.title,
      titleAr: slide.title_ar ?? '',
      description: slide.description ?? '',
      descriptionAr: slide.description_ar ?? '',
      buttonText: slide.button_text ?? 'SHOP THIS PIECE',
      buttonTextAr: slide.button_text_ar ?? '',
      buttonUrl: slide.button_url ?? '/shop',
      imageEnUrl: slide.image_en_url ?? slide.image_ar_url ?? '',
      imageArUrl: slide.image_ar_url ?? slide.image_en_url ?? '',
      displaySeconds: Math.max(2, Number(slide.display_seconds ?? 6)),
    }));
}

export async function getStorefrontData(filters: CatalogFilters = {}) {
  const [settings, categories, products, flashSale, heroSlides, navigationItems] = await Promise.all([
    getStoreSettings(),
    getCategories(),
    getProducts(),
    getFlashSale(),
    getHeroSlides(),
    getNavigationItems(),
  ]);

  return {
    settings,
    categories,
    products,
    filteredProducts: filterProducts(products, filters),
    flashSale,
    heroSlides,
    navigationItems,
  };
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
