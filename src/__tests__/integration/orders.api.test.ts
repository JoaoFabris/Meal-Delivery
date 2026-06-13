import { GET as getOrders, POST as createOrder } from '@/app/api/orders/route';
import {
  GET as getOrder,
  PUT as updateOrder,
} from '@/app/api/orders/[id]/route';
import { NextRequest } from 'next/server';
import { generateToken } from '@/lib/middleware/auth';

// ── Tipo auxiliar para a resposta mockada ──────────────────
interface MockResponse {
  body: any;
  status: number;
}

// ── Mocks ─────────────────────────────────────────────────
jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    meal: {
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
const mockOrder = prisma.order as {
  findMany: jest.Mock;
  findUnique: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
};
const mockMeal = prisma.meal as {
  findMany: jest.Mock;
};

// ── Fixtures ──────────────────────────────────────────────
const userToken = generateToken({
  userId: 'user-1',
  email: 'user@test.com',
  role: 'USER',
});
const adminToken = generateToken({
  userId: 'admin-1',
  email: 'admin@test.com',
  role: 'ADMIN',
});

const orderFixture = {
  id: 'order-1',
  userId: 'user-1',
  status: 'PENDING',
  total: 57.8,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: 'user-1', name: 'João', email: 'user@test.com' },
  items: [
    {
      id: 'item-1',
      quantity: 2,
      price: 28.9,
      meal: { id: 'meal-1', name: 'X-Burguer', imageUrl: null, price: 28.9 },
    },
  ],
};

const mealFixture = {
  id: 'meal-1',
  name: 'X-Burguer',
  price: 28.9,
  available: true,
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

describe('GET /api/orders', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve listar pedidos do usuário autenticado', async () => {
    mockOrder.findMany.mockResolvedValue([orderFixture]);
    const req = makeRequest({ token: userToken });
    const response = (await getOrders(req)) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(response.body.orders).toHaveLength(1);
    expect(response.body.total).toBe(1);
  });

  it('deve retornar 401 sem token', async () => {
    const req = makeRequest({});
    const response = (await getOrders(req)) as unknown as MockResponse;
    expect(response.status).toBe(401);
  });

  it('admin deve ver todos os pedidos (where vazio)', async () => {
    mockOrder.findMany.mockResolvedValue([orderFixture]);
    const req = makeRequest({ token: adminToken });
    await getOrders(req);

    expect(mockOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it('usuário comum deve ver apenas seus pedidos (where com userId)', async () => {
    mockOrder.findMany.mockResolvedValue([orderFixture]);
    const req = makeRequest({ token: userToken });
    await getOrders(req);

    expect(mockOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
  });
});

describe('POST /api/orders', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve criar pedido e calcular total automaticamente', async () => {
    mockMeal.findMany.mockResolvedValue([mealFixture]);
    mockOrder.create.mockResolvedValue(orderFixture);

    const req = makeRequest({
      token: userToken,
      body: { items: [{ mealId: 'meal-1', quantity: 2 }] },
    });
    const response = (await createOrder(req)) as unknown as MockResponse;

    expect(response.status).toBe(201);
    expect(response.body.message).toContain('criado');
  });

  it('deve retornar 401 sem token', async () => {
    const req = makeRequest({
      body: { items: [{ mealId: 'meal-1', quantity: 1 }] },
    });
    const response = (await createOrder(req)) as unknown as MockResponse;
    expect(response.status).toBe(401);
  });

  it('deve retornar 400 para lista de itens vazia', async () => {
    const req = makeRequest({ token: userToken, body: { items: [] } });
    const response = (await createOrder(req)) as unknown as MockResponse;
    expect(response.status).toBe(400);
  });

  it('deve retornar 400 para prato indisponível', async () => {
    mockMeal.findMany.mockResolvedValue([]); // nenhum prato encontrado/disponível

    const req = makeRequest({
      token: userToken,
      body: { items: [{ mealId: 'prato-inexistente', quantity: 1 }] },
    });
    const response = (await createOrder(req)) as unknown as MockResponse;
    expect(response.status).toBe(400);
  });
});

describe('GET /api/orders/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve retornar pedido do próprio usuário', async () => {
    mockOrder.findUnique.mockResolvedValue(orderFixture);
    const req = makeRequest({ token: userToken });
    const response = (await getOrder(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(response.body.order.id).toBe('order-1');
  });

  it('deve retornar 404 para pedido inexistente', async () => {
    mockOrder.findUnique.mockResolvedValue(null);
    const req = makeRequest({ token: userToken });
    const response = (await getOrder(req, {
      params: Promise.resolve({ id: 'inexistente' }),
    })) as unknown as MockResponse;

    expect(response.status).toBe(404);
  });

  it('deve retornar 403 para usuário tentando ver pedido de outro', async () => {
    const outroUserId = { ...orderFixture, userId: 'outro-user' };
    mockOrder.findUnique.mockResolvedValue(outroUserId);

    const req = makeRequest({ token: userToken });
    const response = (await getOrder(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })) as unknown as MockResponse;

    expect(response.status).toBe(403);
  });

  it('admin deve ver pedido de qualquer usuário', async () => {
    const outroUserId = { ...orderFixture, userId: 'outro-user' };
    mockOrder.findUnique.mockResolvedValue(outroUserId);

    const req = makeRequest({ token: adminToken });
    const response = (await getOrder(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })) as unknown as MockResponse;

    expect(response.status).toBe(200);
  });

  it('deve retornar 401 sem token', async () => {
    const req = makeRequest({});
    const response = (await getOrder(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })) as unknown as MockResponse;
    expect(response.status).toBe(401);
  });
});

describe('PUT /api/orders/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('admin deve atualizar status do pedido', async () => {
    mockOrder.findUnique.mockResolvedValue(orderFixture);
    mockOrder.update.mockResolvedValue({
      ...orderFixture,
      status: 'CONFIRMED',
    });

    const req = makeRequest({
      token: adminToken,
      body: { status: 'CONFIRMED' },
    });
    const response = (await updateOrder(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('atualizado');
  });

  it('deve retornar 400 para status inválido', async () => {
    mockOrder.findUnique.mockResolvedValue(orderFixture);
    const req = makeRequest({
      token: adminToken,
      body: { status: 'INVALIDO' },
    });
    const response = (await updateOrder(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })) as unknown as MockResponse;

    expect(response.status).toBe(400);
  });

  it('deve retornar 401 sem token', async () => {
    const req = makeRequest({ body: { status: 'CONFIRMED' } });
    const response = (await updateOrder(req, {
      params: Promise.resolve({ id: 'order-1' }),
    })) as unknown as MockResponse;
    expect(response.status).toBe(401);
  });
});
