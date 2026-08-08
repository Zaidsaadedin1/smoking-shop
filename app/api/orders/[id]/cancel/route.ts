import { cancelOrder } from '@/lib/api/store-api';
import { jsonError, jsonOk } from '@/lib/api/http';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await cancelOrder(id);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}
