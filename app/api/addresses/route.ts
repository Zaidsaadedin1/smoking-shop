import { createAddress, listAddresses } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireString } from '@/lib/api/http';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return jsonError('userId is required');
  }

  const addresses = await listAddresses(userId);
  return jsonOk(addresses ?? []);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const result = await createAddress({
      user_id: requireString(body.userId, 'userId'),
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
    });

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
