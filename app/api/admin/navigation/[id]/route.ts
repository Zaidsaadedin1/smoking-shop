import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { deleteNavigationItem, updateNavigationItem } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString } from '@/lib/api/http';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

function parseBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await ensureAdminApiAccess();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const auth = getAuthHeaders(await getAdminAccessToken());
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (body.parentId !== undefined) payload.parent_id = optionalString(body.parentId);
    if (body.label !== undefined) payload.label = optionalString(body.label);
    if (body.labelAr !== undefined) payload.label_ar = optionalString(body.labelAr);
    if (body.path !== undefined) payload.path = optionalString(body.path);
    if (body.sortOrder !== undefined) payload.sort_order = Number(body.sortOrder);
    if (body.isActive !== undefined) payload.is_active = parseBoolean(body.isActive);

    const result = await updateNavigationItem(id, payload, auth);

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
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const auth = getAuthHeaders(await getAdminAccessToken());
  const result = await deleteNavigationItem(id, auth);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}
