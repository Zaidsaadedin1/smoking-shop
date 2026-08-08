import { CatalogFilters, StoreProduct } from '@/lib/commerce-types';

export function formatCurrency(value: number, currency = 'JOD') {
  return new Intl.NumberFormat('en-JO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function calculateDiscount(price: number, compareAtPrice?: number | null) {
  if (!compareAtPrice || compareAtPrice <= price) {
    return 0;
  }

  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function getPrimaryVariant(product: StoreProduct) {
  return product.variants[0];
}

export function getPrimaryPrice(product: StoreProduct) {
  return getPrimaryVariant(product)?.price ?? 0;
}

export function getCompareAtPrice(product: StoreProduct) {
  return getPrimaryVariant(product)?.compareAtPrice ?? null;
}

export function getProductInventory(product: StoreProduct) {
  return product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
}

export function getProductColors(product: StoreProduct) {
  return Array.from(
    new Map(
      product.variants.map((variant) => [
        variant.color,
        {
          name: variant.color,
          nameAr: variant.colorAr,
          hex: variant.colorHex,
        },
      ])
    ).values()
  );
}

export function getProductSizes(product: StoreProduct) {
  return Array.from(
    new Map(
      product.variants.map((variant) => [
        variant.size,
        {
          name: variant.size,
          nameAr: variant.sizeAr,
        },
      ])
    ).values()
  );
}

export function filterProducts(products: StoreProduct[], filters: CatalogFilters) {
  const list = products.filter((product) => {
    const price = getPrimaryPrice(product);
    const compareAtPrice = getCompareAtPrice(product);
    const inventory = getProductInventory(product);
    const text = [
      product.name,
      product.nameAr,
      product.shortDescription,
      product.shortDescriptionAr,
      product.description,
      product.descriptionAr,
      product.brand,
      product.brandAr,
      ...product.tags,
      ...product.variants.flatMap((variant) => [variant.color, variant.colorAr, variant.size, variant.sizeAr]),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (filters.search && !text.includes(filters.search.toLowerCase())) {
      return false;
    }

    if (filters.category && product.categorySlug !== filters.category) {
      return false;
    }

    if (
      filters.color &&
      !product.variants.some(
        (variant) =>
          variant.color.toLowerCase() === filters.color?.toLowerCase() ||
          variant.colorAr?.toLowerCase() === filters.color?.toLowerCase()
      )
    ) {
      return false;
    }

    if (
      filters.size &&
      !product.variants.some(
        (variant) =>
          variant.size.toLowerCase() === filters.size?.toLowerCase() ||
          variant.sizeAr?.toLowerCase() === filters.size?.toLowerCase()
      )
    ) {
      return false;
    }

    if (
      filters.brand &&
      product.brand.toLowerCase() !== filters.brand.toLowerCase() &&
      product.brandAr?.toLowerCase() !== filters.brand.toLowerCase()
    ) {
      return false;
    }

    if (filters.minPrice !== undefined && price < filters.minPrice) {
      return false;
    }

    if (filters.maxPrice !== undefined && price > filters.maxPrice) {
      return false;
    }

    if (filters.availability === 'in-stock' && inventory <= 0) {
      return false;
    }

    if (filters.availability === 'low-stock' && inventory > 3) {
      return false;
    }

    if (filters.sale && (!compareAtPrice || compareAtPrice <= price)) {
      return false;
    }

    return true;
  });

  switch (filters.sort) {
    case 'price-asc':
      return list.sort((a, b) => getPrimaryPrice(a) - getPrimaryPrice(b));
    case 'price-desc':
      return list.sort((a, b) => getPrimaryPrice(b) - getPrimaryPrice(a));
    case 'featured':
      return list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    case 'newest':
    default:
      return list.sort((a, b) => Number(b.isNew) - Number(a.isNew));
  }
}
