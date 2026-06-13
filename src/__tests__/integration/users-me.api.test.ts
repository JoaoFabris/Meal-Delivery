import { GET as getMe, PUT as updateMe } from '@/app/api/users/me/route';
import { NextRequest } from 'next/server';
import { generateToken } from '@/lib/middleware/auth';

interface MockResponse {
  body: any;
  status: number;
}

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
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

const { prisma } = require('@/lib/prisma');
const mockUser = prisma.user as { findUnique: jest.Mock; update: jest.Mock };

const userToken = generateToken({
  userId: 'user-1',
  email: 'user@test.com',
  role: 'USER',
});

const userFixture = {
  id: 'user-1',
  name: 'João',
  email: 'joao@test.com',
  role: 'USER',
  createdAt: new Date(),
  _count: { orders: 3, favorites: 5 },
};

function makeRequest(opts: { body?: object; token?: string }): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(opts.body ?? {}),
    headers: {
      get: (key: string) =>
        key === 'authorization' && opts.token ? `Bearer ${opts.token}` : null,
    },
  } as unknown as NextRequest;
}

describe('GET /api/users/me', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve retornar o perfil do usuário autenticado', async () => {
    mockUser.findUnique.mockResolvedValue(userFixture);

    const req = makeRequest({ token: userToken });
    const response = (await getMe(req)) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe('user-1');
  });

  it('deve retornar 404 se usuário não existir', async () => {
    mockUser.findUnique.mockResolvedValue(null);

    const req = makeRequest({ token: userToken });
    const response = (await getMe(req)) as unknown as MockResponse;

    expect(response.status).toBe(404);
  });

  it('deve retornar 401 sem token', async () => {
    const req = makeRequest({});
    const response = (await getMe(req)) as unknown as MockResponse;
    expect(response.status).toBe(401);
  });
});

describe('PUT /api/users/me', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve atualizar nome do usuário', async () => {
    mockUser.update.mockResolvedValue({
      id: 'user-1',
      name: 'João Atualizado',
      email: 'joao@test.com',
      role: 'USER',
      updatedAt: new Date(),
    });

    const req = makeRequest({
      token: userToken,
      body: { name: 'João Atualizado' },
    });
    const response = (await updateMe(req)) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('atualizado');
    expect(response.body.user.name).toBe('João Atualizado');
  });

  it('deve retornar 401 sem token', async () => {
    const req = makeRequest({ body: { name: 'Novo' } });
    const response = (await updateMe(req)) as unknown as MockResponse;
    expect(response.status).toBe(401);
  });

  it('deve retornar 400 para e-mail inválido', async () => {
    const req = makeRequest({ token: userToken, body: { email: 'invalido' } });
    const response = (await updateMe(req)) as unknown as MockResponse;
    expect(response.status).toBe(400);
  });
});
