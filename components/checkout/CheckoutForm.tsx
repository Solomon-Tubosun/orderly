"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutInput, checkoutSchema } from "@/lib/validations/checkout";
import { OrderTypeSelector } from "./OrderTypeSelector";
import { DeliveryAddressForm } from "./DeliveryAddressForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { loadStripe } from "@stripe/stripe-js";

interface CheckoutFormProps {
  subtotal: number;
  itemCount: number;
  onSuccess?: (orderId: string) => void;
}

const TAX_RATE = 0.08;
const DELIVERY_FEE = 5.99;

export function CheckoutForm({ subtotal, itemCount, onSuccess }: CheckoutFormProps) {
  const [step, setStep] = useState<"type" | "details" | "payment">("type");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [tip, setTip] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      orderType: "PICKUP",
      deliveryAddressId: "",
      deliveryNotes: "",
      tableNumber: undefined,
      partySize: undefined,
      paymentMethodId: "",
      tip: 0,
    },
  });

  const tax = subtotal * TAX_RATE;
  const deliveryFee = form.watch("orderType") === "DELIVERY" ? DELIVERY_FEE : 0;
  const total = subtotal + tax + deliveryFee + tip;

  const handleTypeSubmit = (data: CheckoutInput) => {
    form.setValue("orderType", data.orderType);
    if (data.orderType === "DELIVERY") {
      setStep("details");
    } else if (data.orderType === "DINE_IN") {
      setStep("details");
    } else {
      setStep("payment");
    }
  };

  const handleDetailsSubmit = (data: CheckoutInput) => {
    setStep("payment");
  };

  const handlePaymentSubmit = async (data: CheckoutInput) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form.getValues(),
          ...data,
          tip,
        }),
      });
      if (res.ok) {
        const order = await res.json();
        toast({ title: "Order placed!", description: `Order #${order.orderNumber}` });
        onSuccess?.(order.id);
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error || "Failed to place order", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to place order", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "type":
        return (
          <form onSubmit={form.handleSubmit(handleTypeSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Order Type</label>
              <OrderTypeSelector
                value={form.watch("orderType")}
                onChange={(v) => form.setValue("orderType", v)}
              />
            </div>
            <Button type="submit" className="w-full" size="lg">Continue</Button>
          </form>
        );
      case "details":
        return (
          <form onSubmit={form.handleSubmit(handleDetailsSubmit)} className="space-y-6">
            {form.watch("orderType") === "DELIVERY" && (
              <DeliveryAddressForm
                selectedAddressId={selectedAddressId}
                onAddressSelect={setSelectedAddressId}
                onNewAddress={() => {}}
              />
            )}
            {form.watch("orderType") === "DINE_IN" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="tableNumber">Table Number</Label>
                  <Controller
                    control={form.control}
                    name="tableNumber"
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        placeholder="Table number"
                        valueAsNumber={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="partySize">Party Size</Label>
                  <Controller
                    control={form.control}
                    name="partySize"
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        max="20"
                        placeholder="Number of guests"
                        valueAsNumber={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    )}
                  />
                </div>
              </div>
            )}
            {form.watch("orderType") === "PICKUP" && (
              <p className="text-sm text-muted-foreground">
                Your order will be ready for pickup in approximately 15-20 minutes.
              </p>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep("type")}>
                Back
              </Button>
              <Button type="submit" className="flex-1">Continue</Button>
            </div>
          </form>
        );
      case "payment":
        return (
          <form onSubmit={form.handleSubmit(handlePaymentSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Tip</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={tip}
                      onChange={(e) => setTip(Number(e.target.value))}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value={0}>0%</option>
                      <option value={Math.round(subtotal * 0.1)}>10%</option>
                      <option value={Math.round(subtotal * 0.15)}>15%</option>
                      <option value={Math.round(subtotal * 0.2)}>20%</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep("details")}>
                Back
              </Button>
              <Button type="submit" disabled={isProcessing} className="flex-1">
                {isProcessing ? "Processing..." : `Pay ${formatCurrency(total)}`}
              </Button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <Tabs value={step} onValueChange={setStep} className="w-full" defaultValue="type">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="type" disabled={step !== "type"}>Order Type</TabsTrigger>
          <TabsTrigger value="details" disabled={step === "type"}>Details</TabsTrigger>
          <TabsTrigger value="payment" disabled={step !== "payment"}>Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="type">{renderStep()}</TabsContent>
        <TabsContent value="details">{renderStep()}</TabsContent>
        <TabsContent value="payment">{renderStep()}</TabsContent>
      </Tabs>
    </div>
  );
}

import { Controller } from "react-hook-form";