'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type ValidationResult = {
  ok: boolean;
  message?: string;
};

export async function validateSessionForOrder(): Promise<ValidationResult> {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      ok: false,
      message:
        'Sua sessão expirou. Faça login novamente para finalizar o pedido.',
    };
  }

  return { ok: true };
}

type CartItem = {
  meal: { id: string; price: number };
  quantity: number;
};

export async function createOrder(items: CartItem[], total: number) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Não autorizado');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) throw new Error('Usuário não encontrado');

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      total: parseFloat(total.toFixed(2)),
      items: {
        create: items.map((i) => ({
          mealId: i.meal.id,
          quantity: i.quantity,
          price: i.meal.price,
        })),
      },
    },
  });

  return order;
}
