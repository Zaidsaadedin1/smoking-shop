import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import {
  deleteProduct,
  getProductById,
  listProductVariants,
  replaceProductImages,
  replaceProductOptionGroupLinks,
  replaceProductOptionItemLinks,
  replaceProductVariants,
  updateProduct,
} from '@/lib/api/store-api';
import { saveUploadedImage, saveUploadedImages } from '@/lib/admin/uploads';
import { jsonError, jsonOk, optionalString, requireString } from '@/lib/api/http';

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

function parseNonNegativeInteger(value: unknown, field: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${field} must be a positive whole number`);
  }
  return parsed;
}

function parseBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

async function ensureProductSlugAvailable(
  slug: string,
  currentProductId: string,
  accessToken: string | null
) {
  const auth = getAuthHeaders(accessToken);
  const existing = await getProductById(slug, auth);

  if (existing.data && existing.data.id !== currentProductId) {
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
    stock_quantity: Number(variant.stockQuantity ?? 0),
    low_stock_threshold: Number(variant.lowStockThreshold ?? 0),
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
      selection_type: optionalString(link.selectionType) ?? 'radio',
      is_required: parseBoolean(link.isRequired),
      min_selections: parseOptionalNumber(link.minSelections),
      max_selections: parseOptionalNumber(link.maxSelections),
      sort_order: index,
    }))
    .filter((link) => Boolean(link.option_group_id));
}

function parseOptionItemLinks(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return [];
  }
  return (JSON.parse(value) as Array<Record<string, unknown>>)
    .map((link) => ({
      option_group_id: optionalString(link.optionGroupId),
      option_item_id: optionalString(link.optionItemId),
    }))
    .filter((link) => Boolean(link.option_group_id && link.option_item_id));
}

function parseImageUrls(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return [];
  }

  const parsed = JSON.parse(value) as unknown[];
  return parsed.filter(
    (entry): entry is string => typeof entry === 'string' && entry.trim().length > 0
  );
}

function normalizeImageUrls(imageUrls: string[]) {
  return imageUrls.map((value) => value.trim()).filter(Boolean);
}

function areImageSetsEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
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
  productId: string,
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
  const conflictingVariant = existingVariants.find(
    (variant) => variant.product_id !== productId && requestedSkus.has(variant.sku.trim())
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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const accessToken = await getAdminAccessToken();
    const auth = getAuthHeaders(accessToken);
    const { id } = await params;
    const { body, mainImageFile, subImageFiles } = await parseProductRequest(request);
    const payload: Record<string, unknown> = {};
    const hasVariants = body.variantsJson !== undefined;
    const hasOptionGroupLinks = body.optionGroupLinksJson !== undefined;
    const hasOptionItemLinks = body.optionItemLinksJson !== undefined;

    if (body.name !== undefined) {
      payload.name = optionalString(body.name);
    }
    if (body.nameAr !== undefined) {
      payload.name_ar = optionalString(body.nameAr);
    }
    if (body.slug !== undefined) {
      const nextSlug = optionalString(body.slug);

      if (nextSlug) {
        const slugConflict = await ensureProductSlugAvailable(nextSlug, id, accessToken);

        if (slugConflict) {
          return slugConflict;
        }
      }

      payload.slug = nextSlug;
    }
    if (body.slugAr !== undefined) {
      payload.slug_ar = optionalString(body.slugAr);
    }
    if (body.shortDescription !== undefined) {
      payload.short_description = optionalString(body.shortDescription);
    }
    if (body.shortDescriptionAr !== undefined) {
      payload.short_description_ar = optionalString(body.shortDescriptionAr);
    }
    if (body.description !== undefined) {
      payload.description = optionalString(body.description);
    }
    if (body.descriptionAr !== undefined) {
      payload.description_ar = optionalString(body.descriptionAr);
    }
    if (body.currency !== undefined) {
      payload.currency = optionalString(body.currency);
    }
    if (body.status !== undefined) {
      payload.status = optionalString(body.status);
    }
    if (body.categoryId !== undefined) {
      payload.category_id = optionalString(body.categoryId);
    }
    if (body.brandId !== undefined) {
      payload.brand_id = optionalString(body.brandId);
    }

    const basePrice = parseOptionalNumber(body.basePrice);
    if (basePrice !== null) {
      payload.base_price = basePrice;
    }

    if (body.compareAtPrice !== undefined) {
      payload.compare_at_price = parseOptionalNumber(body.compareAtPrice);
    }

    if (body.isFeatured !== undefined) {
      payload.is_featured = parseBoolean(body.isFeatured);
    }

    if (body.maxOrderQuantity !== undefined) {
      payload.max_order_quantity = parseNonNegativeInteger(
        body.maxOrderQuantity,
        'maxOrderQuantity'
      );
    }

    const result = await updateProduct(id, payload, auth);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    const hasImageChanges =
      mainImageFile ||
      subImageFiles.length > 0 ||
      body.mainImageUrl !== undefined ||
      body.subImageUrlsJson !== undefined;

    if (hasImageChanges) {
      const existingProduct = await getProductById(id, auth);

      if (existingProduct.error) {
        return jsonError(existingProduct.error, existingProduct.status);
      }

      const currentImageUrls = normalizeImageUrls(
        (existingProduct.data?.images ?? [])
          .slice()
          .sort((left, right) => Number(left.sort_order ?? 0) - Number(right.sort_order ?? 0))
          .map((image) => image.image_url)
      );
      const uploadedMainImage = mainImageFile
        ? await saveUploadedImage(mainImageFile, 'products', accessToken)
        : null;
      const uploadedSubImages =
        subImageFiles.length > 0
          ? await saveUploadedImages(subImageFiles, 'products', accessToken)
          : [];
      const retainedMainImage = optionalString(body.mainImageUrl);
      const retainedSubImages = parseImageUrls(body.subImageUrlsJson);
      const imageUrls = normalizeImageUrls([
        ...(uploadedMainImage ? [uploadedMainImage] : retainedMainImage ? [retainedMainImage] : []),
        ...retainedSubImages,
        ...uploadedSubImages,
      ]);

      if (
        !uploadedMainImage &&
        uploadedSubImages.length === 0 &&
        areImageSetsEqual(imageUrls, currentImageUrls)
      ) {
        // Skip image replacement when the submitted gallery matches the current gallery.
      } else {
        const imagesResult = await replaceProductImages(id, imageUrls, auth);

        if (imagesResult.error) {
          return jsonError(imagesResult.error, imagesResult.status);
        }
      }
    }

    if (hasVariants) {
      const parsedVariants = parseVariants(body.variantsJson);
      const skuConflict = await ensureVariantSkusAvailable(id, parsedVariants, accessToken);

      if (skuConflict) {
        return skuConflict;
      }

      const variantsResult = await replaceProductVariants(id, parsedVariants, auth);

      if (variantsResult.error) {
        return jsonError(variantsResult.error, variantsResult.status);
      }
    }

    if (hasOptionGroupLinks) {
      const optionLinksResult = await replaceProductOptionGroupLinks(
        id,
        parseOptionGroupLinks(body.optionGroupLinksJson),
        auth
      );

      if (optionLinksResult.error) {
        return jsonError(optionLinksResult.error, optionLinksResult.status);
      }
    }

    if (hasOptionItemLinks) {
      const itemLinksResult = await replaceProductOptionItemLinks(
        id,
        parseOptionItemLinks(body.optionItemLinksJson),
        auth
      );
      if (itemLinksResult.error) {
        return jsonError(itemLinksResult.error, itemLinksResult.status);
      }
    }

    return jsonOk(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await params;
  const auth = getAuthHeaders(await getAdminAccessToken());
  const result = await deleteProduct(id, auth);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}
