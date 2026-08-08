import { invokeSupabaseAuth } from '@/lib/supabase/rest';
import { jsonError, jsonOk, optionalString, requireString } from '@/lib/api/http';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await invokeSupabaseAuth('signup', {
      email: requireString(body.email, 'email'),
      password: requireString(body.password, 'password'),
      phone: optionalString(body.phone) ?? undefined,
      data: {
        full_name: optionalString(body.fullName),
      },
    });

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
