import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '../data/translations';

export interface CartItem {
  productId: string;
  colorId: string;
  colorName: string;
  quantity: number;
}

export interface ToastItem {
  id: string;
  message: string;
}

interface AppState {
  lang: Language;
  theme: 'light' | 'dark';
  cart: CartItem[];
  isCartOpen: boolean;
  heroColorHex: string;
  toasts: ToastItem[];
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setCartOpen: (open: boolean) => void;
  setHeroColorHex: (hex: string) => void;
  addToCart: (item: CartItem) => void;
  updateQty: (productId: string, colorId: string, quantity: number) => void;
  removeFromCart: (productId: string, colorId: string) => void;
  clearCart: () => void;
  pushToast: (message: string) => void;
  dismissToast: (id: string) => void;
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      lang: 'ar',
      theme: getInitialTheme(),
      cart: [],
      isCartOpen: false,
      heroColorHex: '#2acbd2',
      toasts: [],

      setLang: (lang) => set({ lang }),
      toggleLang: () => set({ lang: get().lang === 'ar' ? 'en' : 'ar' }),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),

      setCartOpen: (isCartOpen) => set({ isCartOpen }),
      setHeroColorHex: (heroColorHex) => set({ heroColorHex }),

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find(
            (c) => c.productId === item.productId && c.colorId === item.colorId
          );
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.productId === item.productId && c.colorId === item.colorId
                  ? { ...c, quantity: c.quantity + item.quantity }
                  : c
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),

      updateQty: (productId, colorId, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter(
                  (c) => !(c.productId === productId && c.colorId === colorId)
                )
              : state.cart.map((c) =>
                  c.productId === productId && c.colorId === colorId
                    ? { ...c, quantity }
                    : c
                ),
        })),

      removeFromCart: (productId, colorId) =>
        set((state) => ({
          cart: state.cart.filter(
            (c) => !(c.productId === productId && c.colorId === colorId)
          ),
        })),

      clearCart: () => set({ cart: [] }),

      pushToast: (message) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({ toasts: [...state.toasts.slice(-2), { id, message }] }));
        setTimeout(() => {
          get().dismissToast(id);
        }, 3000);
      },

      dismissToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'altaj-store-v1',
      partialize: (state) => ({
        lang: state.lang,
        theme: state.theme,
        cart: state.cart,
      }),
    }
  )
);
