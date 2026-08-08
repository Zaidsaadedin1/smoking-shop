import { getOrderById } from '@/lib/api/store-api';
import { jsonError, jsonOk } from '@/lib/api/http';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getOrderById(id);

  if (result.error) {
    return jsonError(result.error, result.status === 406 ? 404 : result.status);
  }

  return jsonOk(result.data);
}
