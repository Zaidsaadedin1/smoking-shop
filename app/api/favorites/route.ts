import { addFavorite, listFavorites, removeFavorite } from '@/lib/api/store-api';
import { jsonError, jsonOk, requireString } from '@/lib/api/http';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return jsonError('userId is required');
  }

  const favorites = await listFavorites(userId);
  return jsonOk(favorites);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await addFavorite({
      user_id: requireString(body.userId, 'userId'),
      product_id: requireString(body.productId, 'productId'),
    });

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const productId = searchParams.get('productId');

  if (!userId || !productId) {
    return jsonError('userId and productId are required');
  }

  const result = await removeFavorite(userId, productId);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}
