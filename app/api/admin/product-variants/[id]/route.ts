import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { deleteProductVariant, updateProductVariant } from '@/lib/api/store-api';
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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const auth = getAuthHeaders(await getAdminAccessToken());
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (body.productId !== undefined) payload.product_id = optionalString(body.productId);
    if (body.sizeId !== undefined) payload.size_id = optionalString(body.sizeId);
    if (body.colorId !== undefined) payload.color_id = optionalString(body.colorId);
    if (body.sku !== undefined) payload.sku = optionalString(body.sku);
    if (body.barcode !== undefined) payload.barcode = optionalString(body.barcode);
    if (body.price !== undefined) payload.price = parseOptionalNumber(body.price);
    if (body.compareAtPrice !== undefined) payload.compare_at_price = parseOptionalNumber(body.compareAtPrice);
    if (body.stockQuantity !== undefined) payload.stock_quantity = Number(body.stockQuantity);
    if (body.lowStockThreshold !== undefined) payload.low_stock_threshold = Number(body.lowStockThreshold);
    if (body.trackInventory !== undefined) payload.track_inventory = parseBoolean(body.trackInventory);
    if (body.allowBackorder !== undefined) payload.allow_backorder = parseBoolean(body.allowBackorder);
    if (body.weightGrams !== undefined) payload.weight_grams = parseOptionalNumber(body.weightGrams);
    if (body.isActive !== undefined) payload.is_active = parseBoolean(body.isActive);

    const result = await updateProductVariant(id, payload, auth);

    if (result.error) {
      return jsonError(result.error, result.status);
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
  const result = await deleteProductVariant(id, auth);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}
