import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { NextRequest } from 'next/server';

// ── Tipo auxiliar para a resposta mockada ──────────────────
interface MockResponse {
  body: any;
  status: number;
  json: () => Promise<any>;
}

// ── Mock do Prisma ────────────────────────────────────────
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// ── Mock do bcrypt ────────────────────────────────────────
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_mock'),
  compare: jest.fn(),
}));

// ── Mock do NextResponse ──────────────────────────────────
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

const { prisma } = require('@/lib/prisma');
const mockPrismaUser = prisma.user as {
  findUnique: jest.Mock;
  create: jest.Mock;
};

// ── Helper para criar requisição fake ────────────────────
function makeRequest(body: object): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

// ── Fixtures ──────────────────────────────────────────────
const userFixture = {
  id: 'user-123',
  name: 'João Silva',
  email: 'joao@test.com',
  password: 'hashed_password_mock',
  role: 'USER' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve registrar um novo usuário e retornar 201 com token', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null); // e-mail não existe
    mockPrismaUser.create.mockResolvedValue({
      id: userFixture.id,
      name: userFixture.name,
      email: userFixture.email,
      role: userFixture.role,
      createdAt: userFixture.createdAt,
    });

    const req = makeRequest({
      name: 'João Silva',
      email: 'joao@test.com',
      password: 'senha123',
    });

    const response = (await registerHandler(req)) as unknown as MockResponse;

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      message: expect.stringContaining('registrado'),
      token: expect.any(String),
    });
  });

  it('deve retornar 409 para e-mail já cadastrado', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(userFixture); // e-mail já existe

    const req = makeRequest({
      name: 'Outro',
      email: 'joao@test.com',
      password: 'senha123',
    });

    const response = (await registerHandler(req)) as unknown as MockResponse;
    expect(response.status).toBe(409);
    expect(response.body.error.type).toBe('CONFLICT');
  });

  it('deve retornar 400 para dados inválidos (e-mail sem @)', async () => {
    const req = makeRequest({
      name: 'João',
      email: 'nao-e-email',
      password: 'senha123',
    });

    const response = (await registerHandler(req)) as unknown as MockResponse;
    expect(response.status).toBe(400);
    expect(response.body.error.type).toBe('VALIDATION_ERROR');
  });

  it('deve retornar 400 para senha muito curta', async () => {
    const req = makeRequest({
      name: 'João',
      email: 'joao@test.com',
      password: '123',
    });

    const response = (await registerHandler(req)) as unknown as MockResponse;
    expect(response.status).toBe(400);
  });

  it('deve retornar 400 para nome muito curto', async () => {
    const req = makeRequest({
      name: 'J',
      email: 'joao@test.com',
      password: 'senha123',
    });

    const response = (await registerHandler(req)) as unknown as MockResponse;
    expect(response.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  const bcrypt = require('bcryptjs');
  beforeEach(() => jest.clearAllMocks());

  it('deve fazer login com credenciais válidas e retornar token', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(userFixture);
    bcrypt.compare.mockResolvedValue(true);

    const req = makeRequest({ email: 'joao@test.com', password: 'senha123' });
    const response = (await loginHandler(req)) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: expect.stringContaining('sucesso'),
      token: expect.any(String),
      user: expect.objectContaining({ email: 'joao@test.com' }),
    });
  });

  it('deve retornar 401 para e-mail não cadastrado', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null);

    const req = makeRequest({
      email: 'naoexiste@test.com',
      password: 'senha123',
    });
    const response = (await loginHandler(req)) as unknown as MockResponse;

    expect(response.status).toBe(401);
    expect(response.body.error.type).toBe('UNAUTHORIZED');
  });

  it('deve retornar 401 para senha incorreta', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(userFixture);
    bcrypt.compare.mockResolvedValue(false);

    const req = makeRequest({
      email: 'joao@test.com',
      password: 'senhaerrada',
    });
    const response = (await loginHandler(req)) as unknown as MockResponse;

    expect(response.status).toBe(401);
  });

  it('deve retornar 401 para usuário OAuth sem senha local', async () => {
    mockPrismaUser.findUnique.mockResolvedValue({
      ...userFixture,
      password: null,
    });

    const req = makeRequest({ email: 'joao@test.com', password: 'senha123' });
    const response = (await loginHandler(req)) as unknown as MockResponse;

    expect(response.status).toBe(401);
    expect(response.body.error.message).toContain('OAuth');
  });

  it('deve retornar 400 para e-mail inválido', async () => {
    const req = makeRequest({ email: 'invalido', password: 'senha123' });
    const response = (await loginHandler(req)) as unknown as MockResponse;
    expect(response.status).toBe(400);
  });
});
