import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requestSupabaseRest } from '@/lib/supabase/rest';

export const CUSTOMER_ACCESS_TOKEN_COOKIE = 'tc-customer-access-token';

type JwtClaims = {
  sub?: string;
  email?: string;
  exp?: number;
  user_metadata?: Record<string, unknown>;
};

type CustomerProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  is_blocked: boolean;
};

export type CustomerSession = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
};

function decodeJwtClaims(token: string): JwtClaims | null {
  const [, payload] = token.split('.');

  if (!payload) {
    return null;
  }

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(normalized, 'base64').toString('utf8')) as JwtClaims;
  } catch {
    return null;
  }
}

function deriveFallbackName(email: string) {
  return email.split('@')[0]?.replace(/[._-]+/g, ' ') ?? 'Customer';
}

export async function resolveCustomerSession(accessToken: string): Promise<CustomerSession | null> {
  const claims = decodeJwtClaims(accessToken);

  if (!claims?.sub || !claims.email) {
    return null;
  }

  if (claims.exp && claims.exp * 1000 <= Date.now()) {
    return null;
  }

  const result = await requestSupabaseRest<CustomerProfileRow>('profiles', {
    query: {
      select: 'id,full_name,phone,avatar_url,role,is_blocked',
      id: `eq.${claims.sub}`,
    },
    single: true,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    revalidate: 0,
  });

  if (result.data?.is_blocked) {
    return null;
  }

  return {
    id: claims.sub,
    email: claims.email,
    fullName:
      result.data?.full_name ??
      (typeof claims.user_metadata?.full_name === 'string' ? claims.user_metadata.full_name : deriveFallbackName(claims.email)),
    phone: result.data?.phone ?? null,
    avatarUrl: result.data?.avatar_url ?? null,
    role: result.data?.role ?? 'customer',
  };
}

export async function getCustomerAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(CUSTOMER_ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getCustomerSession() {
  const accessToken = await getCustomerAccessToken();

  if (!accessToken) {
    return null;
  }

  return resolveCustomerSession(accessToken);
}

export async function requireCustomerSession() {
  const session = await getCustomerSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}

export async function getCustomerAuthHeaders() {
  const accessToken = await getCustomerAccessToken();

  if (!accessToken) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}
