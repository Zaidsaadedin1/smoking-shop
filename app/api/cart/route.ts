import { getCart } from '@/lib/api/store-api';
import { jsonError, jsonOk } from '@/lib/api/http';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return jsonError('userId is required');
  }

  const result = await getCart(userId);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}
