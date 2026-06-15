import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export interface ApiErrorResponse {
  error: {
    type: string;
    message: string;
    details?: unknown;
  };
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Dados inválidos na requisição.',
          details: error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      },
      { status: 400 },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          type: error.type,
          message: error.message,
        },
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: {
            type: 'CONFLICT',
            message: 'Este registro já existe no sistema.',
          },
        },
        { status: 409 },
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          error: {
            type: 'NOT_FOUND',
            message: 'Registro não encontrado no banco de dados.',
          },
        },
        { status: 404 },
      );
    }
  }

  console.error('[API ERROR]', new Date().toISOString(), error);

  return NextResponse.json(
    {
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Erro interno do servidor. Tente novamente mais tarde.',
      },
    },
    { status: 500 },
  );
}
