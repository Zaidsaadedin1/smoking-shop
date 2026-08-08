import { cookies } from 'next/headers';
import { CUSTOMER_ACCESS_TOKEN_COOKIE } from '@/lib/customer/auth';
import { jsonOk } from '@/lib/api/http';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_ACCESS_TOKEN_COOKIE);
  return jsonOk({ ok: true });
}
