import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validations/checkout";
import { generateOrderNumber } from "@/lib/utils";

export async function GET() {
  const session = await auth.api.getSession({ headers: new Headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { menuItem: true },
      },
      deliveryAddress: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const subtotal = cart.items.reduce(
      (sum: number, item: { quantity: number; menuItem: { price: { toString: () => string } } }) => 
        sum + item.quantity * Number(item.menuItem.price.toString()),
      0
    );

    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const deliveryFee = data.orderType === "DELIVERY" ? 5.99 : 0;
    const tip = subtotal * (data.tip / 100);
    const total = subtotal + tax + deliveryFee + tip;

    let deliveryAddressId = data.deliveryAddressId;
    if (data.orderType === "DELIVERY" && deliveryAddressId) {
      const address = await prisma.address.findFirst({
        where: { id: deliveryAddressId, userId: session.user.id },
      });
      if (!address) {
        return NextResponse.json({ error: "Invalid delivery address" }, { status: 400 });
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: session.user.id,
          type: data.orderType,
          status: "PENDING",
          paymentStatus: "PENDING",
          deliveryAddressId,
          deliveryFee,
          deliveryNotes: data.deliveryNotes,
          tableNumber: data.tableNumber,
          partySize: data.partySize,
          subtotal,
          tax,
          tip,
          total,
          paymentMethod: data.paymentMethodId,
        },
      });

      await tx.orderItem.createMany({
        data: cart.items.map((item: { menuItemId: string; quantity: number; menuItem: { price: { toString: () => string } }; notes?: string | null }) => ({
          orderId: newOrder.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: Number(item.menuItem.price.toString()),
          totalPrice: item.quantity * Number(item.menuItem.price.toString()),
          notes: item.notes,
        })),
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: "PENDING",
          note: "Order placed",
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input", details: error }, { status: 400 });
    }
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}