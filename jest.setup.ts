import { jest } from '@jest/globals';

// Variáveis de ambiente para testes
process.env.JWT_SECRET = 'test-secret-key-for-jest-testing-only';
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret';
process.env.AUTH_SECRET = 'test-auth-secret';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/foodapp_test';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
