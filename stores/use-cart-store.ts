'use client';

import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import { fallbackProducts } from '@/lib/commerce-data';
import { AppliedCoupon, StoreProduct } from '@/lib/commerce-types';
import { getPrimaryVariant } from '@/lib/commerce-utils';

export type CartLine = {
  productId: string;
  variantId: string;
  quantity: number;
  product?: StoreProduct;
};

export type CartProductLine = {
  product: StoreProduct;
  variant: StoreProduct['variants'][number];
  quantity: number;
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

  if (!variant || variant.allowBackorder) {
    return Math.max(1, quantity);
  }

  return Math.max(1, Math.min(quantity, Math.max(1, variant.stockQuantity)));
}

type CartState = {
  items: CartLine[];
  favorites: string[];
  appliedCoupon: AppliedCoupon | null;
  addItem: (product: StoreProduct, variantId: string, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  toggleFavorite: (productId: string) => void;
  setAppliedCoupon: (coupon: AppliedCoupon) => void;
  clearAppliedCoupon: () => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      favorites: [],
      appliedCoupon: null,
      addItem: (product, variantId, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.variantId === variantId);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.variantId === variantId
                  ? {
                      ...item,
                      quantity: clampVariantQuantity(
                        product,
                        item.variantId,
                        item.quantity + quantity
                      ),
                      product,
                    }
                  : item
              ),
            };
          }

          const variant =
            product.variants.find((item) => item.id === variantId) ?? getPrimaryVariant(product);

          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                variantId: variant?.id ?? variantId,
                quantity: clampVariantQuantity(product, variant?.id ?? variantId, quantity),
                product,
              },
            ],
          };
        }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId
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

      return { product, variant, quantity: line.quantity };
    })
    .filter((line): line is CartProductLine => Boolean(line));
}
