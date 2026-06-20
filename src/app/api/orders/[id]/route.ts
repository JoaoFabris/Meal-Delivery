import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { handleApiError } from '@/lib/middleware/errorHandler';
import { updateOrderStatusSchema } from '@/lib/validations';
import { NotFoundError, ForbiddenError } from '@/lib/errors';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = requireAuth(request);
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });

    if (!order) throw new NotFoundError('Pedido');

    if (currentUser.role !== 'ADMIN' && order.userId !== currentUser.userId) {
      throw new ForbiddenError('Você não tem permissão para ver este pedido.');
    }

    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = requireAuth(request);
    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundError('Pedido');

    const body = await request.json();
    const data = updateOrderStatusSchema.parse(body);

    if (currentUser.role !== 'ADMIN') {
      if (data.status !== 'CANCELLED') {
        throw new ForbiddenError('Usuários só podem cancelar seus pedidos.');
      }
      if (order.userId !== currentUser.userId) {
        throw new ForbiddenError(
          'Você não tem permissão para modificar este pedido.',
        );
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: data.status },
      include: { items: true },
    });

    return NextResponse.json({
      message: 'Status do pedido atualizado.',
      order: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
