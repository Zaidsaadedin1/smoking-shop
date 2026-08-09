import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { saveUploadedImage } from '@/lib/admin/uploads';
import { createHeroSlide, listHeroSlides } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireNumber, requireString } from '@/lib/api/http';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

function parseBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

function parseNumber(value: unknown, field: string) {
  return requireNumber(Number(value), field);
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

export async function GET() {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const auth = getAuthHeaders(await getAdminAccessToken());
  const records = await listHeroSlides(auth);
  return jsonOk(records ?? []);
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const accessToken = await getAdminAccessToken();
    const auth = getAuthHeaders(accessToken);
    const { body, imageEnFile, imageArFile } = await parseHeroSlideRequest(request);
    const uploadedImageEn = imageEnFile
      ? await saveUploadedImage(imageEnFile, 'hero-slides', accessToken)
      : null;
    const uploadedImageAr = imageArFile
      ? await saveUploadedImage(imageArFile, 'hero-slides', accessToken)
      : null;

    const result = await createHeroSlide(
      {
        eyebrow: optionalString(body.eyebrow),
        eyebrow_ar: optionalString(body.eyebrowAr),
        title: requireString(body.title, 'title'),
        title_ar: optionalString(body.titleAr),
        description: optionalString(body.description),
        description_ar: optionalString(body.descriptionAr),
        button_text: optionalString(body.buttonText),
        button_text_ar: optionalString(body.buttonTextAr),
        button_url: optionalString(body.buttonUrl),
        image_en_url: uploadedImageEn ?? optionalString(body.imageEnUrl),
        image_ar_url: uploadedImageAr ?? optionalString(body.imageArUrl),
        display_seconds:
          body.displaySeconds === undefined ? 6 : parseNumber(body.displaySeconds, 'displaySeconds'),
        sort_order: body.sortOrder === undefined ? 0 : parseNumber(body.sortOrder, 'sortOrder'),
        is_active: body.isActive === undefined ? true : parseBoolean(body.isActive),
      },
      auth
    );

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
