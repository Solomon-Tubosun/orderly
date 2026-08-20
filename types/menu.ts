import { MenuItem, Category as PrismaCategory } from "@prisma/client";

export type Category = PrismaCategory;

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