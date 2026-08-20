# Orderly - Restaurant Ordering App Plan

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: BetterAuth
- **Validation**: Zod
- **Forms**: React Hook Form + Zod resolver
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS v4

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  CUSTOMER
  STAFF
  ADMIN
}

enum OrderType {
  DINE_IN
  DELIVERY
  PICKUP
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  phone         String?
  role          UserRole  @default(CUSTOMER)
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  addresses     Address[]
  orders        Order[]
  cart          Cart?
  
  @@map("users")
}

model Address {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  label       String   // "Home", "Work", etc.
  street      String
  city        String
  state       String
  zipCode     String
  country     String   @default("US")
  isDefault   Boolean  @default(false)
  latitude    Float?
  longitude   Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("addresses")
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  imageUrl    String?
  sortOrder   Int       @default(0)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  items       MenuItem[]
  
  @@map("categories")
}

model MenuItem {
  id          String   @id @default(cuid())
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  imageUrl    String?
  isAvailable Boolean  @default(true)
  isPopular   Boolean  @default(false)
  prepTime    Int      @default(15) // minutes
  allergens   String[] @default([])
  nutrition   Json?
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  orderItems  OrderItem[]
  cartItems   CartItem[]
  
  @@map("menu_items")
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  
  items     CartItem[]
  
  @@map("carts")
}

model CartItem {
  id        String    @id @default(cuid())
  cartId    String
  cart      Cart      @relation(fields: [cartId], references: [id], onDelete: Cascade)
  menuItemId String
  menuItem  MenuItem  @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
  quantity  Int       @default(1)
  notes     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  @@unique([cartId, menuItemId])
  @@map("cart_items")
}

model Order {
  id              String       @id @default(cuid())
  orderNumber     String       @unique @default(auto()) @map("order_number")
  userId          String
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  type            OrderType
  status          OrderStatus  @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  
  // Delivery fields
  deliveryAddress Address?
  deliveryAddressId String?
  deliveryFee     Decimal      @default(0) @db.Decimal(10, 2)
  deliveryNotes   String?
  estimatedDeliveryTime DateTime?
  
  // Dine-in fields
  tableNumber     Int?
  partySize       Int?
  
  // Pricing
  subtotal        Decimal      @db.Decimal(10, 2)
  tax             Decimal      @default(0) @db.Decimal(10, 2)
  tip             Decimal      @default(0) @db.Decimal(10, 2)
  total           Decimal      @db.Decimal(10, 2)
  
  // Payment
  paymentMethod   String?
  paymentIntentId String?
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  completedAt     DateTime?
  
  items           OrderItem[]
  statusHistory   OrderStatusHistory[]
  
  @@map("orders")
}

model OrderItem {
  id           String    @id @default(cuid())
  orderId      String
  order        Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItemId   String
  menuItem     MenuItem  @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
  quantity     Int
  unitPrice    Decimal   @db.Decimal(10, 2)
  totalPrice   Decimal   @db.Decimal(10, 2)
  notes        String?
  createdAt    DateTime  @default(now())
  
  @@map("order_items")
}

model OrderStatusHistory {
  id        String       @id @default(cuid())
  orderId   String
  order     Order        @relation(fields: [orderId], references: [id], onDelete: Cascade)
  status    OrderStatus
  note      String?
  createdAt DateTime     @default(now())
  
  @@map("order_status_history")
}

