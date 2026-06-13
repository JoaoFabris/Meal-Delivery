import { GET as getMeals, POST as createMeal } from '@/app/api/meals/route';
import {
  GET as getMeal,
  PUT as updateMeal,
  DELETE as deleteMeal,
} from '@/app/api/meals/[id]/route';
import { NextRequest } from 'next/server';
import { generateToken } from '@/lib/middleware/auth';

// ── Tipo auxiliar para a resposta mockada ──────────────────
interface MockResponse {
  body: any;
  status: number;
  json: () => Promise<any>;
}

// ── Mock do Prisma ────────────────────────────────────────
jest.mock('@/lib/prisma', () => ({
  prisma: {
    meal: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

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
const mockMeal = prisma.meal as {
  findMany: jest.Mock;
  findUnique: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

// ── Fixtures ──────────────────────────────────────────────
const mealFixture = {
  id: 'meal-1',
  name: 'X-Burguer Clássico',
  description: 'Hambúrguer artesanal',
  price: 28.9,
  category: 'Burgers',
  imageUrl: 'https://exemplo.com/img.jpg',
  available: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

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

function makeRequest(opts: {
  body?: object;
  token?: string;
  searchParams?: Record<string, string>;
}): NextRequest {
  const url = new URL('http://localhost:3000/api/meals');
  if (opts.searchParams) {
    Object.entries(opts.searchParams).forEach(([k, v]) =>
      url.searchParams.set(k, v),
    );
  }
  return {
    json: jest.fn().mockResolvedValue(opts.body ?? {}),
    headers: {
      get: (key: string) =>
        key === 'authorization' && opts.token ? `Bearer ${opts.token}` : null,
    },
    url: url.toString(),
  } as unknown as NextRequest;
}

describe('GET /api/meals', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve listar todos os pratos disponíveis', async () => {
    mockMeal.findMany.mockResolvedValue([mealFixture]);
    const req = makeRequest({});
    const response = (await getMeals(req)) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(response.body.meals).toHaveLength(1);
    expect(response.body.total).toBe(1);
  });

  it('deve retornar lista vazia quando não há pratos', async () => {
    mockMeal.findMany.mockResolvedValue([]);
    const req = makeRequest({});
    const response = (await getMeals(req)) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(response.body.meals).toHaveLength(0);
    expect(response.body.total).toBe(0);
  });

  it('deve filtrar por categoria via query param', async () => {
    mockMeal.findMany.mockResolvedValue([mealFixture]);
    const req = makeRequest({ searchParams: { category: 'Burgers' } });
    await getMeals(req);

    expect(mockMeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'Burgers' }),
      }),
    );
  });

  it('deve filtrar por disponibilidade via query param', async () => {
    mockMeal.findMany.mockResolvedValue([mealFixture]);
    const req = makeRequest({ searchParams: { available: 'true' } });
    await getMeals(req);

    expect(mockMeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ available: true }),
      }),
    );
  });
});

describe('POST /api/meals', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve criar prato com token de admin', async () => {
    mockMeal.create.mockResolvedValue(mealFixture);
    const req = makeRequest({
      token: adminToken,
      body: {
        name: 'Novo Prato',
        price: 35.9,
        category: 'Chicken',
        available: true,
      },
    });
    const response = (await createMeal(req)) as unknown as MockResponse;

    expect(response.status).toBe(201);
    expect(response.body.message).toContain('criado');
  });

  it('deve retornar 403 para usuário comum tentando criar prato', async () => {
    const req = makeRequest({
      token: userToken,
      body: { name: 'Prato', price: 10, category: 'Cat' },
    });
    const response = (await createMeal(req)) as unknown as MockResponse;
    expect(response.status).toBe(403);
  });

  it('deve retornar 401 sem token', async () => {
    const req = makeRequest({
      body: { name: 'Prato', price: 10, category: 'Cat' },
    });
    const response = (await createMeal(req)) as unknown as MockResponse;
    expect(response.status).toBe(401);
  });

  it('deve retornar 400 para dados inválidos (preço negativo)', async () => {
    const req = makeRequest({
      token: adminToken,
      body: { name: 'Prato', price: -5, category: 'Cat' },
    });
    const response = (await createMeal(req)) as unknown as MockResponse;
    expect(response.status).toBe(400);
  });
});

describe('GET /api/meals/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve retornar prato por ID', async () => {
    mockMeal.findUnique.mockResolvedValue(mealFixture);
    const req = makeRequest({});
    const response = (await getMeal(req, {
      params: Promise.resolve({ id: 'meal-1' }),
    })) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(response.body.meal.id).toBe('meal-1');
  });

  it('deve retornar 404 para prato inexistente', async () => {
    mockMeal.findUnique.mockResolvedValue(null);
    const req = makeRequest({});
    const response = (await getMeal(req, {
      params: Promise.resolve({ id: 'inexistente' }),
    })) as unknown as MockResponse;

    expect(response.status).toBe(404);
    expect(response.body.error.type).toBe('NOT_FOUND');
  });
});

describe('PUT /api/meals/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve atualizar prato com token de admin', async () => {
    mockMeal.findUnique.mockResolvedValue(mealFixture);
    mockMeal.update.mockResolvedValue({ ...mealFixture, price: 39.9 });

    const req = makeRequest({ token: adminToken, body: { price: 39.9 } });
    const response = (await updateMeal(req, {
      params: Promise.resolve({ id: 'meal-1' }),
    })) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('atualizado');
  });

  it('deve retornar 404 para prato inexistente', async () => {
    mockMeal.findUnique.mockResolvedValue(null);
    const req = makeRequest({ token: adminToken, body: { price: 39.9 } });
    const response = (await updateMeal(req, {
      params: Promise.resolve({ id: 'inexistente' }),
    })) as unknown as MockResponse;

    expect(response.status).toBe(404);
  });

  it('deve retornar 403 para usuário comum', async () => {
    const req = makeRequest({ token: userToken, body: { price: 39.9 } });
    const response = (await updateMeal(req, {
      params: Promise.resolve({ id: 'meal-1' }),
    })) as unknown as MockResponse;
    expect(response.status).toBe(403);
  });
});

describe('DELETE /api/meals/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve deletar prato com token de admin', async () => {
    mockMeal.findUnique.mockResolvedValue(mealFixture);
    mockMeal.delete.mockResolvedValue(mealFixture);

    const req = makeRequest({ token: adminToken });
    const response = (await deleteMeal(req, {
      params: Promise.resolve({ id: 'meal-1' }),
    })) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('removido');
  });

  it('deve retornar 401 sem token', async () => {
    const req = makeRequest({});
    const response = (await deleteMeal(req, {
      params: Promise.resolve({ id: 'meal-1' }),
    })) as unknown as MockResponse;
    expect(response.status).toBe(401);
  });

  it('deve retornar 404 para prato inexistente', async () => {
    mockMeal.findUnique.mockResolvedValue(null);
    const req = makeRequest({ token: adminToken });
    const response = (await deleteMeal(req, {
      params: Promise.resolve({ id: 'inexistente' }),
    })) as unknown as MockResponse;
    expect(response.status).toBe(404);
  });
});
