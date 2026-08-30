import { NextRequest, NextResponse } from 'next/server';
import {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  CUSTOMER_REFRESH_TOKEN_COOKIE,
  CUSTOMER_REFRESH_TOKEN_MAX_AGE_SECONDS,
  CUSTOMER_SESSION_MAX_AGE_SECONDS,
} from '@/lib/customer/auth';

type RefreshResponse = { access_token?: string; refresh_token?: string };

function tokenIsExpired(token: string) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as {
      exp?: number;
    };
    return !payload.exp || payload.exp * 1000 <= Date.now() + 30_000;
  } catch {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(CUSTOMER_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(CUSTOMER_REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken || !refreshToken || !tokenIsExpired(accessToken)) {
    return NextResponse.next();
  }

  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!projectUrl || !anonKey) return NextResponse.next();

  try {
    const response = await fetch(
      `${projectUrl.replace(/\/$/, '')}/auth/v1/token?grant_type=refresh_token`,
      {
        method: 'POST',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );
    const result = (await response.json()) as RefreshResponse;
    if (!response.ok || !result.access_token) return NextResponse.next();

    const nextResponse = NextResponse.next();
    nextResponse.cookies.set(CUSTOMER_ACCESS_TOKEN_COOKIE, result.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: CUSTOMER_SESSION_MAX_AGE_SECONDS,
    });
    if (result.refresh_token) {
      nextResponse.cookies.set(CUSTOMER_REFRESH_TOKEN_COOKIE, result.refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: CUSTOMER_REFRESH_TOKEN_MAX_AGE_SECONDS,
      });
    }
    return nextResponse;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