// BetterAuth tables (managed by BetterAuth)
model Account {
  id                String  @id @default(cuid())
  userId            String
  accountId         String
  providerId        String
  accessToken       String?
  refreshToken      String?
  idToken           String?
  accessTokenExpiresAt DateTime?
  refreshTokenExpiresAt DateTime?
  scope             String?
  password          String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([providerId, accountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  expiresAt    DateTime
  token        String   @unique
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@map("sessions")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@unique([identifier, value])
  @@map("verifications")
}
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── orders/
│   │   │   ├── [id]/
│   │   │   └── page.tsx
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── address/
│   │   └── layout.tsx
│   ├── (public)/
│   │   ├── menu/
│   │   │   ├── [category]/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/[...all]/route.ts       # BetterAuth handler
│   │   ├── cart/route.ts
│   │   ├── orders/route.ts
│   │   ├── orders/[id]/route.ts
│   │   ├── menu/route.ts
│   │   └── webhook/stripe/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # ShadCN components
│   ├── menu/
│   │   ├── MenuCategory.tsx
│   │   ├── MenuItemCard.tsx
│   │   └── MenuFilters.tsx
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── checkout/
│   │   ├── CheckoutForm.tsx
│   │   ├── DeliveryAddressForm.tsx
│   │   ├── OrderTypeSelector.tsx
│   │   └── PaymentForm.tsx
│   ├── orders/
│   │   ├── OrderCard.tsx
│   │   ├── OrderTimeline.tsx
│   │   └── OrderDetail.tsx
│   └── providers/
│       ├── AuthProvider.tsx
│       └── CartProvider.tsx
├── lib/
│   ├── auth.ts                # BetterAuth config
│   ├── prisma.ts              # Prisma client
│   ├── utils.ts               # cn(), formatters
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── cart.ts
│   │   ├── checkout.ts
│   │   └── menu.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useOrders.ts
│   └── actions/
│       ├── cart.ts
│       ├── orders.ts
│       └── menu.ts
├── types/
│   ├── auth.ts
│   ├── cart.ts
│   ├── menu.ts
│   └── order.ts
└── middleware.ts              # Auth protection
```

---

## Key Features Implementation

### 1. Authentication (BetterAuth)
- Email/password + social providers (Google, Apple)
- Email verification
- Role-based access (customer, staff, admin)
- Session management with JWT

### 2. Menu System
- Categories with sorting
- Menu items with allergens, nutrition info
- Availability toggles
- Popular items highlighting

### 3. Cart (Persisted)
- Server-side cart via Prisma
- Real-time updates with React Hook Form
- Quantity management
- Special instructions per item

### 4. Order Types
- **Dine-in**: Table number, party size
- **Delivery**: Address selection, delivery fee, notes
- **Pickup**: Ready time estimation

### 5. Checkout Flow
1. Order type selection
2. Address selection (delivery) / Table info (dine-in)
3. Payment (Stripe integration)
4. Order confirmation

### 6. Order Tracking
- Real-time status updates
- Status history timeline
- Estimated delivery/ready times
- Order history

---

## Zod Validation Schemas

```typescript
// lib/validations/menu.ts
export const menuItemSchema = z.object({
  categoryId: z.string().cuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.coerce.number().positive().max(9999.99),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().default(true),
  prepTime: z.coerce.number().int().positive().default(15),
  allergens: z.array(z.string()).default([]),
});

// lib/validations/cart.ts
export const addToCartSchema = z.object({
  menuItemId: z.string().cuid(),
  quantity: z.coerce.number().int().positive().max(99).default(1),
  notes: z.string().max(500).optional(),
});

// lib/validations/checkout.ts
export const checkoutSchema = z.object({
  orderType: z.enum(['DINE_IN', 'DELIVERY', 'PICKUP']),
  // Delivery
  deliveryAddressId: z.string().cuid().optional(),
  deliveryNotes: z.string().max(500).optional(),
  // Dine-in
  tableNumber: z.coerce.number().int().positive().optional(),
  partySize: z.coerce.number().int().positive().max(20).optional(),
  // Payment
  paymentMethodId: z.string().optional(),
  tip: z.coerce.number().min(0).max(100).default(0),
}).refine(data => {
  if (data.orderType === 'DELIVERY') return !!data.deliveryAddressId;
  if (data.orderType === 'DINE_IN') return !!data.tableNumber && !!data.partySize;
  return true;
}, {
  message: "Required fields missing for order type",
  path: ["orderType"],
});
```

---

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | List menu items (with category filter) |
| GET | `/api/menu/:id` | Get single menu item |
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart` | Add item to cart |
| PATCH | `/api/cart/:itemId` | Update cart item quantity |
| DELETE | `/api/cart/:itemId` | Remove item from cart |
| POST | `/api/orders` | Create order from cart |
| GET | `/api/orders` | List user's orders |
| GET | `/api/orders/:id` | Get order details |
| PATCH | `/api/orders/:id/cancel` | Cancel order |
| POST | `/api/webhook/stripe` | Stripe webhook handler |

---

## Implementation Steps

### Phase 1: Foundation
1. Install dependencies: `prisma`, `@prisma/client`, `better-auth`, `zod`, `@hookform/resolvers`, `react-hook-form`, `@radix-ui/*`, `lucide-react`, `stripe`, `@stripe/stripe-js`
2. Setup Prisma schema & run migrations
3. Configure BetterAuth with Prisma adapter
4. Setup ShadCN UI components
5. Create auth middleware & providers

### Phase 2: Menu & Cart
1. Build menu page with categories
2. Implement cart drawer with server actions
3. Add to cart / update / remove functionality
4. Persist cart to database

### Phase 3: Checkout & Orders
1. Build checkout flow with order type selection
2. Address management (CRUD)
3. Stripe payment integration
4. Order creation & confirmation

### Phase 4: Order Management
1. Order history page
2. Order detail with status timeline
3. Real-time status updates (polling or WebSocket)
4. Cancel order functionality

### Phase 5: Polish
1. Loading states & error handling
2. Toast notifications
3. Responsive design
4. Accessibility improvements
5. Testing

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/orderly"

# BetterAuth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Next Steps

1. Run `npm install` for all dependencies
2. Run `npx prisma init` and apply schema
3. Configure BetterAuth in `lib/auth.ts`
4. Start building UI components with ShadCN