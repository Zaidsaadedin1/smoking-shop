import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { saveUploadedImage } from '@/lib/admin/uploads';
import { deleteCategory, updateCategory } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString } from '@/lib/api/http';

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const accessToken = await getAdminAccessToken();
    const auth = getAuthHeaders(accessToken);
    const { id } = await params;
    const { body, imageFile } = await parseCategoryRequest(request);
    const payload: Record<string, unknown> = {};

    if (body.name !== undefined) payload.name = optionalString(body.name);
    if (body.nameAr !== undefined) payload.name_ar = optionalString(body.nameAr);
    if (body.slug !== undefined) payload.slug = optionalString(body.slug);
    if (body.slugAr !== undefined) payload.slug_ar = optionalString(body.slugAr);
    if (body.description !== undefined) payload.description = optionalString(body.description);
    if (body.descriptionAr !== undefined) payload.description_ar = optionalString(body.descriptionAr);
    if (imageFile) {
      payload.image_url = await saveUploadedImage(imageFile, 'categories', accessToken);
    } else if (body.imageUrl !== undefined) {
      payload.image_url = optionalString(body.imageUrl);
    }
    if (body.isActive !== undefined) payload.is_active = body.isActive;
    if (body.sortOrder !== undefined) payload.sort_order = Number(body.sortOrder);

    const result = await updateCategory(id, payload, auth);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const auth = getAuthHeaders(await getAdminAccessToken());
  const { id } = await params;
  const result = await deleteCategory(id, auth);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}
