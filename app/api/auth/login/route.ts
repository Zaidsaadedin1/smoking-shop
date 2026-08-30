import { cookies } from 'next/headers';
import {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  CUSTOMER_REFRESH_TOKEN_COOKIE,
  CUSTOMER_REFRESH_TOKEN_MAX_AGE_SECONDS,
  CUSTOMER_SESSION_MAX_AGE_SECONDS,
} from '@/lib/customer/auth';
import { jsonError, jsonOk, requireString } from '@/lib/api/http';
import {
  getSupabaseServiceRoleHeaders,
  invokeSupabaseAuth,
  requestSupabaseAuth,
  requestSupabaseRest,
} from '@/lib/supabase/rest';

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: {
    id: string;
    email?: string | null;
  };
};

type ProfileLookup = { id: string };
type AuthUserResponse = { id: string; email?: string | null };

function normalizePhone(value: string) {
  const normalized = value.replace(/[\s()-]/g, '');
  if (normalized.startsWith('0')) {
    return `+962${normalized.slice(1)}`;
  }
  return normalized.startsWith('+') ? normalized : `+${normalized}`;
}

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
    const identifier = requireString(body.identifier ?? body.email, 'email or phone number');
    const password = requireString(body.password, 'password');

    if (password.length < 8 || password.length > 72) {
      return jsonError('Password must be between 8 and 72 characters', 400);
    }

    let email = identifier;
    if (!identifier.includes('@')) {
      const serviceRoleHeaders = getSupabaseServiceRoleHeaders();
      const profile = await requestSupabaseRest<ProfileLookup[]>('profiles', {
        query: { select: 'id', phone: `eq.${normalizePhone(identifier)}`, limit: 1 },
        headers: serviceRoleHeaders ?? undefined,
        revalidate: 0,
      });
      const profileId = profile.data?.[0]?.id;

      if (!profileId || !serviceRoleHeaders) {
        return jsonError('Invalid email or password.', 400);
      }

      const authUser = await requestSupabaseAuth<AuthUserResponse>(`admin/users/${profileId}`, {
        headers: serviceRoleHeaders,
      });
      if (!authUser.data?.email) {
        return jsonError('Invalid email or password.', 400);
      }
      email = authUser.data.email;
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
    if (result.data.refresh_token) {
      cookieStore.set(CUSTOMER_REFRESH_TOKEN_COOKIE, result.data.refresh_token, {
        ...buildCookieOptions(),
        maxAge: CUSTOMER_REFRESH_TOKEN_MAX_AGE_SECONDS,
      });
    }

    return jsonOk({
      user: result.data.user ?? null,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
