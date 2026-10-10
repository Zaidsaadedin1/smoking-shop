'use client';

import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import { fallbackProducts } from '@/lib/commerce-data';
import { AppliedCoupon, StoreProduct } from '@/lib/commerce-types';
import { getPrimaryVariant, getVariantOrderLimit } from '@/lib/commerce-utils';

export type CartLineSelection = {
  groupId: string;
  groupName: string;
  groupNameAr?: string;
  selectionType: 'radio' | 'checkbox';
  items: Array<{
    id: string;
    name: string;
    nameAr?: string;
    priceDelta: number;
  }>;
};

export type CartLine = {
  lineId?: string;
  productId: string;
  variantId: string;
  quantity: number;
  selections?: CartLineSelection[];
  product?: StoreProduct;
};

export type CartProductLine = {
  lineId: string;
  product: StoreProduct;
  variant: StoreProduct['variants'][number];
  quantity: number;
  selections: CartLineSelection[];
};

function clampVariantQuantity(
  product: StoreProduct | undefined,
  variantId: string,
  quantity: number
) {
  if (!product) {
    return Math.max(1, quantity);
  }

  const variant =
    product.variants.find((item) => item.id === variantId) ?? getPrimaryVariant(product);

  if (!variant) {
    return Math.max(1, quantity);
  }

  const orderLimit = getVariantOrderLimit(product, variant);
  return orderLimit > 0 ? Math.max(1, Math.min(quantity, orderLimit)) : 1;
}

type CartState = {
  items: CartLine[];
  favorites: string[];
  appliedCoupon: AppliedCoupon | null;
  addItem: (
    product: StoreProduct,
    variantId: string,
    quantity?: number,
    configurationKey?: string,
    selections?: CartLineSelection[]
  ) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  toggleFavorite: (productId: string) => void;
  setAppliedCoupon: (coupon: AppliedCoupon) => void;
  clearAppliedCoupon: () => void;
  clearCart: () => void;
};

function getLineId(line: CartLine) {
  return line.lineId ?? line.variantId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      favorites: [],
      appliedCoupon: null,
      addItem: (product, variantId, quantity = 1, configurationKey, selections = []) =>
        set((state) => {
          const variant =
            product.variants.find((item) => item.id === variantId) ?? getPrimaryVariant(product);
          const resolvedVariantId = variant?.id ?? variantId;
          const lineId = configurationKey ?? resolvedVariantId;
          const existing = state.items.find((item) => getLineId(item) === lineId);

          if (existing) {
            return {
              items: state.items.map((item) =>
                getLineId(item) === lineId
                  ? {
                      ...item,
                      lineId,
                      quantity: clampVariantQuantity(
                        product,
                        item.variantId,
                        item.quantity + quantity
                      ),
                      selections,
                      product,
                    }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                lineId,
                productId: product.id,
                variantId: resolvedVariantId,
                quantity: clampVariantQuantity(product, resolvedVariantId, quantity),
                selections,
                product,
              },
            ],
          };
        }),
      removeItem: (lineId) =>
        set((state) => ({
          items: state.items.filter((item) => getLineId(item) !== lineId),
        })),
      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            getLineId(item) === lineId
              ? {
                  ...item,
                  quantity: clampVariantQuantity(item.product, item.variantId, quantity),
                }
              : item
          ),
        })),
      toggleFavorite: (productId) =>
        set((state) => ({
          favorites: state.favorites.includes(productId)
            ? state.favorites.filter((item) => item !== productId)
            : [...state.favorites, productId],
        })),
      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
      clearAppliedCoupon: () => set({ appliedCoupon: null }),
      clearCart: () => set({ items: [], appliedCoupon: null }),
    }),
    {
      name: 'tourmaline-coven-store',
    }
  )
);

export function getCartProducts(items: CartLine[]): CartProductLine[] {
  return items
    .map((line) => {
      const product = line.product ?? fallbackProducts.find((item) => item.id === line.productId);
      const variant = product?.variants.find((item) => item.id === line.variantId);

      if (!product || !variant) {
        return null;
      }

      return {
        lineId: getLineId(line),
        product,
        variant,
        quantity: clampVariantQuantity(product, variant.id, line.quantity),
        selections: line.selections ?? [],
      };
    })
    .filter((line): line is CartProductLine => Boolean(line));
}
