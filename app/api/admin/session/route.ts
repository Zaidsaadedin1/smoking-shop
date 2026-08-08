import { getAdminSession } from '@/lib/admin/auth';
import { jsonError, jsonOk } from '@/lib/api/http';

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return jsonError('Unauthorized', 401);
  }

  return jsonOk(session);
}
