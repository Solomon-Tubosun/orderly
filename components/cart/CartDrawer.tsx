"use client";

import { useCart } from "@/components/providers/CartProvider";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";
import { X } from "lucide-react";

export function CartDrawer() {
  const { cart, itemCount, subtotal, removeItem, updateItem, clearCart } = useCart();

  if (itemCount === 0) return null;

  return (
    <Sheet>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Your Cart</SheetTitle>
              <SheetDescription>{itemCount} item{itemCount !== 1 ? "s" : ""}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cart?.items.map((cartItem) => (
            <CartItem
              key={cartItem.id}
              item={cartItem}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))}
        </div>

        <CartSummary
          subtotal={subtotal}
          deliveryFee={0}
          taxRate={0.08}
          tip={0}
          onCheckout={() => {}}
        />

        <Button variant="outline" className="w-full mt-4" onClick={clearCart}>
          Clear Cart
        </Button>
      </SheetContent>
    </Sheet>
  );
}

export function CartButton() {
  const { itemCount, subtotal } = useCart();

  if (itemCount === 0) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" className="relative fixed bottom-4 right-4 z-50 sm:static">
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>{itemCount}</span>
          </span>
          <span className="ml-2 font-medium">{formatCurrency(subtotal)}</span>
        </Button>
      </SheetTrigger>
      <CartDrawer />
    </Sheet>
  );
}