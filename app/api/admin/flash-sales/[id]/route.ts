import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { saveUploadedImage } from '@/lib/admin/uploads';
import { deleteFlashSale, updateFlashSale } from '@/lib/api/store-api';
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

function parseOptionalDateTime(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function validateDateRange(startsAt?: string | null, endsAt?: string | null) {
  if (!startsAt || !endsAt) {
    return;
  }

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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await params;
    const auth = getAuthHeaders(await getAdminAccessToken());
    const { body, imageFile } = await parseFlashSaleRequest(request);
    const payload: Record<string, unknown> = {};

    if (body.title !== undefined) payload.title = optionalString(body.title);
    if (body.description !== undefined) payload.description = optionalString(body.description);
    if (body.discountType !== undefined) payload.discount_type = optionalString(body.discountType);

    if (body.discountValue !== undefined) {
      payload.discount_value = parseOptionalNumber(body.discountValue);
    }

    if (body.startsAt !== undefined) {
      payload.starts_at = parseOptionalDateTime(body.startsAt);
    }

    if (body.endsAt !== undefined) {
      payload.ends_at = parseOptionalDateTime(body.endsAt);
    }

    validateDateRange(
      typeof payload.starts_at === 'string' ? payload.starts_at : undefined,
      typeof payload.ends_at === 'string' ? payload.ends_at : undefined
    );

    if (body.showAsModal !== undefined) payload.show_as_modal = parseBoolean(body.showAsModal);
    if (body.modalTitle !== undefined) payload.modal_title = optionalString(body.modalTitle);
    if (body.modalDescription !== undefined)
      payload.modal_description = optionalString(body.modalDescription);
    if (body.buttonText !== undefined) payload.button_text = optionalString(body.buttonText);
    if (body.buttonUrl !== undefined) payload.button_url = optionalString(body.buttonUrl);
    if (imageFile) {
      payload.image_url = await saveUploadedImage(imageFile, 'flash-sales');
    } else if (body.imageUrl !== undefined) {
      payload.image_url = optionalString(body.imageUrl);
    }

    if (body.sortOrder !== undefined) {
      payload.sort_order = parseOptionalNumber(body.sortOrder);
    }

    if (body.isActive !== undefined) payload.is_active = parseBoolean(body.isActive);

    const result = await updateFlashSale(id, payload, auth);

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
  const result = await deleteFlashSale(id, auth);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}
