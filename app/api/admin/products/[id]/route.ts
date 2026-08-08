import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { deleteProduct, getProductById, replaceProductImages, replaceProductVariants, updateProduct } from '@/lib/api/store-api';
import { saveUploadedImage, saveUploadedImages } from '@/lib/admin/uploads';
import { jsonError, jsonOk, optionalString } from '@/lib/api/http';

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

function parseVariants(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return [];
  }

  const parsed = JSON.parse(value) as Array<Record<string, unknown>>;

  return parsed.map((variant, index) => ({
    size_id: optionalString(variant.sizeId),
    color_id: optionalString(variant.colorId),
    sku: optionalString(variant.sku) ?? `variant-${index + 1}`,
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
    subImageFiles: subImages.filter((value): value is File => value instanceof File && value.size > 0),
  };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const auth = getAuthHeaders(await getAdminAccessToken());
    const { id } = await params;
    const { body, mainImageFile, subImageFiles } = await parseProductRequest(request);
    const payload: Record<string, unknown> = {};
    const hasVariants = body.variantsJson !== undefined;

    if (body.name !== undefined) payload.name = optionalString(body.name);
    if (body.nameAr !== undefined) payload.name_ar = optionalString(body.nameAr);
    if (body.slug !== undefined) payload.slug = optionalString(body.slug);
    if (body.slugAr !== undefined) payload.slug_ar = optionalString(body.slugAr);
    if (body.shortDescription !== undefined) payload.short_description = optionalString(body.shortDescription);
    if (body.shortDescriptionAr !== undefined) payload.short_description_ar = optionalString(body.shortDescriptionAr);
    if (body.description !== undefined) payload.description = optionalString(body.description);
    if (body.descriptionAr !== undefined) payload.description_ar = optionalString(body.descriptionAr);
    if (body.currency !== undefined) payload.currency = optionalString(body.currency);
    if (body.status !== undefined) payload.status = optionalString(body.status);
    if (body.categoryId !== undefined) payload.category_id = optionalString(body.categoryId);
    if (body.brandId !== undefined) payload.brand_id = optionalString(body.brandId);

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

    const result = await updateProduct(id, payload, auth);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    if (mainImageFile || subImageFiles.length > 0) {
      const existing = await getProductById(id, auth);
      const uploadedMainImage = mainImageFile ? await saveUploadedImage(mainImageFile, 'products') : null;
      const uploadedSubImages = subImageFiles.length > 0 ? await saveUploadedImages(subImageFiles, 'products') : [];
      const existingSubImages = existing.data?.images?.filter((image) => !image.is_primary).map((image) => image.image_url) ?? [];
      const imageUrls = [
        uploadedMainImage ?? existing.data?.images?.find((image) => image.is_primary)?.image_url ?? '',
        ...(subImageFiles.length > 0 ? uploadedSubImages : existingSubImages),
      ].filter(Boolean);
      const imagesResult = await replaceProductImages(id, imageUrls, auth);

      if (imagesResult.error) {
        return jsonError(imagesResult.error, imagesResult.status);
      }
    }

    if (hasVariants) {
      const variantsResult = await replaceProductVariants(id, parseVariants(body.variantsJson), auth);

      if (variantsResult.error) {
        return jsonError(variantsResult.error, variantsResult.status);
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
