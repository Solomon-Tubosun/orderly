"use client";

import { OrderSummary } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_TYPE_LABELS, ORDER_STATUS_ORDER } from "@/types/order";
import Link from "next/link";

interface OrderCardProps {
  order: OrderSummary;
}

export function OrderCard({ order }: OrderCardProps) {
  const currentStatusIndex = ORDER_STATUS_ORDER.indexOf(order.status);
  const progress = ((currentStatusIndex + 1) / ORDER_STATUS_ORDER.length) * 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">
          Order <span className="font-mono text-primary">{order.orderNumber}</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={order.status === "COMPLETED" ? "default" : order.status === "CANCELLED" ? "destructive" : "secondary"}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
          <Badge variant="outline">{ORDER_TYPE_LABELS[order.type]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Placed</span>
          <span>{formatDateTime(order.createdAt)}</span>
        </div>
        {order.estimatedDeliveryTime && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Est. Ready</span>
            <span>{formatDateTime(order.estimatedDeliveryTime)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-lg font-semibold border-t pt-2">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${Math.max(progress, 10)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          {ORDER_STATUS_ORDER.map((status, index) => (
            <span
              key={status}
              className={index <= currentStatusIndex ? "font-medium text-primary" : ""}
            >
              {ORDER_STATUS_LABELS[status].charAt(0)}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href={`/orders/${order.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}