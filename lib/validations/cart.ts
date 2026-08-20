import { z } from "zod";

export const addToCartSchema = z.object({
  menuItemId: z.string().cuid("Invalid menu item ID"),
  quantity: z.coerce.number().int().positive("Quantity must be positive").max(99, "Quantity too high").default(1),
  notes: z.string().max(500, "Notes too long").optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative").max(99, "Quantity too high"),
  notes: z.string().max(500, "Notes too long").optional(),
});

export const cartItemIdSchema = z.object({
  itemId: z.string().cuid("Invalid cart item ID"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CartItemIdInput = z.infer<typeof cartItemIdSchema>;