import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { createNavigationItem, listNavigationItems } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireString } from '@/lib/api/http';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

function parseBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

export async function GET() {
  const unauthorized = await ensureAdminApiAccess();
  if (unauthorized) return unauthorized;

  const auth = getAuthHeaders(await getAdminAccessToken());
  const records = await listNavigationItems(auth);
  return jsonOk(records ?? []);
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApiAccess();
  if (unauthorized) return unauthorized;

  try {
    const auth = getAuthHeaders(await getAdminAccessToken());
    const body = (await request.json()) as Record<string, unknown>;

    const result = await createNavigationItem(
      {
        parent_id: optionalString(body.parentId),
        label: requireString(body.label, 'label'),
        label_ar: optionalString(body.labelAr),
        path: requireString(body.path, 'path'),
        sort_order: Number(body.sortOrder ?? 0),
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
