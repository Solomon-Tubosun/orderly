import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required").max(50, "Label too long"),
  street: z.string().min(1, "Street address is required").max(200, "Street too long"),
  city: z.string().min(1, "City is required").max(100, "City too long"),
  state: z.string().min(1, "State is required").max(100, "State too long"),
  zipCode: z.string().min(1, "ZIP code is required").max(20, "ZIP code too long"),
  country: z.string().default("US"),
  isDefault: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const checkoutSchema = z.object({
  orderType: z.enum(["DINE_IN", "DELIVERY", "PICKUP"]),
  deliveryAddressId: z.string().cuid("Invalid address ID").optional(),
  deliveryNotes: z.string().max(500, "Notes too long").optional(),
  tableNumber: z.number().int().positive("Table number must be positive").optional(),
  partySize: z.number().int().positive("Party size must be positive").max(20, "Party size too large").optional(),
  paymentMethodId: z.string().optional(),
  tip: z.number().min(0, "Tip cannot be negative").max(100, "Tip too high").default(0),
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

// Form data types - manually defined to avoid Zod inference issues with .default()
export interface CheckoutFormData {
  orderType: "DINE_IN" | "DELIVERY" | "PICKUP";
  deliveryAddressId?: string;
  deliveryNotes?: string;
  tableNumber?: number;
  partySize?: number;
  paymentMethodId?: string;
  tip: number;
}

export interface AddressFormData {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}