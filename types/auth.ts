import type { Session as BetterAuthSession, User as BetterAuthUser } from "better-auth";
import type { UserRole, OrderType, OrderStatus, PaymentStatus } from "@prisma/client";

export type Session = BetterAuthSession & {
  user: User;
};

export type User = BetterAuthUser & {
  role: UserRole;
};

export type { UserRole, OrderType, OrderStatus, PaymentStatus };