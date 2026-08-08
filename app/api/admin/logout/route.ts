import { cookies } from 'next/headers';
import { ADMIN_ACCESS_TOKEN_COOKIE } from '@/lib/admin/auth';
import { jsonOk } from '@/lib/api/http';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_ACCESS_TOKEN_COOKIE);
  return jsonOk({ success: true });
}
