import {
  generateToken,
  verifyToken,
  requireAuth,
  requireAdmin,
} from '@/lib/middleware/auth';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import type { NextRequest } from 'next/server';

// ── Fixture de payload ────────────────────────────────────
const userPayload = {
  userId: 'user-123',
  email: 'user@test.com',
  role: 'USER' as const,
};
const adminPayload = {
  userId: 'admin-123',
  email: 'admin@test.com',
  role: 'ADMIN' as const,
};

// ── Helper para criar NextRequest fake ────────────────────
function makeRequest(token?: string): NextRequest {
  const headers = new Map<string, string>();
  if (token) headers.set('authorization', `Bearer ${token}`);
  return {
    headers: { get: (key: string) => headers.get(key) ?? null },
  } as unknown as NextRequest;
}

describe('generateToken', () => {
  it('deve gerar um token JWT válido', () => {
    const token = generateToken(userPayload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // header.payload.signature
  });

  it('deve gerar tokens diferentes para payloads diferentes', () => {
    const t1 = generateToken(userPayload);
    const t2 = generateToken(adminPayload);
    expect(t1).not.toBe(t2);
  });
});

describe('verifyToken', () => {
  it('deve decodificar um token válido corretamente', () => {
    const token = generateToken(userPayload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(userPayload.userId);
    expect(decoded.email).toBe(userPayload.email);
    expect(decoded.role).toBe(userPayload.role);
  });

  it('deve lançar UnauthorizedError para token inválido', () => {
    expect(() => verifyToken('token.invalido.aqui')).toThrow(UnauthorizedError);
  });

  it('deve lançar UnauthorizedError para token adulterado', () => {
    const token = generateToken(userPayload);
    const tampered = token.slice(0, -5) + 'XXXXX';
    expect(() => verifyToken(tampered)).toThrow(UnauthorizedError);
  });

  it('deve lançar UnauthorizedError para string vazia', () => {
    expect(() => verifyToken('')).toThrow(UnauthorizedError);
  });
});

describe('requireAuth', () => {
  it('deve retornar payload para token válido no header', () => {
    const token = generateToken(userPayload);
    const req = makeRequest(token);
    const result = requireAuth(req);
    expect(result.userId).toBe(userPayload.userId);
    expect(result.role).toBe('USER');
  });

  it('deve lançar UnauthorizedError sem header Authorization', () => {
    const req = makeRequest();
    expect(() => requireAuth(req)).toThrow(UnauthorizedError);
  });

  it('deve lançar UnauthorizedError com formato inválido (sem Bearer)', () => {
    const token = generateToken(userPayload);
    const req = {
      headers: { get: () => token }, // sem "Bearer "
    } as unknown as NextRequest;
    expect(() => requireAuth(req)).toThrow(UnauthorizedError);
  });

  it('deve lançar UnauthorizedError com token inválido', () => {
    const req = makeRequest('token-invalido');
    expect(() => requireAuth(req)).toThrow(UnauthorizedError);
  });
});

describe('requireAdmin', () => {
  it('deve retornar payload para token de admin válido', () => {
    const token = generateToken(adminPayload);
    const req = makeRequest(token);
    const result = requireAdmin(req);
    expect(result.role).toBe('ADMIN');
  });

  it('deve lançar ForbiddenError para usuário comum', () => {
    const token = generateToken(userPayload);
    const req = makeRequest(token);
    expect(() => requireAdmin(req)).toThrow(ForbiddenError);
  });

  it('deve lançar UnauthorizedError sem token', () => {
    const req = makeRequest();
    expect(() => requireAdmin(req)).toThrow(UnauthorizedError);
  });
});
