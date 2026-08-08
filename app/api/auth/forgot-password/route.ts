import { invokeSupabaseAuth } from '@/lib/supabase/rest';
import { jsonError, jsonOk, requireString } from '@/lib/api/http';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await invokeSupabaseAuth('recover', {
      email: requireString(body.email, 'email'),
    });

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
