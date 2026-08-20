"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  taxRate: number;
  tip: number;
  onCheckout: () => void;
}

export function CartSummary({ subtotal, deliveryFee, taxRate, tip, onCheckout }: CartSummaryProps) {
  const tax = subtotal * taxRate;
  const total = subtotal + tax + deliveryFee + tip;

  return (
    <div className="border-t pt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      {deliveryFee > 0 && (
        <div className="flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span>{formatCurrency(deliveryFee)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
        <span>{formatCurrency(tax)}</span>
      </div>
      {tip > 0 && (
        <div className="flex justify-between text-sm">
          <span>Tip</span>
          <span>{formatCurrency(tip)}</span>
        </div>
      )}
      <div className="flex justify-between text-lg font-semibold border-t pt-2">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <Button className="w-full mt-4" size="lg" onClick={onCheckout}>
        Proceed to Checkout
      </Button>
    </div>
  );
}