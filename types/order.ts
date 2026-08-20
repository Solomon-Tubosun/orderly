import { Order, OrderItem, OrderStatusHistory, Address, MenuItem, User } from "@prisma/client";
import { OrderType, OrderStatus, PaymentStatus } from "@prisma/client";

export type OrderWithDetails = Order & {
  items: (OrderItem & {
    menuItem: MenuItem;
  })[];
  statusHistory: OrderStatusHistory[];
  deliveryAddress: Address | null;
  user: Pick<User, "id" | "name" | "email" | "phone">;
};

export type OrderSummary = Pick<Order, 
  | "id" 
  | "orderNumber" 
  | "type" 
  | "status" 
  | "paymentStatus" 
  | "total" 
  | "createdAt" 
  | "estimatedDeliveryTime"
> & {
  itemCount: number;
};

export interface OrderStatusTimeline {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready for Pickup",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  DINE_IN: "Dine In",
  DELIVERY: "Delivery",
  PICKUP: "Pickup",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};