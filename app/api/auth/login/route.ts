import { cookies } from 'next/headers';
import { CUSTOMER_ACCESS_TOKEN_COOKIE, CUSTOMER_SESSION_MAX_AGE_SECONDS } from '@/lib/customer/auth';
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
    maxAge: CUSTOMER_SESSION_MAX_AGE_SECONDS,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = requireString(body.email, 'email');
    const password = requireString(body.password, 'password');

    if (password.length < 8 || password.length > 72) {
      return jsonError('Password must be between 8 and 72 characters', 400);
    }

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
