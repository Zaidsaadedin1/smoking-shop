import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { createCoupon, listCoupons } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireNumber, requireString } from '@/lib/api/http';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

function parseBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

function parseNumber(value: unknown, field: string) {
  return requireNumber(Number(value), field);
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

export async function GET() {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const auth = getAuthHeaders(await getAdminAccessToken());
  const records = await listCoupons(auth);
  return jsonOk(records ?? []);
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const accessToken = await getAdminAccessToken();
    const auth = getAuthHeaders(accessToken);
    const body = (await request.json()) as Record<string, unknown>;
    const startsAt = parseOptionalDateTime(body.startsAt);
    const endsAt = parseOptionalDateTime(body.endsAt);
    validateDateRange(startsAt, endsAt);

    const result = await createCoupon(
      {
        code: requireString(body.code, 'code').toUpperCase(),
        name: requireString(body.name, 'name'),
        description: optionalString(body.description),
        discount_type: requireString(body.discountType, 'discountType'),
        discount_value: parseNumber(body.discountValue, 'discountValue'),
        min_subtotal: parseOptionalNumber(body.minSubtotal),
        starts_at: startsAt,
        ends_at: endsAt,
        is_active: body.isActive === undefined ? true : parseBoolean(body.isActive),
      },
      auth
    );

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
