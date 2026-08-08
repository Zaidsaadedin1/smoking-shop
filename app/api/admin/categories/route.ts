import { createCategory, listCategories } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireString } from '@/lib/api/http';

export async function GET() {
  const categories = await listCategories();
  return jsonOk(categories);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createCategory({
      name: requireString(body.name, 'name'),
      slug: requireString(body.slug, 'slug'),
      description: optionalString(body.description),
      image_url: optionalString(body.imageUrl),
      is_active: body.isActive ?? true,
      sort_order: body.sortOrder ?? 0,
    });

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
