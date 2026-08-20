import { DefaultSession, DefaultUser } from "better-auth";
import { UserRole, OrderType, OrderStatus, PaymentStatus } from "@prisma/client";

declare module "better-auth" {
  interface User extends DefaultUser {
    role: UserRole;
  }
  
  interface Session extends DefaultSession {
    user: User;
  }
}

export type { UserRole, OrderType, OrderStatus, PaymentStatus };