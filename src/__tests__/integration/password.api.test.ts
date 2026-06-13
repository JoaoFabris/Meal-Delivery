import { POST as forgotPassword } from '@/app/api/password/forgot/route';
import { POST as resetPassword } from '@/app/api/password/reset/route';
import { NextRequest } from 'next/server';

// ── Tipo auxiliar para a resposta mockada ──────────────────
interface MockResponse {
  body: any;
  status: number;
}

// ── Mocks ─────────────────────────────────────────────────
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      updateMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/email', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('nova_senha_hash'),
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    })),
  },
}));

const { sendPasswordResetEmail } = require('@/lib/email');
const { prisma } = require('@/lib/prisma');
const mockUser = prisma.user as { findUnique: jest.Mock };
const mockToken = prisma.passwordResetToken as {
  updateMany: jest.Mock;
  create: jest.Mock;
  findUnique: jest.Mock;
  update: jest.Mock;
};

function makeRequest(body: object): NextRequest {
  return { json: jest.fn().mockResolvedValue(body) } as unknown as NextRequest;
}

// ── Fixtures ──────────────────────────────────────────────
const userFixture = {
  id: 'user-1',
  email: 'joao@test.com',
  password: 'senha_hash',
  name: 'João',
  role: 'USER',
};

const tokenFixture = {
  id: 'token-1',
  email: 'joao@test.com',
  token: 'token-valido-abc123',
  expiresAt: new Date(Date.now() + 1000 * 60 * 60), // expira em 1h
  used: false,
  createdAt: new Date(),
};

describe('POST /api/password/forgot', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve retornar 200 com mensagem genérica para e-mail existente', async () => {
    mockUser.findUnique.mockResolvedValue(userFixture);
    mockToken.updateMany.mockResolvedValue({ count: 0 });
    mockToken.create.mockResolvedValue(tokenFixture);

    const req = makeRequest({ email: 'joao@test.com' });
    const response = (await forgotPassword(req)) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('instruções');
    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
  });

  it('deve retornar 200 mesmo para e-mail não cadastrado (segurança)', async () => {
    mockUser.findUnique.mockResolvedValue(null);

    const req = makeRequest({ email: 'naoexiste@test.com' });
    const response = (await forgotPassword(req)) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('deve retornar 200 para usuário OAuth sem senha local', async () => {
    mockUser.findUnique.mockResolvedValue({ ...userFixture, password: null });

    const req = makeRequest({ email: 'oauth@test.com' });
    const response = (await forgotPassword(req)) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('deve retornar 400 para e-mail inválido', async () => {
    const req = makeRequest({ email: 'nao-e-email' });
    const response = (await forgotPassword(req)) as unknown as MockResponse;
    expect(response.status).toBe(400);
  });

  it('deve invalidar tokens anteriores antes de criar novo', async () => {
    mockUser.findUnique.mockResolvedValue(userFixture);
    mockToken.updateMany.mockResolvedValue({ count: 1 });
    mockToken.create.mockResolvedValue(tokenFixture);

    const req = makeRequest({ email: 'joao@test.com' });
    await forgotPassword(req);

    expect(mockToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'joao@test.com', used: false },
        data: { used: true },
      }),
    );
  });
});

describe('POST /api/password/reset', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve redefinir senha com token válido', async () => {
    mockToken.findUnique.mockResolvedValue(tokenFixture);
    prisma.$transaction.mockResolvedValue([{}, {}]);

    const req = makeRequest({
      token: 'token-valido-abc123',
      password: 'novasenha123',
    });
    const response = (await resetPassword(req)) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('sucesso');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('deve retornar 404 para token inexistente', async () => {
    mockToken.findUnique.mockResolvedValue(null);

    const req = makeRequest({
      token: 'token-inexistente',
      password: 'novasenha123',
    });
    const response = (await resetPassword(req)) as unknown as MockResponse;

    expect(response.status).toBe(404);
  });

  it('deve retornar 400 para token já utilizado', async () => {
    mockToken.findUnique.mockResolvedValue({ ...tokenFixture, used: true });

    const req = makeRequest({
      token: 'token-valido-abc123',
      password: 'novasenha123',
    });
    const response = (await resetPassword(req)) as unknown as MockResponse;

    expect(response.status).toBe(400);
    expect(response.body.error.message).toContain('utilizado');
  });

  it('deve retornar 400 para token expirado', async () => {
    mockToken.findUnique.mockResolvedValue({
      ...tokenFixture,
      expiresAt: new Date(Date.now() - 1000), // expirado
    });

    const req = makeRequest({
      token: 'token-valido-abc123',
      password: 'novasenha123',
    });
    const response = (await resetPassword(req)) as unknown as MockResponse;

    expect(response.status).toBe(400);
    expect(response.body.error.message).toContain('expirou');
  });

  it('deve retornar 400 para senha muito curta', async () => {
    const req = makeRequest({ token: 'token-valido-abc123', password: '123' });
    const response = (await resetPassword(req)) as unknown as MockResponse;
    expect(response.status).toBe(400);
  });

  it('deve retornar 400 para token ausente', async () => {
    const req = makeRequest({ password: 'novasenha123' });
    const response = (await resetPassword(req)) as unknown as MockResponse;
    expect(response.status).toBe(400);
  });
});
