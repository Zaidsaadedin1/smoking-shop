import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { saveUploadedImage } from '@/lib/admin/uploads';
import { deleteHeroSlide, updateHeroSlide } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString } from '@/lib/api/http';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

function parseBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

function parseOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

async function parseHeroSlideRequest(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    const body = (await request.json()) as Record<string, unknown>;
    return {
      body,
      imageEnFile: null as File | null,
      imageArFile: null as File | null,
    };
  }

  const formData = await request.formData();
  const imageEn = formData.get('imageEn');
  const imageAr = formData.get('imageAr');

  return {
    body: Object.fromEntries(formData.entries()),
    imageEnFile: imageEn instanceof File && imageEn.size > 0 ? imageEn : null,
    imageArFile: imageAr instanceof File && imageAr.size > 0 ? imageAr : null,
  };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await params;
    const accessToken = await getAdminAccessToken();
    const auth = getAuthHeaders(accessToken);
    const { body, imageEnFile, imageArFile } = await parseHeroSlideRequest(request);
    const payload: Record<string, unknown> = {};

    if (body.eyebrow !== undefined) payload.eyebrow = optionalString(body.eyebrow);
    if (body.eyebrowAr !== undefined) payload.eyebrow_ar = optionalString(body.eyebrowAr);
    if (body.title !== undefined) payload.title = optionalString(body.title);
    if (body.titleAr !== undefined) payload.title_ar = optionalString(body.titleAr);
    if (body.description !== undefined) payload.description = optionalString(body.description);
    if (body.descriptionAr !== undefined) payload.description_ar = optionalString(body.descriptionAr);
    if (body.buttonText !== undefined) payload.button_text = optionalString(body.buttonText);
    if (body.buttonTextAr !== undefined) payload.button_text_ar = optionalString(body.buttonTextAr);
    if (body.buttonUrl !== undefined) payload.button_url = optionalString(body.buttonUrl);
    if (imageEnFile) {
      payload.image_en_url = await saveUploadedImage(imageEnFile, 'hero-slides', accessToken);
    } else if (body.imageEnUrl !== undefined) {
      payload.image_en_url = optionalString(body.imageEnUrl);
    }
    if (imageArFile) {
      payload.image_ar_url = await saveUploadedImage(imageArFile, 'hero-slides', accessToken);
    } else if (body.imageArUrl !== undefined) {
      payload.image_ar_url = optionalString(body.imageArUrl);
    }
    if (body.displaySeconds !== undefined) payload.display_seconds = parseOptionalNumber(body.displaySeconds);
    if (body.sortOrder !== undefined) payload.sort_order = parseOptionalNumber(body.sortOrder);
    if (body.isActive !== undefined) payload.is_active = parseBoolean(body.isActive);

    const result = await updateHeroSlide(id, payload, auth);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await params;
  const auth = getAuthHeaders(await getAdminAccessToken());
  const result = await deleteHeroSlide(id, auth);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}
