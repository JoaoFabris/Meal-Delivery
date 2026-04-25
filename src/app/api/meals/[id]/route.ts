import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/errorHandler";
import { updateMealSchema } from "@/lib/validations";
import { NotFoundError } from "@/lib/errors";

type RouteParams = { params: { id: string } };

/**
 * GET /api/meals/:id
 * Retorna um prato específico. Rota pública.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const meal = await prisma.meal.findUnique({ where: { id: params.id } });

    if (!meal) throw new NotFoundError("Prato");

    return NextResponse.json({ meal });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/meals/:id
 * Atualiza um prato. Rota protegida — apenas ADMIN.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    requireAdmin(request);

    const existing = await prisma.meal.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError("Prato");

    const body = await request.json();
    const data = updateMealSchema.parse(body);

    const meal = await prisma.meal.update({ where: { id: params.id }, data });

    return NextResponse.json({ message: "Prato atualizado com sucesso.", meal });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/meals/:id
 * Remove um prato. Rota protegida — apenas ADMIN.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    requireAdmin(request);

    const existing = await prisma.meal.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError("Prato");

    await prisma.meal.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Prato removido com sucesso." });
  } catch (error) {
    return handleApiError(error);
  }
}
