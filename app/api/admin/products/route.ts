import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import {
  createProduct,
  getProductById,
  listProductVariants,
  replaceProductImages,
  replaceProductOptionGroupLinks,
  replaceProductVariants,
} from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireNumber, requireString } from '@/lib/api/http';
import { listProducts } from '@/lib/api/store-api';
import { saveUploadedImage, saveUploadedImages } from '@/lib/admin/uploads';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

function parseOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

async function ensureProductSlugAvailable(slug: string, accessToken: string | null) {
  const auth = getAuthHeaders(accessToken);
  const existing = await getProductById(slug, auth);

  if (existing.data) {
    return jsonError(
      'A product with this slug already exists. Please choose a different slug.',
      409
    );
  }

  return null;
}

function parseVariants(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return [];
  }

  const parsed = JSON.parse(value) as Array<Record<string, unknown>>;

  return parsed.map((variant, index) => ({
    size_id: optionalString(variant.sizeId),
    color_id: optionalString(variant.colorId),
    sku: requireString(variant.sku, `variants[${index}].sku`),
    barcode: optionalString(variant.barcode),
    price: parseOptionalNumber(variant.price),
    compare_at_price: parseOptionalNumber(variant.compareAtPrice),
    stock_quantity: requireNumber(
      Number(variant.stockQuantity ?? 0),
      `variants[${index}].stockQuantity`
    ),
    low_stock_threshold: requireNumber(
      Number(variant.lowStockThreshold ?? 0),
      `variants[${index}].lowStockThreshold`
    ),
    track_inventory: parseBoolean(variant.trackInventory),
    allow_backorder: parseBoolean(variant.allowBackorder),
    weight_grams: parseOptionalNumber(variant.weightGrams),
    is_active: variant.isActive === undefined ? true : parseBoolean(variant.isActive),
  }));
}

function parseOptionGroupLinks(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return [];
  }

  const parsed = JSON.parse(value) as Array<Record<string, unknown>>;

  return parsed
    .map((link, index) => ({
      option_group_id: optionalString(link.optionGroupId),
      is_required: parseBoolean(link.isRequired),
      min_selections: parseOptionalNumber(link.minSelections),
      max_selections: parseOptionalNumber(link.maxSelections),
      sort_order: index,
    }))
    .filter((link) => Boolean(link.option_group_id));
}

function findDuplicateSkus(variants: Array<{ sku: string }>) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const variant of variants) {
    const sku = variant.sku.trim();

    if (seen.has(sku)) {
      duplicates.add(sku);
      continue;
    }

    seen.add(sku);
  }

  return Array.from(duplicates);
}

async function ensureVariantSkusAvailable(
  variants: Array<{ sku: string }>,
  accessToken: string | null
) {
  const duplicateSkus = findDuplicateSkus(variants);

  if (duplicateSkus.length > 0) {
    return jsonError(`Duplicate variant SKU in this product: ${duplicateSkus[0]}`, 409);
  }

  const auth = getAuthHeaders(accessToken);
  const existingVariants = (await listProductVariants(auth)) ?? [];

  const requestedSkus = new Set(variants.map((variant) => variant.sku.trim()));
  const conflictingVariant = existingVariants.find((variant) =>
    requestedSkus.has(variant.sku.trim())
  );

  if (conflictingVariant) {
    return jsonError(`Variant SKU already exists: ${conflictingVariant.sku}`, 409);
  }

  return null;
}

async function parseProductRequest(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    const body = (await request.json()) as Record<string, unknown>;
    return {
      body,
      mainImageFile: null,
      subImageFiles: [] as File[],
    };
  }

  const formData = await request.formData();
  const mainImage = formData.get('mainImage');
  const subImages = formData.getAll('subImages');

  return {
    body: Object.fromEntries(formData.entries()),
    mainImageFile: mainImage instanceof File && mainImage.size > 0 ? mainImage : null,
    subImageFiles: subImages.filter(
      (value): value is File => value instanceof File && value.size > 0
    ),
  };
}

export async function GET(request: Request) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const { searchParams } = new URL(request.url);
  const auth = getAuthHeaders(await getAdminAccessToken());
  const products = await listProducts(
    {
      search: searchParams.get('search'),
      status: searchParams.get('status'),
      categoryId: searchParams.get('categoryId'),
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : null,
    },
    auth
  );

  return jsonOk(products ?? []);
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const accessToken = await getAdminAccessToken();
    const auth = getAuthHeaders(accessToken);
    const { body, mainImageFile, subImageFiles } = await parseProductRequest(request);
    const basePrice = Number(body.basePrice);
    const compareAtPrice = parseOptionalNumber(body.compareAtPrice);
    const variants = parseVariants(body.variantsJson);
    const optionGroupLinks = parseOptionGroupLinks(body.optionGroupLinksJson);
    const slug = requireString(body.slug, 'slug');
    const slugConflict = await ensureProductSlugAvailable(slug, accessToken);

    if (slugConflict) {
      return slugConflict;
    }

    const skuConflict = await ensureVariantSkusAvailable(variants, accessToken);

    if (skuConflict) {
      return skuConflict;
    }

    const result = await createProduct(
      {
        name: requireString(body.name, 'name'),
        name_ar: optionalString(body.nameAr),
        slug,
        slug_ar: optionalString(body.slugAr),
        short_description: optionalString(body.shortDescription),
        short_description_ar: optionalString(body.shortDescriptionAr),
        description: optionalString(body.description),
        description_ar: optionalString(body.descriptionAr),
        base_price: requireNumber(basePrice, 'basePrice'),
        compare_at_price: compareAtPrice,
        currency: optionalString(body.currency) ?? 'JOD',
        status: optionalString(body.status) ?? 'draft',
        is_featured: parseBoolean(body.isFeatured),
        category_id: optionalString(body.categoryId),
        brand_id: optionalString(body.brandId),
      },
      auth
    );

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    if (!result.data) {
      return jsonError('Product creation failed', 500);
    }

    const uploadedMainImage = mainImageFile
      ? await saveUploadedImage(mainImageFile, 'products', accessToken)
      : null;
    const uploadedSubImages = await saveUploadedImages(subImageFiles, 'products', accessToken);
    const imageUrls = [uploadedMainImage, ...uploadedSubImages].filter((value): value is string =>
      Boolean(value)
    );
    const imagesResult = await replaceProductImages(result.data.id, imageUrls, auth);

    if (imagesResult.error) {
      return jsonError(imagesResult.error, imagesResult.status);
    }

    const variantsResult = await replaceProductVariants(result.data.id, variants, auth);

    if (variantsResult.error) {
      return jsonError(variantsResult.error, variantsResult.status);
    }

    const optionLinksResult = await replaceProductOptionGroupLinks(
      result.data.id,
      optionGroupLinks,
      auth
    );

    if (optionLinksResult.error) {
      return jsonError(optionLinksResult.error, optionLinksResult.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
