import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/middleware/errorHandler';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { canTransition, isOrderStatus } from '@/lib/orderStatus';

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!isOrderStatus(status)) {
      throw new ValidationError('Status de pedido inválido.');
    }

    const current = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!current) throw new NotFoundError('Pedido');

    if (!canTransition(current.status, status)) {
      throw new ValidationError(
        `Não é possível alterar o pedido de ${current.status} para ${status}.`,
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
