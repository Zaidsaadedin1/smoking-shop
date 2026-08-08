'use client';

import { create } from 'zustand';

type Toast = {
  id: string;
  title: string;
  description?: string;
};

type UiState = {
  isCartOpen: boolean;
  searchOpen: boolean;
  toasts: Toast[];
  openCart: () => void;
  closeCart: () => void;
  setSearchOpen: (open: boolean) => void;
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isCartOpen: false,
  searchOpen: false,
  toasts: [],
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), ...toast }],
    })),
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
