import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { AdminEnumKey, listAdminEnumLabelRows, writeAdminEnumLabel } from '@/lib/admin/enum-labels';
import { jsonError, jsonOk, requireString } from '@/lib/api/http';

export async function GET() {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  return jsonOk(await listAdminEnumLabelRows());
}

export async function PATCH(request: Request) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const enumKey = requireString(body.enumKey, 'enumKey') as AdminEnumKey;
    const value = requireString(body.value, 'value');
    const en = requireString(body.en, 'en');
    const ar = requireString(body.ar, 'ar');

    await writeAdminEnumLabel({ enumKey, value, en, ar });

    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST() {
  return jsonError('Enum values are fixed. Edit labels instead.', 405);
}

export async function DELETE() {
  return jsonError('Enum labels cannot be deleted.', 405);
}
