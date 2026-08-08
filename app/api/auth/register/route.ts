import { cookies } from 'next/headers';
import { jsonError, jsonOk, optionalString, requireString } from '@/lib/api/http';
import { createProfile } from '@/lib/api/store-api';
import { CUSTOMER_ACCESS_TOKEN_COOKIE } from '@/lib/customer/auth';
import { invokeSupabaseAuth } from '@/lib/supabase/rest';

type SignupResponse = {
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
    const fullName = requireString(body.fullName, 'fullName');
    const phone = optionalString(body.phone);

    const result = await invokeSupabaseAuth<SignupResponse>('signup', {
      email,
      password,
      data: {
        full_name: fullName,
        phone,
      },
    });

    if (result.error || !result.data?.user?.id) {
      return jsonError(result.error ?? 'Unable to create account', result.status || 400);
    }

    if (result.data.access_token) {
      const cookieStore = await cookies();
      cookieStore.set(CUSTOMER_ACCESS_TOKEN_COOKIE, result.data.access_token, buildCookieOptions());

      await createProfile(
        {
          id: result.data.user.id,
          full_name: fullName,
          phone,
          role: 'customer',
          is_blocked: false,
        },
        {
          headers: {
            Authorization: `Bearer ${result.data.access_token}`,
          },
        }
      );
    }

    return jsonOk({
      requiresEmailConfirmation: !result.data.access_token,
      user: result.data.user,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
