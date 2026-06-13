// src/__tests__/unit/auth.config.test.ts

// ── Mocks ANTES de qualquer import ───────────────────────────────────────────
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn((config: unknown) => config),
}));
jest.mock('next-auth/providers/google', () => ({
  __esModule: true,
  default: jest.fn(() => ({ id: 'google' })),
}));
jest.mock('next-auth/providers/github', () => ({
  __esModule: true,
  default: jest.fn(() => ({ id: 'github' })),
}));
jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: jest.fn((c: unknown) => ({ id: 'credentials', ...(c as object) })),
}));
jest.mock('@/lib/prisma', () => ({
  prisma: { user: { findUnique: jest.fn() } },
}));
jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: { compare: jest.fn() },
  compare: jest.fn(),
}));

type AuthConfig = {
  providers: { id: string; authorize?: (c: unknown) => Promise<unknown> }[];
  callbacks: {
    jwt: (args: {
      token: Record<string, unknown>;
      user?: Record<string, unknown>;
    }) => Promise<Record<string, unknown>>;
    session: (args: {
      session: { user?: Record<string, unknown> };
      token: Record<string, unknown>;
    }) => Promise<{ user?: Record<string, unknown> }>;
  };
  session: { strategy: string };
  pages: { signIn: string };
};

type LoadedAuth = {
  cfg: AuthConfig;
  findUniqueMock: jest.Mock;
  compareMock: jest.Mock;
};

/**
 * Recarrega @/lib/auth em isolamento e retorna a config + os mocks
 * corretos do mesmo contexto de módulo, garantindo que authorize usa
 * exatamente os mesmos mocks que vamos controlar nos testes.
 */
function loadAuth(): LoadedAuth {
  let result: LoadedAuth | null = null;

  jest.isolateModules(() => {
    // Captura a config passada ao NextAuth neste isolamento
    const NextAuth = require('next-auth').default as jest.Mock;
    NextAuth.mockImplementationOnce((c: unknown) => c);

    // Carrega o módulo real — dispara a chamada ao NextAuth mockado
    require('@/lib/auth');

    // NextAuth foi chamado com a config: recuperamos o argumento
    const cfg = NextAuth.mock.calls[
      NextAuth.mock.calls.length - 1
    ][0] as AuthConfig;

    // Obtém os mocks do MESMO contexto de módulo que o authorize vai usar
    const findUniqueMock = require('@/lib/prisma').prisma.user
      .findUnique as jest.Mock;
    const compareMock = require('bcryptjs').default.compare as jest.Mock;

    result = { cfg, findUniqueMock, compareMock };
  });

  if (!result) throw new Error('loadAuth falhou — verifique @/lib/auth');
  return result;
}

// ─── Estrutura geral ──────────────────────────────────────────────────────────

describe('NextAuth config — estrutura', () => {
  let cfg: AuthConfig;

  beforeAll(() => {
    cfg = loadAuth().cfg;
  });

  it('config contém os três providers', () => {
    const ids = cfg.providers.map((p) => p.id);
    expect(ids).toContain('google');
    expect(ids).toContain('github');
    expect(ids).toContain('credentials');
  });

  it('session strategy é jwt', () => {
    expect(cfg.session.strategy).toBe('jwt');
  });

  it('página de login é /login', () => {
    expect(cfg.pages.signIn).toBe('/login');
  });

  it('possui callbacks jwt e session', () => {
    expect(typeof cfg.callbacks.jwt).toBe('function');
    expect(typeof cfg.callbacks.session).toBe('function');
  });
});

// ─── Credentials — authorize ──────────────────────────────────────────────────

