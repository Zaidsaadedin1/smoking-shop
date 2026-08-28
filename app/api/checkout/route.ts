import {
  createOrder,
  listActiveDeliveryZones,
  listActiveFlashSales,
  updateProfile,
} from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireNumber, requireString } from '@/lib/api/http';
import { calculateDiscountAmount as calculateFlashSaleDiscount } from '@/lib/commerce-utils';
import { calculateCouponDiscount, getCouponByCode } from '@/lib/coupon-utils';
import { getCustomerAuthHeaders, getCustomerSession } from '@/lib/customer/auth';
import { resolveDeliveryFee } from '@/lib/delivery-zones';

export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return jsonError('Unauthorized', 401);
    }

    const authHeaders = await getCustomerAuthHeaders();
    const body = (await request.json()) as Record<string, unknown>;
    const items = Array.isArray(body.items) ? body.items : null;
    const subtotal = requireNumber(body.subtotal, 'subtotal');
    const requestedShippingAmount = typeof body.shippingAmount === 'number' ? body.shippingAmount : 0;
    const taxAmount = typeof body.taxAmount === 'number' ? body.taxAmount : 0;
    const couponCode = optionalString(body.couponCode);
    const customerPhone = requireString(body.customerPhone, 'customerPhone');
    const shippingAddress = (body.shippingAddress as Record<string, unknown>) ?? {};
    const shippingCountry = requireString(shippingAddress.country, 'shippingAddress.country');
    const shippingCity = optionalString(shippingAddress.city) ?? '';

    if (!items || items.length === 0) {
      return jsonError('items must be a non-empty array');
    }

    const [activeFlashSaleRows, deliveryZones] = await Promise.all([
      listActiveFlashSales(new Date().toISOString()),
      listActiveDeliveryZones(),
    ]);
    const activeFlashSale = activeFlashSaleRows?.[0] ?? null;
    const shippingAmount = resolveDeliveryFee(
      (deliveryZones ?? []).map((zone) => ({
        id: zone.id,
        country: zone.country,
        countryAr: zone.country_ar ?? '',
        city: zone.city ?? '',
        cityAr: zone.city_ar ?? '',
        fee: Number(zone.fee),
        sortOrder: Number(zone.sort_order ?? 0),
        isActive: zone.is_active ?? true,
      })),
      shippingCountry,
      shippingCity
    );

    if (shippingAmount === null) {
      return jsonError('No delivery fee is configured for the selected location.', 400);
    }

    if (Math.abs(requestedShippingAmount - shippingAmount) > 0.01) {
      return jsonError('Checkout delivery fees changed. Please review your order and try again.', 409);
    }
    const flashSaleDiscount = activeFlashSale
      ? calculateFlashSaleDiscount(
          subtotal,
          activeFlashSale.discount_type === 'fixed' ? 'fixed' : 'percentage',
          Number(activeFlashSale.discount_value ?? 0)
        )
      : 0;
    const coupon = couponCode ? await getCouponByCode(couponCode) : null;

    if (couponCode && !coupon) {
      return jsonError('Coupon code is invalid or inactive.', 400);
    }

    const couponDiscount = coupon ? calculateCouponDiscount(subtotal, buildCouponForOrder(coupon)) : 0;
    const discountAmount = Math.min(
      subtotal,
      flashSaleDiscount + Math.min(Math.max(0, subtotal - flashSaleDiscount), couponDiscount)
    );
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount + taxAmount);
    const requestedTotal = requireNumber(body.totalAmount, 'totalAmount');

    if (Math.abs(requestedTotal - totalAmount) > 0.01) {
      return jsonError('Checkout totals are out of date. Please review your order and try again.', 409);
    }

    const result = await createOrder({
      userId: session.id,
      paymentMethod: requireString(body.paymentMethod, 'paymentMethod'),
      customerName: optionalString(body.customerName) ?? session.fullName,
      customerEmail: optionalString(body.customerEmail) ?? session.email,
      customerPhone,
      shippingAddress,
      billingAddress: (body.billingAddress as Record<string, unknown>) ?? null,
      subtotal,
      discountAmount,
      shippingAmount,
      taxAmount,
      totalAmount,
      currency: optionalString(body.currency) ?? 'JOD',
      couponCode: coupon?.code ?? null,
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
    }, authHeaders ? { headers: authHeaders } : undefined);

    if (result.error) {
      console.error('[Checkout] createOrder error:', result.error);
      return jsonError(result.error, result.status);
    }

    try {
      await updateProfile(
        session.id,
        { phone: customerPhone },
        authHeaders ? { headers: authHeaders } : undefined
      );
    } catch {
      // The completed order remains valid even if the optional profile sync fails.
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}

function buildCouponForOrder(coupon: {
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSubtotal?: number;
}) {
  return {
    code: coupon.code,
    name: coupon.name,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minSubtotal: coupon.minSubtotal,
  };
}
