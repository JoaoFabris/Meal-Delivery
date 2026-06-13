jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn((c: unknown) => c),
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

describe('isAdmin', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('deve retornar true para e-mail na lista de admins', () => {
    process.env.ADMIN_EMAILS = 'admin@test.com,outro@test.com';
    const { isAdmin } = require('@/lib/auth');
    expect(isAdmin('admin@test.com')).toBe(true);
  });

  it('deve ser case-insensitive', () => {
    process.env.ADMIN_EMAILS = 'admin@test.com';
    const { isAdmin } = require('@/lib/auth');
    expect(isAdmin('ADMIN@TEST.COM')).toBe(true);
  });

  it('deve retornar false para e-mail fora da lista', () => {
    process.env.ADMIN_EMAILS = 'admin@test.com';
    const { isAdmin } = require('@/lib/auth');
    expect(isAdmin('user@test.com')).toBe(false);
  });

  it('deve retornar false para e-mail nulo ou indefinido', () => {
    process.env.ADMIN_EMAILS = 'admin@test.com';
    const { isAdmin } = require('@/lib/auth');
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});
