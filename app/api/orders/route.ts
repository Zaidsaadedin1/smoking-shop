import { createOrder, listOrders } from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireNumber, requireString } from '@/lib/api/http';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const orders = await listOrders(userId);
  return jsonOk(orders ?? []);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const items = Array.isArray(body.items) ? body.items : null;

    if (!items || items.length === 0) {
      return jsonError('items must be a non-empty array');
    }

    const result = await createOrder({
      userId: optionalString(body.userId),
      paymentMethod: requireString(body.paymentMethod, 'paymentMethod'),
      customerName: requireString(body.customerName, 'customerName'),
      customerEmail: optionalString(body.customerEmail),
      customerPhone: requireString(body.customerPhone, 'customerPhone'),
      shippingAddress: (body.shippingAddress as Record<string, unknown>) ?? {},
      billingAddress: (body.billingAddress as Record<string, unknown>) ?? null,
      subtotal: requireNumber(body.subtotal, 'subtotal'),
      discountAmount: typeof body.discountAmount === 'number' ? body.discountAmount : 0,
      shippingAmount: typeof body.shippingAmount === 'number' ? body.shippingAmount : 0,
      taxAmount: typeof body.taxAmount === 'number' ? body.taxAmount : 0,
      totalAmount: requireNumber(body.totalAmount, 'totalAmount'),
      currency: optionalString(body.currency) ?? 'JOD',
      couponCode: optionalString(body.couponCode),
      notes: optionalString(body.notes),
      items: items.map((item) => {
        const row = item as Record<string, unknown>;

        return {
          productId: optionalString(row.productId),
          variantId: optionalString(row.variantId),
          productName: requireString(row.productName, 'items[].productName'),
          sku: optionalString(row.sku),
          sizeName: optionalString(row.sizeName),
          colorName: optionalString(row.colorName),
          imageUrl: optionalString(row.imageUrl),
          unitPrice: requireNumber(row.unitPrice, 'items[].unitPrice'),
          quantity: requireNumber(row.quantity, 'items[].quantity'),
          lineTotal: requireNumber(row.lineTotal, 'items[].lineTotal'),
        };
      }),
    });

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
