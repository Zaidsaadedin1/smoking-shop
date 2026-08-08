import { listActiveFlashSales } from '@/lib/api/store-api';
import { jsonOk } from '@/lib/api/http';

export async function GET() {
  const sales = await listActiveFlashSales(new Date().toISOString());
  return jsonOk(sales ?? []);
}
