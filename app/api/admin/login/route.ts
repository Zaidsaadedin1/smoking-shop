import { cookies } from 'next/headers';
import { resolveAdminSession, ADMIN_ACCESS_TOKEN_COOKIE } from '@/lib/admin/auth';
import { jsonError, jsonOk, requireString } from '@/lib/api/http';
import { invokeSupabaseAuth } from '@/lib/supabase/rest';

type LoginResult = {
  access_token: string;
  refresh_token?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = requireString(body.email, 'email');
    const password = requireString(body.password, 'password');

    const result = await invokeSupabaseAuth<LoginResult>('token?grant_type=password', {
      email,
      password,
    });

    if (result.error || !result.data?.access_token) {
      return jsonError(result.error ?? 'Unable to authenticate', result.status || 401);
    }

    const session = await resolveAdminSession(result.data.access_token);

    if (!session) {
      return jsonError('This account does not have admin access', 403);
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_ACCESS_TOKEN_COOKIE, result.data.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return jsonOk(session);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
