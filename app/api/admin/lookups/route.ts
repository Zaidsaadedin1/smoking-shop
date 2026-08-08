import { listAdminLookups } from '@/lib/api/store-api';
import { jsonOk } from '@/lib/api/http';

export async function GET() {
  const lookups = await listAdminLookups();
  return jsonOk(lookups);
}
