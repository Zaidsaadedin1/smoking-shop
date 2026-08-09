import { deleteAddress, updateAddress } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString } from '@/lib/api/http';
import { getCustomerAuthHeaders, getCustomerSession } from '@/lib/customer/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return jsonError('Unauthorized', 401);
    }

    const authHeaders = await getCustomerAuthHeaders();
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (body.label !== undefined) payload.label = optionalString(body.label);
    if (body.fullName !== undefined) payload.full_name = optionalString(body.fullName);
    if (body.phone !== undefined) payload.phone = optionalString(body.phone);
    if (body.country !== undefined) payload.country = optionalString(body.country);
    if (body.city !== undefined) payload.city = optionalString(body.city);
    if (body.area !== undefined) payload.area = optionalString(body.area);
    if (body.street !== undefined) payload.street = optionalString(body.street);
    if (body.building !== undefined) payload.building = optionalString(body.building);
    if (body.floor !== undefined) payload.floor = optionalString(body.floor);
    if (body.apartment !== undefined) payload.apartment = optionalString(body.apartment);
    if (body.postalCode !== undefined) payload.postal_code = optionalString(body.postalCode);
    if (body.notes !== undefined) payload.notes = optionalString(body.notes);
    if (body.isDefault !== undefined) payload.is_default = body.isDefault;

    const result = await updateAddress(
      id,
      payload,
      authHeaders ? { headers: authHeaders } : undefined
    );

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCustomerSession();

  if (!session) {
    return jsonError('Unauthorized', 401);
  }

  const authHeaders = await getCustomerAuthHeaders();
  const { id } = await params;
  const result = await deleteAddress(id, authHeaders ? { headers: authHeaders } : undefined);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}
