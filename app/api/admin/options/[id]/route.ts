import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { deleteProductOptionGroup, updateProductOptionGroup } from '@/lib/api/store-api';
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
    if (body.code !== undefined) {
      payload.code = optionalString(body.code);
    }
    if (body.name !== undefined) {
      payload.name = optionalString(body.name);
    }
    if (body.nameAr !== undefined) {
      payload.name_ar = optionalString(body.nameAr);
    }
    if (body.description !== undefined) {
      payload.description = optionalString(body.description);
    }
    if (body.descriptionAr !== undefined) {
      payload.description_ar = optionalString(body.descriptionAr);
    }
    if (body.isActive !== undefined) {
      payload.is_active = bool(body.isActive);
    }
    if (body.sortOrder !== undefined) {
      payload.sort_order = Number(body.sortOrder);
    }
    const result = await updateProductOptionGroup(
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
  const result = await deleteProductOptionGroup(
    (await params).id,
    auth(await getAdminAccessToken())
  );
  return result.error ? jsonError(result.error, result.status) : jsonOk(result.data);
}