describe('Credentials authorize', () => {
  let authorize: (credentials: unknown) => Promise<unknown>;
  let findUniqueMock: jest.Mock;
  let compareMock: jest.Mock;

  beforeAll(() => {
    // Tudo vem do MESMO isolateModules — mocks e authorize compartilham o contexto
    const loaded = loadAuth();
    const credProvider = loaded.cfg.providers.find(
      (p) => p.id === 'credentials',
    );
    if (!credProvider?.authorize) throw new Error('authorize não encontrado');
    authorize = credProvider.authorize;
    findUniqueMock = loaded.findUniqueMock;
    compareMock = loaded.compareMock;
  });

  beforeEach(() => {
    findUniqueMock.mockReset();
    compareMock.mockReset();
  });

  it('retorna null para email inválido', async () => {
    expect(
      await authorize({ email: 'nao-e-email', password: '123456' }),
    ).toBeNull();
  });

  it('retorna null para senha curta (< 6 chars)', async () => {
    expect(await authorize({ email: 'a@b.com', password: '123' })).toBeNull();
  });

  it('retorna null quando usuário não existe', async () => {
    findUniqueMock.mockResolvedValueOnce(null);
    expect(
      await authorize({ email: 'a@b.com', password: '123456' }),
    ).toBeNull();
  });

  it('retorna null quando usuário não tem senha (OAuth)', async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: '1',
      name: 'João',
      email: 'a@b.com',
      role: 'USER',
      password: null,
    });
    expect(
      await authorize({ email: 'a@b.com', password: '123456' }),
    ).toBeNull();
  });

  it('retorna null quando senha não confere', async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: '1',
      name: 'João',
      email: 'a@b.com',
      role: 'USER',
      password: '$hash',
    });
    compareMock.mockResolvedValueOnce(false);
    expect(await authorize({ email: 'a@b.com', password: 'wrong' })).toBeNull();
  });

  it('retorna usuário quando credenciais estão corretas', async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: 'u1',
      name: 'João',
      email: 'joao@b.com',
      role: 'USER',
      password: '$hash',
    });
    compareMock.mockResolvedValueOnce(true);
    expect(
      await authorize({ email: 'joao@b.com', password: 'senha123' }),
    ).toEqual({
      id: 'u1',
      name: 'João',
      email: 'joao@b.com',
      role: 'USER',
    });
  });

  it('não expõe o campo password no retorno', async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: 'u1',
      name: 'João',
      email: 'joao@b.com',
      role: 'USER',
      password: '$hash',
    });
    compareMock.mockResolvedValueOnce(true);
    const result = (await authorize({
      email: 'joao@b.com',
      password: 'senha123',
    })) as Record<string, unknown>;
    expect(result).not.toHaveProperty('password');
  });
});

// ─── JWT callback ─────────────────────────────────────────────────────────────

describe('JWT callback', () => {
  let jwtCallback: AuthConfig['callbacks']['jwt'];

  beforeAll(() => {
    jwtCallback = loadAuth().cfg.callbacks.jwt;
  });

  it('adiciona role ao token quando user está presente', async () => {
    const result = await jwtCallback({
      token: { email: 'a@b.com' },
      user: { role: 'ADMIN' },
    });
    expect(result.role).toBe('ADMIN');
  });

  it('usa USER como role padrão quando user não tem role', async () => {
    const result = await jwtCallback({ token: { email: 'a@b.com' }, user: {} });
    expect(result.role).toBe('USER');
  });

  it('não altera role quando user ausente (refresh de token)', async () => {
    const result = await jwtCallback({
      token: { email: 'a@b.com', role: 'ADMIN' },
    });
    expect(result.role).toBe('ADMIN');
  });

  it('sempre adiciona isAdmin ao token', async () => {
    const result = await jwtCallback({ token: { email: 'x@b.com' } });
    expect(result).toHaveProperty('isAdmin');
    expect(typeof result.isAdmin).toBe('boolean');
  });
});

// ─── Session callback ─────────────────────────────────────────────────────────

describe('Session callback', () => {
  let sessionCallback: AuthConfig['callbacks']['session'];

  beforeAll(() => {
    sessionCallback = loadAuth().cfg.callbacks.session;
  });

  it('propaga isAdmin e role do token para a sessão', async () => {
    const result = await sessionCallback({
      session: { user: { name: 'João' } },
      token: { isAdmin: true, role: 'ADMIN' },
    });
    expect(result.user?.isAdmin).toBe(true);
    expect(result.user?.role).toBe('ADMIN');
  });

  it('não falha quando session.user é undefined', async () => {
    const result = await sessionCallback({
      session: {},
      token: { isAdmin: false, role: 'USER' },
    });
    expect(result).toBeDefined();
  });
});
