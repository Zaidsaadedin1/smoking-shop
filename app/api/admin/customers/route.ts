import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { createProfile, listProfiles } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireString } from '@/lib/api/http';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

export async function GET() {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const auth = getAuthHeaders(await getAdminAccessToken());
  const profiles = await listProfiles(auth);
  return jsonOk(profiles ?? []);
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const auth = getAuthHeaders(await getAdminAccessToken());
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createProfile({
      id: requireString(body.id, 'id'),
      full_name: requireString(body.fullName, 'fullName'),
      phone: optionalString(body.phone),
      avatar_url: optionalString(body.avatarUrl),
      role: optionalString(body.role) ?? 'customer',
      is_blocked: Boolean(body.isBlocked),
    }, auth);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
