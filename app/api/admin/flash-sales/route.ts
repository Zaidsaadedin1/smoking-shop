import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { saveUploadedImage } from '@/lib/admin/uploads';
import { createFlashSale, listFlashSales } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireNumber, requireString } from '@/lib/api/http';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

function parseBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

function parseNumber(value: unknown, field: string) {
  const parsed = Number(value);
  return requireNumber(parsed, field);
}

function parseDateTime(value: unknown, field: string) {
  const raw = requireString(value, field);
  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${field} must be a valid datetime`);
  }

  return parsed.toISOString();
}

function validateDateRange(startsAt: string, endsAt: string) {
  if (new Date(endsAt).getTime() < new Date(startsAt).getTime()) {
    throw new Error('endsAt must be after startsAt');
  }
}

async function parseFlashSaleRequest(request: Request) {
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
  const records = await listFlashSales(auth);
  return jsonOk(records ?? []);
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const auth = getAuthHeaders(await getAdminAccessToken());
    const { body, imageFile } = await parseFlashSaleRequest(request);
    const startsAt = parseDateTime(body.startsAt, 'startsAt');
    const endsAt = parseDateTime(body.endsAt, 'endsAt');
    validateDateRange(startsAt, endsAt);
    const uploadedImage = imageFile ? await saveUploadedImage(imageFile, 'flash-sales') : null;
    const result = await createFlashSale(
      {
        title: requireString(body.title, 'title'),
        description: optionalString(body.description),
        discount_type: requireString(body.discountType, 'discountType'),
        discount_value: parseNumber(body.discountValue, 'discountValue'),
        starts_at: startsAt,
        ends_at: endsAt,
        show_as_modal: parseBoolean(body.showAsModal),
        modal_title: optionalString(body.modalTitle),
        modal_description: optionalString(body.modalDescription),
        button_text: optionalString(body.buttonText),
        button_url: optionalString(body.buttonUrl),
        image_url: uploadedImage ?? optionalString(body.imageUrl),
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
