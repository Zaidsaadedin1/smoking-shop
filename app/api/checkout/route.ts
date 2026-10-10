import {
  createOrder,
  getProductById,
  listActiveDeliveryZones,
  listActiveFlashSales,
  listProductOptionGroups,
  listProductOptionGroupLinks,
  listProductOptionItemLinks,
  listProductOptionItems,
  updateProfile,
} from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireNumber, requireString } from '@/lib/api/http';
import { calculateDiscountAmount as calculateFlashSaleDiscount } from '@/lib/commerce-utils';
import { calculateCouponDiscount, getCouponByCode } from '@/lib/coupon-utils';
import { getCustomerAuthHeaders, getCustomerSession } from '@/lib/customer/auth';
import { resolveDeliveryZone } from '@/lib/delivery-zones';
import { getSupabaseServiceRoleHeaders } from '@/lib/supabase/rest';

export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();
    const authHeaders = session
      ? await getCustomerAuthHeaders()
      : getSupabaseServiceRoleHeaders();

    if (!session && !authHeaders) {
      return jsonError('Guest checkout is temporarily unavailable.', 503);
    }

    const body = (await request.json()) as Record<string, unknown>;
    const items = Array.isArray(body.items) ? body.items : null;
    const requestedSubtotal = requireNumber(body.subtotal, 'subtotal');
    const requestedShippingAmount = requireNumber(body.shippingAmount, 'shippingAmount');
    const requestedTotal = requireNumber(body.totalAmount, 'totalAmount');
    const couponCode = optionalString(body.couponCode);
    const customerPhone = requireString(body.customerPhone, 'customerPhone');
    const customerName = optionalString(body.customerName) ?? session?.fullName ?? null;

    if (!customerName) {
      return jsonError('Customer name is required.', 400);
    }

    const requestedAddress =
      body.shippingAddress && typeof body.shippingAddress === 'object'
        ? (body.shippingAddress as Record<string, unknown>)
        : {};
    const shippingCountry = requireString(requestedAddress.country, 'shippingAddress.country');
    const shippingCity = requireString(requestedAddress.city, 'shippingAddress.city');
    const shippingAddress = {
      country: shippingCountry,
      city: shippingCity,
      area: requireString(requestedAddress.area, 'shippingAddress.area'),
      street: requireString(requestedAddress.street, 'shippingAddress.street'),
      building: optionalString(requestedAddress.building) ?? '',
    };
    const paymentMethod = requireString(body.paymentMethod, 'paymentMethod');

    if (paymentMethod !== 'cash_on_delivery') {
      return jsonError('The selected payment method is not available.', 400);
    }

    if (!items || items.length === 0) {
      return jsonError('items must be a non-empty array');
    }

    const validatedItems = items.map((item) => {
      const row = item as Record<string, unknown>;
      return {
        productId: requireString(row.productId, 'items[].productId'),
        variantId: requireString(row.variantId, 'items[].variantId'),
        quantity: requireNumber(row.quantity, 'items[].quantity'),
        clientUnitPrice: requireNumber(row.unitPrice, 'items[].unitPrice'),
        sizeName: optionalString(row.sizeName),
        options: parseOptionSelections(row.options),
      };
    });

    const [products, optionGroups, optionItems, productGroupLinks, productItemLinks] =
      await Promise.all([
        Promise.all(validatedItems.map((item) => getProductById(item.productId))),
        listProductOptionGroups(),
        listProductOptionItems(),
        listProductOptionGroupLinks(),
        listProductOptionItemLinks(),
      ]);

    if (!optionGroups || !optionItems || !productGroupLinks || !productItemLinks) {
      return jsonError('Checkout is temporarily unavailable. Please try again shortly.', 503);
    }

    const orderItems: Array<{
      productId: string;
      variantId: string | null;
      productName: string;
      sku: string;
      sizeName: string | null;
      imageUrl: string | null;
      options: Record<string, unknown>;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }> = [];
    let subtotal = 0;

    for (const [index, item] of validatedItems.entries()) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return jsonError('Item quantities must be positive whole numbers.', 400);
      }
      const product = products[index]?.data;
      if (!product || product.status !== 'active') {
        return jsonError('One or more products are no longer available.', 409);
      }
      const maxOrderQuantity = Number(product.max_order_quantity ?? 99);
      if (item.quantity > maxOrderQuantity) {
        return jsonError(`You can order at most ${maxOrderQuantity} of this product.`, 400);
      }
      const variant = product.variants.find((entry) => entry.id === item.variantId);
      const fallbackVariant =
        product.variants.length === 0 && item.variantId === `${product.id}-base`;

      if (!variant && !fallbackVariant) {
        return jsonError('One or more selected product options are no longer available.', 409);
      }

      if (variant && variant.is_active === false) {
        return jsonError('One or more selected product options are no longer available.', 409);
      }

      if (
        variant &&
        variant.track_inventory !== false &&
        Number(variant.stock_quantity ?? 0) > 0 &&
        item.quantity > Number(variant.stock_quantity)
      ) {
        return jsonError('One or more products do not have enough stock.', 409);
      }
      if (
        variant &&
        variant.track_inventory !== false &&
        Number(variant.stock_quantity ?? 0) <= 0 &&
        !variant.allow_backorder
      ) {
        return jsonError('One or more products do not have enough stock.', 409);
      }

      const basePrice = fallbackVariant
        ? Number(product.base_price ?? 0)
        : Number(variant?.price ?? 0);
      const linkedGroups = (productGroupLinks ?? []).filter(
        (link) =>
          link.product_id === product.id &&
          optionGroups.some((group) => group.id === link.option_group_id && group.is_active)
      );
      const requestedGroupIds = new Set(item.options.map((selection) => selection.groupId));
      const validGroupIds = new Set(linkedGroups.map((link) => link.option_group_id));

      if ([...requestedGroupIds].some((groupId) => !validGroupIds.has(groupId))) {
        return jsonError('One or more selected add-ons are no longer available.', 409);
      }

      let optionsTotal = 0;
      const optionSnapshot: Array<Record<string, unknown>> = [];

      for (const link of linkedGroups) {
        const group = optionGroups.find((entry) => entry.id === link.option_group_id);
        if (!group) continue;

        const selection = item.options.find((entry) => entry.groupId === link.option_group_id);
        const selectedIds = selection?.itemIds ?? [];
        const minimumSelections = link.min_selections ?? (link.is_required ? 1 : 0);
        const maximumSelections = link.max_selections ?? (link.selection_type === 'radio' ? 1 : Infinity);

        if (
          selectedIds.length < minimumSelections ||
          selectedIds.length > maximumSelections ||
          (link.selection_type === 'radio' && selectedIds.length > 1)
        ) {
          return jsonError(`Please review the ${group.name} selection.`, 400);
        }

        const linkedItemIds = new Set(
          productItemLinks
            .filter(
              (entry) =>
                entry.product_id === product.id &&
                entry.option_group_id === link.option_group_id
            )
            .map((entry) => entry.option_item_id)
        );
        const selectedItems = selectedIds.map((id) =>
          optionItems.find(
            (entry) =>
              entry.id === id &&
              entry.group_id === link.option_group_id &&
              entry.is_active &&
              linkedItemIds.has(entry.id)
          )
        );

        if (selectedItems.some((entry) => !entry)) {
          return jsonError('One or more selected add-ons are no longer available.', 409);
        }

        const resolvedItems = selectedItems.filter(
          (entry): entry is NonNullable<typeof entry> => Boolean(entry)
        );

        for (const option of resolvedItems) {
          const stock = Number(option.stock_quantity ?? 0);
          if (option.track_inventory && stock <= 0 && !option.allow_backorder) {
            return jsonError('One or more selected add-ons are out of stock.', 409);
          }
          if (option.track_inventory && stock > 0 && item.quantity > stock) {
            return jsonError('One or more selected add-ons do not have enough stock.', 409);
          }
          optionsTotal += Number(option.price_delta ?? 0);
        }

        if (resolvedItems.length) {
          optionSnapshot.push({
            groupId: group.id,
            groupName: group.name,
            groupNameAr: group.name_ar ?? null,
            items: resolvedItems.map((option) => ({
              id: option.id,
              name: option.name,
              nameAr: option.name_ar ?? null,
              priceDelta: Number(option.price_delta ?? 0),
            })),
          });
        }
      }

      const unitPrice = Number((basePrice + optionsTotal).toFixed(2));
      if (Math.abs(unitPrice - item.clientUnitPrice) > 0.01) {
        return jsonError('A product price changed. Please review your cart and try again.', 409);
      }

      const lineTotal = Number((unitPrice * item.quantity).toFixed(2));
      subtotal += lineTotal;
      orderItems.push({
        productId: product.id,
        // Products without a variant row use a synthetic `${productId}-base`
        // ID in the cart; the order_items.variant_id column only accepts UUIDs.
        variantId: variant?.id ?? null,
        productName: product.name,
        sku: variant?.sku ?? `${product.slug}-base`,
        sizeName: item.sizeName,
        imageUrl:
          product.images.find((image) => image.is_primary)?.image_url ??
          product.images[0]?.image_url ??
          null,
        options: { groups: optionSnapshot },
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      });
    }

    subtotal = Number(subtotal.toFixed(2));
    if (Math.abs(requestedSubtotal - subtotal) > 0.01) {
      return jsonError('Your cart total changed. Please review your cart and try again.', 409);
    }

    const [activeFlashSaleRows, deliveryZones] = await Promise.all([
      listActiveFlashSales(new Date().toISOString()),
      listActiveDeliveryZones(),
    ]);
    const activeFlashSale = activeFlashSaleRows?.[0] ?? null;
    const deliveryZone = resolveDeliveryZone(
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

    if (!deliveryZone) {
      return jsonError('No delivery fee is configured for the selected location.', 400);
    }

    const shippingAmount = deliveryZone.fee;
    if (Math.abs(requestedShippingAmount - shippingAmount) > 0.01) {
      return jsonError(
        'Checkout delivery fees changed. Please review your order and try again.',
        409,
        { deliveryZone }
      );
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

    const couponDiscount = coupon
      ? calculateCouponDiscount(subtotal, buildCouponForOrder(coupon))
      : 0;
    const discountAmount = Math.min(
      subtotal,
      flashSaleDiscount + Math.min(Math.max(0, subtotal - flashSaleDiscount), couponDiscount)
    );
    const taxAmount = 0;
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount + taxAmount);

    if (Math.abs(requestedTotal - totalAmount) > 0.01) {
      return jsonError(
        'Checkout totals are out of date. Please review your order and try again.',
        409
      );
    }

    const result = await createOrder(
      {
        userId: session?.id ?? null,
        paymentMethod,
        customerName,
        customerEmail: optionalString(body.customerEmail) ?? session?.email ?? null,
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
        items: orderItems,
      },
      authHeaders ? { headers: authHeaders } : undefined
    );

    if (result.error) {
      console.error('[Checkout] createOrder error:', result.error);
      return jsonError(result.error, result.status);
    }

    if (session) {
      try {
        await updateProfile(
          session.id,
          { phone: customerPhone },
          authHeaders ? { headers: authHeaders } : undefined
        );
      } catch {
        // The completed order remains valid even if the optional profile sync fails.
      }
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}

function parseOptionSelections(value: unknown) {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('Invalid product add-on selection.');
  }

  const selections: Array<{ groupId: string; itemIds: string[] }> = [];
  const seenGroups = new Set<string>();

  for (const selection of value) {
    if (!selection || typeof selection !== 'object') {
      throw new Error('Invalid product add-on selection.');
    }

    const row = selection as Record<string, unknown>;
    const groupId = requireString(row.groupId, 'options[].groupId');

    if (!Array.isArray(row.itemIds) || seenGroups.has(groupId)) {
      throw new Error('Invalid product add-on selection.');
    }

    const itemIds = row.itemIds.map((id) => requireString(id, 'options[].itemIds[]'));
    if (new Set(itemIds).size !== itemIds.length) {
      throw new Error('Invalid product add-on selection.');
    }

    seenGroups.add(groupId);
    selections.push({ groupId, itemIds });
  }

  return selections;
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
