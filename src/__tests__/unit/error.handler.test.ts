import { NextResponse } from 'next/server';
import { ZodError, z } from 'zod';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '@/lib/errors';
import { handleApiError } from '@/lib/middleware/errorHandler';

// ── Mock do NextResponse ──────────────────────────────────
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    })),
  },
}));

// ── Mock do Prisma ────────────────────────────────────────
jest.mock('@/lib/prisma', () => ({
  prisma: {},
}));

describe('Classes de Erro Customizadas', () => {
  describe('AppError', () => {
    it('deve criar erro com statusCode e type corretos', () => {
      const error = new AppError('Erro genérico', 500, 'GENERIC_ERROR');
      expect(error.message).toBe('Erro genérico');
      expect(error.statusCode).toBe(500);
      expect(error.type).toBe('GENERIC_ERROR');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ValidationError', () => {
    it('deve criar erro 400 com tipo VALIDATION_ERROR', () => {
      const error = new ValidationError('Campo inválido');
      expect(error.statusCode).toBe(400);
      expect(error.type).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Campo inválido');
    });
  });

  describe('UnauthorizedError', () => {
    it('deve criar erro 401 com mensagem padrão', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.type).toBe('UNAUTHORIZED');
      expect(error.message).toContain('Acesso não autorizado');
    });

    it('deve aceitar mensagem customizada', () => {
      const error = new UnauthorizedError('Token expirado');
      expect(error.message).toBe('Token expirado');
    });
  });

  describe('ForbiddenError', () => {
    it('deve criar erro 403 com tipo FORBIDDEN', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
      expect(error.type).toBe('FORBIDDEN');
    });
  });

  describe('NotFoundError', () => {
    it('deve criar erro 404 com recurso no nome', () => {
      const error = new NotFoundError('Prato');
      expect(error.statusCode).toBe(404);
      expect(error.type).toBe('NOT_FOUND');
      expect(error.message).toContain('Prato');
    });

    it('deve usar "Recurso" como padrão', () => {
      const error = new NotFoundError();
      expect(error.message).toContain('Recurso');
    });
  });

  describe('ConflictError', () => {
    it('deve criar erro 409 com tipo CONFLICT', () => {
      const error = new ConflictError('E-mail já cadastrado');
      expect(error.statusCode).toBe(409);
      expect(error.type).toBe('CONFLICT');
      expect(error.message).toBe('E-mail já cadastrado');
    });
  });
});

describe('handleApiError — Middleware Global de Erros', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve tratar AppError com statusCode correto', () => {
    const error = new ValidationError('Dados inválidos');
    handleApiError(error);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          type: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
        }),
      }),
      { status: 400 },
    );
  });

  it('deve tratar UnauthorizedError com status 401', () => {
    const error = new UnauthorizedError();
    handleApiError(error);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ type: 'UNAUTHORIZED' }),
      }),
      { status: 401 },
    );
  });

  it('deve tratar NotFoundError com status 404', () => {
    const error = new NotFoundError('Usuário');
    handleApiError(error);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ type: 'NOT_FOUND' }),
      }),
      { status: 404 },
    );
  });

  it('deve tratar ZodError com detalhes dos campos', () => {
    const schema = z.object({ email: z.string().email() });
    let zodError: ZodError | null = null;
    try {
      schema.parse({ email: 'invalido' });
    } catch (e) {
      zodError = e as ZodError;
    }

    handleApiError(zodError);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          type: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            expect.objectContaining({ field: 'email' }),
          ]),
        }),
      }),
      { status: 400 },
    );
  });

  it('deve tratar erros desconhecidos com status 500', () => {
    const error = new Error('Erro inesperado');
    handleApiError(error);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ type: 'INTERNAL_SERVER_ERROR' }),
      }),
      { status: 500 },
    );
  });

  it('deve logar erros internos no console', () => {
    const error = new Error('Erro crítico');
    handleApiError(error);
    expect(console.error).toHaveBeenCalledWith(
      '[API ERROR]',
      expect.any(String),
      error,
    );
  });
});
