import { createAddress, listAddresses } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireString } from '@/lib/api/http';
import { getCustomerAuthHeaders, getCustomerSession } from '@/lib/customer/auth';

export async function GET() {
  const session = await getCustomerSession();

  if (!session) {
    return jsonError('Unauthorized', 401);
  }

  const authHeaders = await getCustomerAuthHeaders();
  const addresses = await listAddresses(session.id, authHeaders ? { headers: authHeaders } : undefined);
  return jsonOk(addresses ?? []);
}

export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return jsonError('Unauthorized', 401);
    }

    const authHeaders = await getCustomerAuthHeaders();
    const body = (await request.json()) as Record<string, unknown>;

    const result = await createAddress({
      user_id: session.id,
      label: optionalString(body.label),
      full_name: requireString(body.fullName, 'fullName'),
      phone: requireString(body.phone, 'phone'),
      country: optionalString(body.country) ?? 'Jordan',
      city: requireString(body.city, 'city'),
      area: optionalString(body.area),
      street: optionalString(body.street),
      building: optionalString(body.building),
      floor: optionalString(body.floor),
      apartment: optionalString(body.apartment),
      postal_code: optionalString(body.postalCode),
      notes: optionalString(body.notes),
      is_default: body.isDefault ?? false,
    }, authHeaders ? { headers: authHeaders } : undefined);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
