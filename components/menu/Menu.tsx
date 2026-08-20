"use client";

import { useState, useEffect } from "react";
import { MenuItemWithCategory, Category } from "@/types/menu";
import { MenuItemCard } from "./MenuItemCard";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface MenuProps {
  initialItems?: MenuItemWithCategory[];
  initialCategories?: Category[];
}

export function Menu({ initialItems = [], initialCategories = [] }: MenuProps) {
  const [items, setItems] = useState<MenuItemWithCategory[]>(initialItems);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialItems.length === 0) fetchMenu();
  }, [initialItems.length]);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "all") params.set("categoryId", activeCategory);
      if (search) params.set("search", search);
      
      const res = await fetch(`/api/menu?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch menu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeCategory !== "all" && item.categoryId !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
        <h2 className="text-2xl font-bold">Menu</h2>
        <Input
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No items found</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>
        
        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">Loading...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No items in this category</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}