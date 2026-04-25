import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/errorHandler";
import { createMealSchema } from "@/lib/validations";

/**
 * GET /api/meals
 * Lista todos os pratos disponíveis.
 * Query params: category, search, available
 * Rota pública.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const available = searchParams.get("available");

    const meals = await prisma.meal.findMany({
      where: {
        ...(category && { category }),
        ...(available !== null && { available: available === "true" }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ meals, total: meals.length });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/meals
 * Cria um novo prato. Rota protegida — apenas ADMIN.
 */
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const body = await request.json();
    const data = createMealSchema.parse(body);

    const meal = await prisma.meal.create({ data });

    return NextResponse.json({ message: "Prato criado com sucesso.", meal }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
