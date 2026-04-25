import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/errorHandler";
import { updateUserSchema } from "@/lib/validations";
import { NotFoundError } from "@/lib/errors";

/**
 * GET /api/users/me
 * Retorna o perfil do usuário autenticado.
 * Rota protegida.
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true, favorites: true } },
      },
    });

    if (!user) throw new NotFoundError("Usuário");

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/users/me
 * Atualiza nome e/ou e-mail do usuário autenticado.
 * Rota protegida.
 */
export async function PUT(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);

    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: currentUser.userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ message: "Perfil atualizado com sucesso.", user });
  } catch (error) {
    return handleApiError(error);
  }
}
