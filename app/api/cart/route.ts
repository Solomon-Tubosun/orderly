import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { addToCartSchema } from "@/lib/validations/cart";

export async function GET() {
  const session = await auth.api.getSession({ headers: new Headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          menuItem: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cart) {
    return NextResponse.json({ items: [], itemCount: 0, subtotal: 0 });
  }

  const itemCount = cart.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce(
    (sum: number, item: { quantity: number; menuItem: { price: { toString: () => string } } }) => 
      sum + item.quantity * Number(item.menuItem.price.toString()),
    0
  );

  return NextResponse.json({
    ...cart,
    itemCount,
    subtotal,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { menuItemId, quantity, notes } = addToCartSchema.parse(body);

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem || !menuItem.isAvailable) {
      return NextResponse.json({ error: "Menu item not available" }, { status: 400 });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_menuItemId: {
          cartId: cart.id,
          menuItemId,
        },
      },
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          notes: notes ?? existingItem.notes,
        },
        include: { menuItem: true },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId,
          quantity,
          notes,
        },
        include: { menuItem: true },
      });
    }

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}