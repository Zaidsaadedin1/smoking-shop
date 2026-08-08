import { updateCategory } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString } from '@/lib/api/http';

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
    if (body.imageUrl !== undefined) payload.image_url = optionalString(body.imageUrl);
    if (body.isActive !== undefined) payload.is_active = body.isActive;
    if (body.sortOrder !== undefined) payload.sort_order = body.sortOrder;

    const result = await updateCategory(id, payload);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
