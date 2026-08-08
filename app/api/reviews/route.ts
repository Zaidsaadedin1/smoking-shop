import { createReview, listReviews } from '@/lib/api/store-api';
import {
  jsonError,
  jsonOk,
  optionalString,
  requireNumber,
  requireString,
} from '@/lib/api/http';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return jsonError('productId is required');
  }

  const reviews = await listReviews(productId);
  return jsonOk(reviews ?? []);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const rating = requireNumber(body.rating, 'rating');

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return jsonError('rating must be an integer between 1 and 5');
    }

    const result = await createReview({
      product_id: requireString(body.productId, 'productId'),
      user_id: requireString(body.userId, 'userId'),
      rating,
      title: optionalString(body.title),
      comment: optionalString(body.comment),
      is_approved: body.isApproved ?? false,
    });

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
