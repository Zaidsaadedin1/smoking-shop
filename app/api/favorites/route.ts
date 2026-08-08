import { addFavorite, listFavorites, removeFavorite } from '@/lib/api/store-api';
import { jsonError, jsonOk, requireString } from '@/lib/api/http';
import { getCustomerAuthHeaders, getCustomerSession } from '@/lib/customer/auth';

export async function GET() {
  const session = await getCustomerSession();

  if (!session) {
    return jsonError('Unauthorized', 401);
  }

  const authHeaders = await getCustomerAuthHeaders();
  const favorites = await listFavorites(session.id, authHeaders ? { headers: authHeaders } : undefined);
  return jsonOk(favorites);
}

export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return jsonError('Unauthorized', 401);
    }

    const authHeaders = await getCustomerAuthHeaders();
    const body = (await request.json()) as Record<string, unknown>;
    const result = await addFavorite({
      user_id: session.id,
      product_id: requireString(body.productId, 'productId'),
    }, authHeaders ? { headers: authHeaders } : undefined);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}

export async function DELETE(request: Request) {
  const session = await getCustomerSession();

  if (!session) {
    return jsonError('Unauthorized', 401);
  }

  const authHeaders = await getCustomerAuthHeaders();
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return jsonError('productId is required');
  }

  const result = await removeFavorite(session.id, productId, authHeaders ? { headers: authHeaders } : undefined);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}
