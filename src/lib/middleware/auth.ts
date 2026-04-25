import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

export interface JwtPayload {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
}

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * Gera um JWT com validade de 7 dias.
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verifica e decodifica um JWT.
 * Lança UnauthorizedError se inválido ou expirado.
 */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError("Token inválido ou expirado.");
  }
}

/**
 * Extrai e valida o token JWT do header Authorization da requisição.
 * Uso: const user = requireAuth(request)
 */
export function requireAuth(request: NextRequest): JwtPayload {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token não fornecido. Use o header Authorization: Bearer <token>");
  }

  const token = authHeader.split(" ")[1];
  return verifyToken(token);
}

/**
 * Verifica autenticação E exige role de ADMIN.
 */
export function requireAdmin(request: NextRequest): JwtPayload {
  const user = requireAuth(request);

  if (user.role !== "ADMIN") {
    throw new ForbiddenError("Acesso restrito a administradores.");
  }

  return user;
}
