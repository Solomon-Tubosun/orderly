"use client";

import { CartItemWithMenuItem } from "@/types/cart";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: CartItemWithMenuItem;
  onUpdate: (itemId: string, quantity: number, notes?: string) => void;
  onRemove: (itemId: string) => void;
}

export function CartItem({ item, onUpdate, onRemove }: CartItemProps) {
  const itemTotal = item.quantity * Number(item.menuItem.price.toString());

  return (
    <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
      {item.menuItem.imageUrl && (
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
          <img
            src={item.menuItem.imageUrl}
            alt={item.menuItem.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h4 className="font-medium truncate">{item.menuItem.name}</h4>
            <p className="text-sm text-muted-foreground">{formatCurrency(item.menuItem.price.toString())} each</p>
            {item.notes && (
              <p className="text-xs text-muted-foreground mt-1">Note: {item.notes}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 border rounded-md">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onUpdate(item.id, Math.max(1, item.quantity - 1))}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onUpdate(item.id, Math.min(99, item.quantity + 1))}
              disabled={item.quantity >= 99}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <span className="font-semibold">{formatCurrency(itemTotal)}</span>
        </div>
      </div>
    </div>
  );
}