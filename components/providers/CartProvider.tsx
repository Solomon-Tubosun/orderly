"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CartWithItems } from "@/types/cart";

interface CartContextType {
  cart: CartWithItems | null;
  setCart: (cart: CartWithItems | null) => void;
  itemCount: number;
  subtotal: number;
  refreshCart: () => Promise<void>;
  addItem: (menuItemId: string, quantity?: number, notes?: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number, notes?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  }, []);

  const addItem = useCallback(async (menuItemId: string, quantity = 1, notes?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId, quantity, notes }),
      });
      if (res.ok) await fetchCart();
    } finally {
      setIsLoading(false);
    }
  }, [fetchCart]);

  const updateItem = useCallback(async (itemId: string, quantity: number, notes?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity, notes }),
      });
      if (res.ok) await fetchCart();
    } finally {
      setIsLoading(false);
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      if (res.ok) await fetchCart();
    } finally {
      setIsLoading(false);
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    setCart(null);
  }, []);

  const itemCount = cart?.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) ?? 0;
  const subtotal = cart?.items.reduce(
    (sum: number, item: { quantity: number; menuItem: { price: { toString: () => string } } }) => 
      sum + item.quantity * Number(item.menuItem.price.toString()),
    0
  ) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        itemCount,
        subtotal,
        refreshCart: fetchCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}