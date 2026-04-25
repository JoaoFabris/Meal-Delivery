import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/errorHandler";
import { registerSchema } from "@/lib/validations";
import { ConflictError } from "@/lib/errors";

/**
 * POST /api/auth/register
 * Registra um novo usuário com hash de senha (bcrypt).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação dos dados de entrada
    const data = registerSchema.parse(body);

    // Verifica se e-mail já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError("Este e-mail já está cadastrado.");
    }

    // Hash da senha com bcrypt (custo 10)
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Cria o usuário no banco
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Gera o token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        message: "Usuário registrado com sucesso.",
        user,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
