import { getProductById, updateProduct } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString } from '@/lib/api/http';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getProductById(id);

  if (result.error) {
    return jsonError(result.error, result.status === 406 ? 404 : result.status);
  }

  return jsonOk(result.data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (body.name !== undefined) payload.name = optionalString(body.name);
    if (body.slug !== undefined) payload.slug = optionalString(body.slug);
    if (body.description !== undefined) payload.description = optionalString(body.description);
    if (body.shortDescription !== undefined) payload.short_description = optionalString(body.shortDescription);
    if (body.basePrice !== undefined) payload.base_price = body.basePrice;
    if (body.compareAtPrice !== undefined) payload.compare_at_price = body.compareAtPrice;
    if (body.currency !== undefined) payload.currency = optionalString(body.currency);
    if (body.status !== undefined) payload.status = optionalString(body.status);
    if (body.isFeatured !== undefined) payload.is_featured = body.isFeatured;
    if (body.categoryId !== undefined) payload.category_id = optionalString(body.categoryId);
    if (body.brandId !== undefined) payload.brand_id = optionalString(body.brandId);

    const result = await updateProduct(id, payload);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
