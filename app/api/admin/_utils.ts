import { NextResponse } from 'next/server';
import { requireAdminApiSession } from '@/lib/admin/auth';
import { jsonError } from '@/lib/api/http';

export async function ensureAdminApiAccess() {
  const session = await requireAdminApiSession();

  if (!session) {
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
  }

  return null;
}

export function handleApiError(error: unknown) {
  return jsonError(error instanceof Error ? error.message : 'Invalid request body');
}
