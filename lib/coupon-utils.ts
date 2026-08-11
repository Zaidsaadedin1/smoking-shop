import { listActiveCoupons } from '@/lib/api/store-api';
import { storeCoupons } from '@/lib/commerce-data';
import { AppliedCoupon, CouponDefinition } from '@/lib/commerce-types';

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

export function calculateDiscountAmount(
  subtotal: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
) {
  const rawDiscount =
    discountType === 'percentage' ? (subtotal * discountValue) / 100 : discountValue;

  return Math.min(subtotal, Number(rawDiscount.toFixed(2)));
}

export function calculateCouponDiscount(subtotal: number, coupon: AppliedCoupon) {
  if (subtotal <= 0) {
    return 0;
  }

  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return 0;
  }

  return calculateDiscountAmount(subtotal, coupon.discountType, coupon.discountValue);
}

function isCouponCurrentlyActive(coupon: {
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}, nowIso: string) {
  if (coupon.isActive === false) {
    return false;
  }

  if (coupon.startsAt && coupon.startsAt > nowIso) {
    return false;
  }

  if (coupon.endsAt && coupon.endsAt < nowIso) {
    return false;
  }

  return true;
}

function mapCouponDefinition(coupon: {
  code: string;
  name: string;
  description?: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSubtotal?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}): CouponDefinition {
  return {
    code: normalizeCouponCode(coupon.code),
    name: coupon.name,
    description: coupon.description ?? undefined,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minSubtotal: coupon.minSubtotal ?? undefined,
    startsAt: coupon.startsAt ?? undefined,
    endsAt: coupon.endsAt ?? undefined,
    isActive: coupon.isActive,
  };
}

export async function getCouponByCode(code: string, nowIso = new Date().toISOString()) {
  const normalizedCode = normalizeCouponCode(code);
  const coupons = await listActiveCoupons();

  if (coupons && coupons.length > 0) {
    const matchedCoupon = coupons.find((coupon) => normalizeCouponCode(coupon.code) === normalizedCode);

    if (matchedCoupon) {
      return mapCouponDefinition({
        code: matchedCoupon.code,
        name: matchedCoupon.name,
        description: matchedCoupon.description ?? undefined,
        discountType: matchedCoupon.discount_type === 'fixed' ? 'fixed' : 'percentage',
        discountValue: Number(matchedCoupon.discount_value ?? 0),
        minSubtotal:
          matchedCoupon.min_subtotal === null ? undefined : Number(matchedCoupon.min_subtotal),
        startsAt: matchedCoupon.starts_at,
        endsAt: matchedCoupon.ends_at,
        isActive: matchedCoupon.is_active ?? true,
      });
    }
  }

  const fallbackCoupon =
    storeCoupons.find((coupon) => {
      if (normalizeCouponCode(coupon.code) !== normalizedCode) {
        return false;
      }

      return isCouponCurrentlyActive(coupon, nowIso);
    }) ?? null;

  return fallbackCoupon ? mapCouponDefinition(fallbackCoupon) : null;
}

export function buildAppliedCoupon(
  coupon: CouponDefinition,
  subtotal: number
): AppliedCoupon | null {
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return null;
  }

  return {
    code: normalizeCouponCode(coupon.code),
    name: coupon.name,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minSubtotal: coupon.minSubtotal,
  };
}
