import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/errorHandler";

/**
 * GET /api/users
 * Lista todos os usuários. Rota protegida — apenas ADMIN.
 */
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users, total: users.length });
  } catch (error) {
    return handleApiError(error);
  }
}
