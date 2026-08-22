import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { deleteProductOptionItem, updateProductOptionItem } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString } from '@/lib/api/http';

const auth = (token: string | null) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
const bool = (value: unknown) => value === true || value === 'true' || value === 'on';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await ensureAdminApiAccess();
  if (denied) {
    return denied;
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};
    const map: Record<string, string> = {
      groupId: 'group_id',
      nameAr: 'name_ar',
      imageUrl: 'image_url',
      priceDelta: 'price_delta',
      stockQuantity: 'stock_quantity',
      trackInventory: 'track_inventory',
      allowBackorder: 'allow_backorder',
      isDefault: 'is_default',
      isActive: 'is_active',
      sortOrder: 'sort_order',
    };
    for (const [key, value] of Object.entries(body)) {
      const target = map[key] ?? key;
      if (['priceDelta', 'stockQuantity', 'sortOrder'].includes(key)) {
        payload[target] = Number(value);
      } else if (['trackInventory', 'allowBackorder', 'isDefault', 'isActive'].includes(key)) {
        payload[target] = bool(value);
      } else {
        payload[target] = optionalString(value);
      }
    }
    const result = await updateProductOptionItem(
      (await params).id,
      payload,
      auth(await getAdminAccessToken())
    );
    return result.error ? jsonError(result.error, result.status) : jsonOk(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await ensureAdminApiAccess();
  if (denied) {
    return denied;
  }
  const result = await deleteProductOptionItem(
    (await params).id,
    auth(await getAdminAccessToken())
  );
  return result.error ? jsonError(result.error, result.status) : jsonOk(result.data);
}
