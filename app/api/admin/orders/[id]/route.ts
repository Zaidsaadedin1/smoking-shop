import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import { deleteOrder, getOrderById, replaceOrderItems, updateOrder } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString } from '@/lib/api/http';
import { getSupabaseServiceRoleHeaders } from '@/lib/supabase/rest';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await params;
  const auth = getAuthHeaders(await getAdminAccessToken());
  const result = await getOrderById(id, auth);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const auth = getAuthHeaders(await getAdminAccessToken());
    const serviceRoleHeaders = getSupabaseServiceRoleHeaders();
    const itemAuth = serviceRoleHeaders ? { headers: serviceRoleHeaders } : auth;
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (body.orderNumber !== undefined) payload.order_number = optionalString(body.orderNumber);
    if (body.status !== undefined) payload.status = optionalString(body.status);
    if (body.paymentStatus !== undefined)
      payload.payment_status = optionalString(body.paymentStatus);
    if (body.paymentMethod !== undefined)
      payload.payment_method = optionalString(body.paymentMethod);
    if (body.customerName !== undefined) payload.customer_name = optionalString(body.customerName);
    if (body.customerEmail !== undefined)
      payload.customer_email = optionalString(body.customerEmail);
    if (body.customerPhone !== undefined)
      payload.customer_phone = optionalString(body.customerPhone);
    if (body.currency !== undefined) payload.currency = optionalString(body.currency);
    if (body.couponCode !== undefined) payload.coupon_code = optionalString(body.couponCode);
    if (body.notes !== undefined) payload.notes = optionalString(body.notes);
    if (body.trackingNumber !== undefined)
      payload.tracking_number = optionalString(body.trackingNumber);
    if (body.shippingCarrier !== undefined)
      payload.shipping_carrier = optionalString(body.shippingCarrier);

    if (typeof body.subtotal === 'number') payload.subtotal = body.subtotal;
    if (typeof body.discountAmount === 'number') payload.discount_amount = body.discountAmount;
    if (typeof body.shippingAmount === 'number') payload.shipping_amount = body.shippingAmount;
    if (typeof body.taxAmount === 'number') payload.tax_amount = body.taxAmount;
    if (typeof body.totalAmount === 'number') payload.total_amount = body.totalAmount;

    const result = await updateOrder(id, payload, auth);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    if (Array.isArray(body.items)) {
      const items = body.items
        .filter(
          (item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object'
        )
        .map((item) => ({
          productId: optionalString(item.productId),
          variantId: optionalString(item.variantId),
          productName: optionalString(item.productName) ?? 'Product',
          sku: optionalString(item.sku),
          sizeName: optionalString(item.sizeName),
          colorName: optionalString(item.colorName),
          imageUrl: optionalString(item.imageUrl),
          options:
            item.options && typeof item.options === 'object'
              ? (item.options as Record<string, unknown>)
              : {},
          unitPrice: Number(item.unitPrice) || 0,
          quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
          lineTotal: Number(item.lineTotal) || 0,
        }));
      const itemsResult = await replaceOrderItems(id, items, itemAuth);

      if (itemsResult.error) {
        return jsonError(itemsResult.error, itemsResult.status);
      }
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
  const result = await deleteOrder(id, auth);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}
