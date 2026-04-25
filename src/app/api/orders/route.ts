import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/errorHandler";
import { createOrderSchema } from "@/lib/validations";
import { ValidationError } from "@/lib/errors";

/**
 * GET /api/orders
 * Lista os pedidos do usuário autenticado.
 * ADMIN vê todos os pedidos.
 * Rota protegida.
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);

    const orders = await prisma.order.findMany({
      where: currentUser.role === "ADMIN" ? {} : { userId: currentUser.userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            meal: { select: { id: true, name: true, imageUrl: true, price: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders, total: orders.length });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/orders
 * Cria um novo pedido para o usuário autenticado.
 * Calcula o total automaticamente com base nos preços dos pratos.
 * Rota protegida.
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);

    const body = await request.json();
    const data = createOrderSchema.parse(body);

    // Busca todos os pratos do pedido
    const mealIds = data.items.map((item) => item.mealId);
    const meals = await prisma.meal.findMany({
      where: { id: { in: mealIds }, available: true },
    });

    // Valida se todos os pratos existem e estão disponíveis
    if (meals.length !== mealIds.length) {
      throw new ValidationError(
        "Um ou mais pratos não foram encontrados ou estão indisponíveis."
      );
    }

    // Calcula o total do pedido
    const mealMap = new Map(meals.map((m) => [m.id, m]));
    let total = 0;

    const orderItems = data.items.map((item) => {
      const meal = mealMap.get(item.mealId)!;
      const itemTotal = meal.price * item.quantity;
      total += itemTotal;
      return {
        mealId: item.mealId,
        quantity: item.quantity,
        price: meal.price,
      };
    });

    // Cria o pedido com seus itens
    const order = await prisma.order.create({
      data: {
        userId: currentUser.userId,
        total: parseFloat(total.toFixed(2)),
        items: { create: orderItems },
      },
      include: {
        items: {
          include: {
            meal: { select: { id: true, name: true, imageUrl: true } },
          },
        },
      },
    });

    return NextResponse.json({ message: "Pedido criado com sucesso.", order }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
