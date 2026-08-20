"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressInput, addressSchema } from "@/lib/validations/checkout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface DeliveryAddressFormProps {
  selectedAddressId?: string;
  onAddressSelect: (addressId: string) => void;
  onNewAddress: (address: AddressInput) => void;
}

export function DeliveryAddressForm({ selectedAddressId, onAddressSelect, onNewAddress }: DeliveryAddressFormProps) {
  const [addresses, setAddresses] = useState<Array<{ id: string; label: string; street: string; city: string; state: string; zipCode: string }>>([]);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "Home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
      isDefault: false,
    },
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  const handleSubmit = async (data: AddressInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newAddress = await res.json();
        setAddresses((prev) => [...prev, newAddress]);
        onAddressSelect(newAddress.id);
        onNewAddress(data);
        form.reset();
        setShowNewAddress(false);
        toast({ title: "Address added" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add address", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {addresses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    "hover:bg-accent",
                    selectedAddressId === address.id && "border-primary bg-primary/5"
                  )}
                >
                  <input
                    type="radio"
                    name="address"
                    value={address.id}
                    checked={selectedAddressId === address.id}
                    onChange={() => onAddressSelect(address.id)}
                    className="h-4 w-4 text-primary"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{address.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.street}, {address.city}, {address.state} {address.zipCode}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowNewAddress(!showNewAddress)}
      >
        {showNewAddress ? "Cancel" : "Add New Address"}
      </Button>

      {showNewAddress && (
        <Card>
          <CardHeader>
            <CardTitle>New Address</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Controller
                    control={form.control}
                    name="label"
                    render={({ field }) => <Input {...field} placeholder="Home, Work, etc." />}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Controller
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Controller
                  control={form.control}
                  name="street"
                  render={({ field }) => <Input {...field} placeholder="123 Main St" />}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Controller
                    control={form.control}
                    name="city"
                    render={({ field }) => <Input {...field} placeholder="New York" />}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Controller
                    control={form.control}
                    name="state"
                    render={({ field }) => <Input {...field} placeholder="NY" />}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Controller
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => <Input {...field} placeholder="10001" />}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Controller
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      {...field}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  )}
                />
                <Label htmlFor="isDefault" className="cursor-pointer">
                  Set as default
                </Label>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Saving..." : "Save Address"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";