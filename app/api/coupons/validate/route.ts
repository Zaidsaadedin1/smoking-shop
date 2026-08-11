import { buildAppliedCoupon, getCouponByCode } from '@/lib/coupon-utils';
import { jsonError, jsonOk, requireNumber, requireString } from '@/lib/api/http';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const code = requireString(body.code, 'code');
    const subtotal = requireNumber(body.subtotal, 'subtotal');
    const coupon = await getCouponByCode(code);

    if (!coupon) {
      return jsonError('Coupon code is invalid or inactive.', 404);
    }

    const appliedCoupon = buildAppliedCoupon(coupon, subtotal);

    if (!appliedCoupon) {
      return jsonError(
        `This coupon requires a minimum subtotal of ${coupon.minSubtotal ?? 0} JOD.`,
        400
      );
    }

    return jsonOk(appliedCoupon);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
