import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { deleteCoupon, updateCoupon } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString } from '@/lib/api/http';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

function parseBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

function parseOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseOptionalDateTime(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid datetime value');
  }

  return parsed.toISOString();
}

function validateDateRange(startsAt?: string | null, endsAt?: string | null) {
  if (!startsAt || !endsAt) {
    return;
  }

  if (new Date(endsAt).getTime() < new Date(startsAt).getTime()) {
    throw new Error('endsAt must be after startsAt');
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await params;
    const accessToken = await getAdminAccessToken();
    const auth = getAuthHeaders(accessToken);
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (body.code !== undefined) payload.code = optionalString(body.code)?.toUpperCase() ?? null;
    if (body.name !== undefined) payload.name = optionalString(body.name);
    if (body.description !== undefined) payload.description = optionalString(body.description);
    if (body.discountType !== undefined) payload.discount_type = optionalString(body.discountType);
    if (body.discountValue !== undefined) payload.discount_value = parseOptionalNumber(body.discountValue);
    if (body.minSubtotal !== undefined) payload.min_subtotal = parseOptionalNumber(body.minSubtotal);
    if (body.startsAt !== undefined) payload.starts_at = parseOptionalDateTime(body.startsAt);
    if (body.endsAt !== undefined) payload.ends_at = parseOptionalDateTime(body.endsAt);

    validateDateRange(
      typeof payload.starts_at === 'string' ? payload.starts_at : undefined,
      typeof payload.ends_at === 'string' ? payload.ends_at : undefined
    );

    if (body.isActive !== undefined) payload.is_active = parseBoolean(body.isActive);

    const result = await updateCoupon(id, payload, auth);

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
  const result = await deleteCoupon(id, auth);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}
