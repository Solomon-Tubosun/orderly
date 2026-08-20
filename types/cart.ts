import { Cart, CartItem, MenuItem } from "@prisma/client";

export type CartWithItems = Cart & {
  items: (CartItem & {
    menuItem: MenuItem;
  })[];
};

export type CartItemWithMenuItem = CartItem & {
  menuItem: MenuItem;
};

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
}