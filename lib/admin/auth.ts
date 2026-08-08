import { createHash } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requestSupabaseRest } from '@/lib/supabase/rest';

export const ADMIN_ACCESS_TOKEN_COOKIE = 'tc-admin-access-token';

type JwtClaims = {
  sub?: string;
  email?: string;
  exp?: number;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  user_role?: string;
};

type AdminProfileRow = {
  id: string;
  full_name: string | null;
  role: string;
  is_blocked: boolean;
};

export type AdminSession = {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'super_admin';
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

function readAllowedAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

function deriveFallbackName(email: string) {
  return email.split('@')[0]?.replace(/[._-]+/g, ' ') ?? 'Admin';
}

export async function resolveAdminSession(accessToken: string): Promise<AdminSession | null> {
  const claims = decodeJwtClaims(accessToken);

  if (!claims?.sub || !claims.email) {
    return null;
  }

  if (claims.exp && claims.exp * 1000 <= Date.now()) {
    return null;
  }

  const allowedAdminEmails = readAllowedAdminEmails();
  const result = await requestSupabaseRest<AdminProfileRow>('profiles', {
    query: {
      select: 'id,full_name,role,is_blocked',
      id: `eq.${claims.sub}`,
    },
    single: true,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    revalidate: 0,
  });

  const candidateRole = (
    result.data?.role ??
    claims.user_role ??
    claims.app_metadata?.role ??
    claims.user_metadata?.role ??
    (allowedAdminEmails.has(claims.email.toLowerCase()) ? 'admin' : 'customer')
  ) as string;

  if (result.data?.is_blocked) {
    return null;
  }

  if (candidateRole !== 'admin' && candidateRole !== 'super_admin') {
    return null;
  }

  return {
    id: claims.sub,
    email: claims.email,
    fullName:
      result.data?.full_name ??
      (typeof claims.user_metadata?.full_name === 'string' ? claims.user_metadata.full_name : deriveFallbackName(claims.email)),
    role: candidateRole,
  };
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  return resolveAdminSession(accessToken);
}

export async function getAdminAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  return session;
}

export async function requireAdminApiSession() {
  const session = await getAdminSession();

  if (!session) {
    return null;
  }

  return session;
}

export function getAdminAvatarSeed(email: string) {
  return createHash('md5').update(email.toLowerCase()).digest('hex').slice(0, 6);
}
