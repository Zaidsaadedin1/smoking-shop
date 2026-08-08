import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { createProductVariant, listProductVariants } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireNumber, requireString } from '@/lib/api/http';

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

export async function GET() {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const auth = getAuthHeaders(await getAdminAccessToken());
  const rows = await listProductVariants(auth);
  return jsonOk(rows ?? []);
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const auth = getAuthHeaders(await getAdminAccessToken());
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createProductVariant({
      product_id: requireString(body.productId, 'productId'),
      size_id: optionalString(body.sizeId),
      color_id: optionalString(body.colorId),
      sku: requireString(body.sku, 'sku'),
      barcode: optionalString(body.barcode),
      price: parseOptionalNumber(body.price),
      compare_at_price: parseOptionalNumber(body.compareAtPrice),
      stock_quantity: requireNumber(Number(body.stockQuantity), 'stockQuantity'),
      low_stock_threshold: requireNumber(Number(body.lowStockThreshold ?? 0), 'lowStockThreshold'),
      track_inventory: parseBoolean(body.trackInventory),
      allow_backorder: parseBoolean(body.allowBackorder),
      weight_grams: parseOptionalNumber(body.weightGrams),
      is_active: body.isActive === undefined ? true : parseBoolean(body.isActive),
    }, auth);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
