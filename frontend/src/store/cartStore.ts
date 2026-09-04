import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartExtra, CartItem, MenuItem } from "@/types";

interface AddToCartInput {
  menuItem: MenuItem;
  quantity: number;
  extras: CartExtra[];
  specialInstructions: string;
}

interface CartState {
  items: CartItem[];
  addItem: (input: AddToCartInput) => void;
  removeItem: (cartItemId: string) => void;
  increment: (cartItemId: string) => void;
  decrement: (cartItemId: string) => void;
  clear: () => void;
  subtotal: () => number;
  totalItems: () => number;
}

function extrasSignature(extras: CartExtra[]): string {
  return extras
    .map((e) => e.name)
    .sort()
    .join("|");
}

function lineTotal(item: CartItem): number {
  const extrasTotal = item.extras.reduce((sum, e) => sum + e.price, 0);
  return (item.price + extrasTotal) * item.quantity;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: ({ menuItem, quantity, extras, specialInstructions }) => {
        const signature = extrasSignature(extras);
        const existing = get().items.find(
          (i) =>
            i.menuItemId === menuItem.id &&
            extrasSignature(i.extras) === signature &&
            i.specialInstructions === specialInstructions
        );

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.cartItemId === existing.cartItemId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
          return;
        }

        const cartItem: CartItem = {
          cartItemId: `${menuItem.id}-${signature}-${Date.now()}`,
          menuItemId: menuItem.id,
          name: menuItem.name,
          image: menuItem.image,
          price: menuItem.price,
          quantity,
          extras,
          specialInstructions,
          available: menuItem.available,
        };

        set({ items: [...get().items, cartItem] });
      },

      removeItem: (cartItemId) =>
        set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) }),

      increment: (cartItemId) =>
        set({
          items: get().items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }),

      decrement: (cartItemId) =>
        set({
          items: get()
            .items.map((i) =>
              i.cartItemId === cartItemId ? { ...i, quantity: i.quantity - 1 } : i
            )
            .filter((i) => i.quantity > 0),
        }),

      clear: () => set({ items: [] }),

      subtotal: () => get().items.reduce((sum, item) => sum + lineTotal(item), 0),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "choplife-cart",
    }
  )
);
