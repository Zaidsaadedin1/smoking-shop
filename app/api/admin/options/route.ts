import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { createProductOptionGroup, listProductOptionGroups } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireString } from '@/lib/api/http';

const auth = (token: string | null) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
const bool = (value: unknown) => value === true || value === 'true' || value === 'on';

export async function GET() {
  const denied = await ensureAdminApiAccess();
  if (denied) {
    return denied;
  }
  return jsonOk((await listProductOptionGroups(auth(await getAdminAccessToken()))) ?? []);
}

export async function POST(request: Request) {
  const denied = await ensureAdminApiAccess();
  if (denied) {
    return denied;
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createProductOptionGroup(
      {
        code: requireString(body.code, 'code'),
        name: requireString(body.name, 'name'),
        name_ar: optionalString(body.nameAr),
        description: optionalString(body.description),
        description_ar: optionalString(body.descriptionAr),
        selection_type: 'radio',
        is_active: bool(body.isActive),
        sort_order: Number(body.sortOrder ?? 0),
      },
      auth(await getAdminAccessToken())
    );
    return result.error
      ? jsonError(result.error, result.status)
      : jsonOk(result.data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
