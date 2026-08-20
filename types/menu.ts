import { MenuItem, Category } from "@prisma/client";

export type MenuItemWithCategory = MenuItem & {
  category: Category;
};

export type CategoryWithItems = Category & {
  items: MenuItem[];
};

export interface MenuFilters {
  categoryId?: string;
  search?: string;
  isAvailable?: boolean;
  isPopular?: boolean;
  allergens?: string[];
}