import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { saveUploadedImage } from '@/lib/admin/uploads';
import { createCategory, listCategories } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireString } from '@/lib/api/http';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

async function parseCategoryRequest(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    const body = (await request.json()) as Record<string, unknown>;
    return {
      body,
      imageFile: null as File | null,
    };
  }

  const formData = await request.formData();
  const image = formData.get('image');

  return {
    body: Object.fromEntries(formData.entries()),
    imageFile: image instanceof File && image.size > 0 ? image : null,
  };
}

export async function GET() {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const auth = getAuthHeaders(await getAdminAccessToken());
  const categories = await listCategories(auth);
  return jsonOk(categories);
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const auth = getAuthHeaders(await getAdminAccessToken());
    const { body, imageFile } = await parseCategoryRequest(request);
    const uploadedImage = imageFile ? await saveUploadedImage(imageFile, 'categories') : null;
    const result = await createCategory({
      name: requireString(body.name, 'name'),
      name_ar: optionalString(body.nameAr),
      slug: requireString(body.slug, 'slug'),
      slug_ar: optionalString(body.slugAr),
      description: optionalString(body.description),
      description_ar: optionalString(body.descriptionAr),
      image_url: uploadedImage ?? optionalString(body.imageUrl),
      is_active: body.isActive ?? true,
      sort_order: typeof body.sortOrder === 'number' ? body.sortOrder : Number(body.sortOrder ?? 0),
    }, auth);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
