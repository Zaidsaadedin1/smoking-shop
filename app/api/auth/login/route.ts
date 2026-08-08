import { cookies } from 'next/headers';
import { CUSTOMER_ACCESS_TOKEN_COOKIE } from '@/lib/customer/auth';
import { jsonError, jsonOk, requireString } from '@/lib/api/http';
import { invokeSupabaseAuth } from '@/lib/supabase/rest';

type AuthResponse = {
  access_token?: string;
  user?: {
    id: string;
    email?: string | null;
  };
};

function buildCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = requireString(body.email, 'email');
    const password = requireString(body.password, 'password');

    const result = await invokeSupabaseAuth<AuthResponse>('token?grant_type=password', {
      email,
      password,
    });

    if (result.error || !result.data?.access_token) {
      return jsonError(result.error ?? 'Unable to sign in', result.status || 400);
    }

    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_ACCESS_TOKEN_COOKIE, result.data.access_token, buildCookieOptions());

    return jsonOk({
      user: result.data.user ?? null,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
