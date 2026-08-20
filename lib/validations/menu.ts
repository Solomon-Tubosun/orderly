import { z } from "zod";

export const menuItemSchema = z.object({
  categoryId: z.string().cuid("Invalid category ID"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  price: z.coerce.number().positive("Price must be positive").max(9999.99, "Price too high"),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  prepTime: z.coerce.number().int().positive("Prep time must be positive").default(15),
  allergens: z.array(z.string()).default([]),
  nutrition: z.record(z.string(), z.unknown()).optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;