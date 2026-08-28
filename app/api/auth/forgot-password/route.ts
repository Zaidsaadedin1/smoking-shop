import { jsonError, jsonOk, requireString } from '@/lib/api/http';
import { invokeSupabaseAuth } from '@/lib/supabase/rest';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = requireString(body.email, 'email');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const redirectTo = `${siteUrl.replace(/\/$/, '')}/auth/reset-password`;

    const result = await invokeSupabaseAuth('recover', {
      email,
      redirect_to: redirectTo,
    });

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
