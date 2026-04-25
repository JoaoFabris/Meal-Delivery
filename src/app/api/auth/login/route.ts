import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/errorHandler";
import { loginSchema } from "@/lib/validations";
import { UnauthorizedError } from "@/lib/errors";

/**
 * POST /api/auth/login
 * Autentica o usuário e retorna um token JWT.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação dos dados de entrada
    const data = loginSchema.parse(body);

    // Busca usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Mensagem genérica para não revelar se o e-mail existe
      throw new UnauthorizedError("E-mail ou senha inválidos.");
    }

    // Verifica a senha com bcrypt
    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedError("E-mail ou senha inválidos.");
    }

    // Gera o token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      message: "Login realizado com sucesso.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
