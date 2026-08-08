import { addCartItem } from '@/lib/api/store-api';
import { jsonError, jsonOk, requirePositiveInteger, requireString } from '@/lib/api/http';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await addCartItem(
      requireString(body.userId, 'userId'),
      requireString(body.variantId, 'variantId'),
      requirePositiveInteger(body.quantity, 'quantity')
    );

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
