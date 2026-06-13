import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { handleApiError } from '@/lib/middleware/errorHandler';
import { updateOrderStatusSchema } from '@/lib/validations';
import { NotFoundError, ForbiddenError } from '@/lib/errors';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/orders/:id
 * Retorna detalhes de um pedido.
 * USER só pode ver seus próprios pedidos.
 * Rota protegida.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = requireAuth(request);
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            meal: {
              select: { id: true, name: true, imageUrl: true, price: true },
            },
          },
        },
      },
    });

    if (!order) throw new NotFoundError('Pedido');

    // Garante que usuário comum só veja seus pedidos
    if (currentUser.role !== 'ADMIN' && order.userId !== currentUser.userId) {
      throw new ForbiddenError('Você não tem permissão para ver este pedido.');
    }

    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/orders/:id
 * Atualiza o status de um pedido. Rota protegida — apenas ADMIN.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = requireAuth(request);
    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundError('Pedido');

    const body = await request.json();
    const data = updateOrderStatusSchema.parse(body);

    // USER pode apenas cancelar seus próprios pedidos
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
      include: {
        items: { include: { meal: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json({
      message: 'Status do pedido atualizado.',
      order: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
