import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { createAdminOrder, listOrders } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireNumber, requireString } from '@/lib/api/http';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

export async function GET() {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const auth = getAuthHeaders(await getAdminAccessToken());
  const orders = await listOrders(undefined, auth);
  return jsonOk(orders ?? []);
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const auth = getAuthHeaders(await getAdminAccessToken());
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createAdminOrder({
      order_number: requireString(body.orderNumber, 'orderNumber'),
      user_id: optionalString(body.userId),
      status: optionalString(body.status) ?? 'pending',
      payment_status: optionalString(body.paymentStatus) ?? 'pending',
      payment_method: optionalString(body.paymentMethod) ?? 'cash_on_delivery',
      customer_name: requireString(body.customerName, 'customerName'),
      customer_email: optionalString(body.customerEmail),
      customer_phone: requireString(body.customerPhone, 'customerPhone'),
      shipping_address: {},
      billing_address: null,
      subtotal: requireNumber(body.subtotal, 'subtotal'),
      discount_amount: typeof body.discountAmount === 'number' ? body.discountAmount : 0,
      shipping_amount: typeof body.shippingAmount === 'number' ? body.shippingAmount : 0,
      tax_amount: typeof body.taxAmount === 'number' ? body.taxAmount : 0,
      total_amount: requireNumber(body.totalAmount, 'totalAmount'),
      currency: optionalString(body.currency) ?? 'JOD',
      notes: optionalString(body.notes),
      tracking_number: optionalString(body.trackingNumber),
      shipping_carrier: optionalString(body.shippingCarrier),
    }, auth);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
