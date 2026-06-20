import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { handleApiError } from '@/lib/middleware/errorHandler';
import { createOrderSchema } from '@/lib/validations';
import { ValidationError } from '@/lib/errors';

interface MealData {
  id: string;
  price: number;
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);
    const orders = await prisma.order.findMany({
      where: currentUser.role === 'ADMIN' ? {} : { userId: currentUser.userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders, total: orders.length });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    const mealIds = data.items.map((item) => item.mealId);
    const meals: MealData[] = await prisma.meal.findMany({
      where: { id: { in: mealIds }, available: true },
      select: { id: true, price: true },
    });

    if (meals.length !== mealIds.length) {
      throw new ValidationError(
        'Um ou mais pratos não foram encontrados ou estão indisponíveis.',
      );
    }

    const mealMap = new Map<string, MealData>(meals.map((m) => [m.id, m]));
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

    const order = await prisma.order.create({
      data: {
        userId: currentUser.userId,
        total: parseFloat(total.toFixed(2)),
        items: { create: orderItems },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(
      { message: 'Pedido criado com sucesso.', order },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
