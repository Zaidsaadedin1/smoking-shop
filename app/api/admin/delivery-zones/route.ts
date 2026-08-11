import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { createDeliveryZone, listDeliveryZones } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireNumber, requireString } from '@/lib/api/http';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

export async function GET() {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const auth = getAuthHeaders(await getAdminAccessToken());
  const records = await listDeliveryZones(auth);
  return jsonOk(records ?? []);
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const auth = getAuthHeaders(await getAdminAccessToken());
    const result = await createDeliveryZone(
      {
        country: requireString(body.country, 'country'),
        country_ar: optionalString(body.countryAr),
        city: optionalString(body.city),
        city_ar: optionalString(body.cityAr),
        fee: requireNumber(body.fee, 'fee'),
        sort_order: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
        is_active: typeof body.isActive === 'boolean' ? body.isActive : true,
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
