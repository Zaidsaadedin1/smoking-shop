import { cookies } from 'next/headers';
import { jsonError, jsonOk, requireString } from '@/lib/api/http';
import { upsertProfile } from '@/lib/api/store-api';
import {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  CUSTOMER_SESSION_MAX_AGE_SECONDS,
} from '@/lib/customer/auth';
import { getSupabaseServiceRoleHeaders, invokeSupabaseAuth } from '@/lib/supabase/rest';

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
    maxAge: CUSTOMER_SESSION_MAX_AGE_SECONDS,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = requireString(body.email, 'email');
    const password = requireString(body.password, 'password');
    const fullName = requireString(body.fullName, 'fullName');
    const phone = requireString(body.phone, 'phone');

    if (fullName.trim().length < 2 || fullName.trim().length > 80) {
      return jsonError('Full name must be between 2 and 80 characters', 400);
    }

    if (!/^\+?\d{9,15}$/.test(phone.replace(/[\s()-]/g, ''))) {
      return jsonError('Enter a valid phone number', 400);
    }

    if (password.length < 8 || password.length > 72) {
      return jsonError('Password must be between 8 and 72 characters', 400);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.puffjo.site';
    const result = await invokeSupabaseAuth<SignupResponse>(
      'signup',
      {
        email,
        password,
        data: {
          full_name: fullName,
          phone,
        },
      },
      { redirect_to: `${siteUrl.replace(/\/$/, '')}/auth/confirmed` }
    );

    if (result.error || !result.data?.user?.id) {
      return jsonError(result.error ?? 'Unable to create account', result.status || 400);
    }

    const profilePayload = {
      id: result.data.user.id,
      full_name: fullName,
      phone,
      role: 'customer',
      is_blocked: false,
    };

    let profileCreated = false;
    let profileWarning: string | null = null;

    if (result.data.access_token) {
      const cookieStore = await cookies();
      cookieStore.set(CUSTOMER_ACCESS_TOKEN_COOKIE, result.data.access_token, buildCookieOptions());

      const profileResult = await upsertProfile(profilePayload, {
        headers: {
          Authorization: `Bearer ${result.data.access_token}`,
        },
      });
      profileCreated = !profileResult.error;
      profileWarning = profileResult.error;

      if (profileResult.error) {
        const serviceRoleHeaders = getSupabaseServiceRoleHeaders();

        if (serviceRoleHeaders) {
          const serviceRoleProfileResult = await upsertProfile(profilePayload, {
            headers: serviceRoleHeaders,
          });
          profileCreated = !serviceRoleProfileResult.error;
          profileWarning = serviceRoleProfileResult.error;
        }
      }
    } else {
      const serviceRoleHeaders = getSupabaseServiceRoleHeaders();

      if (serviceRoleHeaders) {
        const profileResult = await upsertProfile(profilePayload, {
          headers: serviceRoleHeaders,
        });
        profileCreated = !profileResult.error;
        profileWarning = profileResult.error;
      } else {
        profileWarning =
          'Email confirmation is enabled, so no customer session was returned. Configure SUPABASE_SERVICE_ROLE_KEY or the auth user trigger to create profiles before verification.';
      }
    }

    return jsonOk({
      requiresEmailConfirmation: !result.data.access_token,
      profileCreated,
      profileWarning,
      user: result.data.user,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
