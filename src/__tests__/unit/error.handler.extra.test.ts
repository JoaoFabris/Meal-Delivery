// src/__tests__/unit/error.handler.extra.test.ts
//
// Complementa o error.handler.test.ts existente cobrindo os branches
// do Prisma (P2002 e P2025) que estavam nas linhas 51-64 sem cobertura.

import { handleApiError } from '@/lib/middleware/errorHandler';
import { Prisma } from '@prisma/client';

function makePrismaError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('mock error', {
    code,
    clientVersion: '5.0.0',
  });
}

describe('handleApiError — erros do Prisma', () => {
  it('P2002: retorna 409 CONFLICT para violação de constraint única', () => {
    const error = makePrismaError('P2002');
    const response = handleApiError(error);

    expect(response.status).toBe(409);
  });

  it('P2002: body contém type CONFLICT e mensagem adequada', async () => {
    const error = makePrismaError('P2002');
    const response = handleApiError(error);
    const body = await response.json();

    expect(body.error.type).toBe('CONFLICT');
    expect(body.error.message).toMatch(/já existe/i);
  });

  it('P2025: retorna 404 NOT_FOUND para registro inexistente', () => {
    const error = makePrismaError('P2025');
    const response = handleApiError(error);

    expect(response.status).toBe(404);
  });

  it('P2025: body contém type NOT_FOUND e mensagem adequada', async () => {
    const error = makePrismaError('P2025');
    const response = handleApiError(error);
    const body = await response.json();

    expect(body.error.type).toBe('NOT_FOUND');
    expect(body.error.message).toMatch(/não encontrado/i);
  });

  it('outro código Prisma: cai no handler genérico e retorna 500', async () => {
    const error = makePrismaError('P2003'); // FK constraint — não tratado especificamente
    const response = handleApiError(error);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.type).toBe('INTERNAL_SERVER_ERROR');
  });
});
