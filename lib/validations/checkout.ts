import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required").max(50, "Label too long"),
  street: z.string().min(1, "Street address is required").max(200, "Street too long"),
  city: z.string().min(1, "City is required").max(100, "City too long"),
  state: z.string().min(1, "State is required").max(100, "State too long"),
  zipCode: z.string().min(1, "ZIP code is required").max(20, "ZIP code too long"),
  country: z.string().default("US"),
  isDefault: z.boolean().default(false),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

export const checkoutSchema = z.object({
  orderType: z.enum(["DINE_IN", "DELIVERY", "PICKUP"]),
  deliveryAddressId: z.string().cuid("Invalid address ID").optional(),
  deliveryNotes: z.string().max(500, "Notes too long").optional(),
  tableNumber: z.coerce.number().int().positive("Table number must be positive").optional(),
  partySize: z.coerce.number().int().positive("Party size must be positive").max(20, "Party size too large").optional(),
  paymentMethodId: z.string().optional(),
  tip: z.coerce.number().min(0, "Tip cannot be negative").max(100, "Tip too high").default(0),
}).refine((data) => {
  if (data.orderType === "DELIVERY") return !!data.deliveryAddressId;
  if (data.orderType === "DINE_IN") return !!data.tableNumber && !!data.partySize;
  return true;
}, {
  message: "Required fields missing for selected order type",
  path: ["orderType"],
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;