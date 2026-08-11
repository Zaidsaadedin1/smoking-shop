import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { deleteDeliveryZone, updateDeliveryZone } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString } from '@/lib/api/http';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const { id } = await params;
    const auth = getAuthHeaders(await getAdminAccessToken());
    const payload: Record<string, unknown> = {};

    if (body.country !== undefined) payload.country = optionalString(body.country);
    if (body.countryAr !== undefined) payload.country_ar = optionalString(body.countryAr);
    if (body.city !== undefined) payload.city = optionalString(body.city);
    if (body.cityAr !== undefined) payload.city_ar = optionalString(body.cityAr);
    if (body.fee !== undefined && typeof body.fee === 'number') payload.fee = body.fee;
    if (body.sortOrder !== undefined && typeof body.sortOrder === 'number') payload.sort_order = body.sortOrder;
    if (body.isActive !== undefined && typeof body.isActive === 'boolean') payload.is_active = body.isActive;

    const result = await updateDeliveryZone(id, payload, auth);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await params;
    const auth = getAuthHeaders(await getAdminAccessToken());
    const result = await deleteDeliveryZone(id, auth);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}
