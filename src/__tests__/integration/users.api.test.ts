import { GET as getUsers } from '@/app/api/users/route';
import { NextRequest } from 'next/server';
import { generateToken } from '@/lib/middleware/auth';

interface MockResponse {
  body: any;
  status: number;
}

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
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
const mockUser = prisma.user as { findMany: jest.Mock };

const adminToken = generateToken({
  userId: 'admin-1',
  email: 'admin@test.com',
  role: 'ADMIN',
});
const userToken = generateToken({
  userId: 'user-1',
  email: 'user@test.com',
  role: 'USER',
});

function makeRequest(token?: string): NextRequest {
  return {
    headers: {
      get: (key: string) =>
        key === 'authorization' && token ? `Bearer ${token}` : null,
    },
  } as unknown as NextRequest;
}

describe('GET /api/users', () => {
  beforeEach(() => jest.clearAllMocks());

  it('admin deve listar todos os usuários', async () => {
    mockUser.findMany.mockResolvedValue([
      {
        id: 'user-1',
        name: 'João',
        email: 'joao@test.com',
        role: 'USER',
        createdAt: new Date(),
        _count: { orders: 2 },
      },
    ]);

    const req = makeRequest(adminToken);
    const response = (await getUsers(req)) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(1);
    expect(response.body.total).toBe(1);
  });

  it('deve retornar 403 para usuário comum', async () => {
    const req = makeRequest(userToken);
    const response = (await getUsers(req)) as unknown as MockResponse;
    expect(response.status).toBe(403);
  });

  it('deve retornar 401 sem token', async () => {
    const req = makeRequest();
    const response = (await getUsers(req)) as unknown as MockResponse;
    expect(response.status).toBe(401);
  });
});
