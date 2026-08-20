"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type OrderType = "DINE_IN" | "DELIVERY" | "PICKUP";

const ORDER_TYPES: { value: OrderType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "DINE_IN",
    label: "Dine In",
    description: "Eat at the restaurant",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    value: "DELIVERY",
    label: "Delivery",
    description: "Delivered to your address",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    value: "PICKUP",
    label: "Pickup",
    description: "Pick up at the restaurant",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
];

interface OrderTypeSelectorProps {
  value: OrderType;
  onChange: (value: OrderType) => void;
}

export function OrderTypeSelector({ value, onChange }: OrderTypeSelectorProps) {
  return (
    <RadioGroup value={value} onValueChange={onChange}>
      <div className="grid grid-cols-3 gap-4">
        {ORDER_TYPES.map((type) => (
          <div key={type.value}>
            <RadioGroupItem
              value={type.value}
              className={cn(
                "relative flex h-28 flex-col items-center justify-center gap-2 rounded-lg border p-4 transition-all",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                "data-[state=checked]:border-primary"
              )}
            >
              <span className={cn("transition-colors", "data-[state=checked]:text-primary-foreground")}>
                {type.icon}
              </span>
              <Label className="font-medium">{type.label}</Label>
              <p className="text-xs text-muted-foreground text-center">
                {type.description}
              </p>
            </RadioGroupItem>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
}