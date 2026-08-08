import { createProduct, listProducts } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireNumber, requireString } from '@/lib/api/http';

export async function GET() {
  const products = await listProducts({});
  return jsonOk(products);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createProduct({
      name: requireString(body.name, 'name'),
      slug: requireString(body.slug, 'slug'),
      description: optionalString(body.description),
      short_description: optionalString(body.shortDescription),
      base_price: requireNumber(body.basePrice, 'basePrice'),
      compare_at_price: body.compareAtPrice ?? null,
      currency: optionalString(body.currency) ?? 'JOD',
      status: optionalString(body.status) ?? 'draft',
      is_featured: body.isFeatured ?? false,
      category_id: optionalString(body.categoryId),
      brand_id: optionalString(body.brandId),
    });

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
