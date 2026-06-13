// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  transformIgnorePatterns: [
    'node_modules/(?!(next-auth|@auth\\/core|oauth4webapi|@panva)/)',
  ],

  collectCoverageFrom: [
    'src/lib/**/*.ts',
    'src/app/api/**/*.ts',
    '!src/**/*.d.ts',
    // Excluídos: dependem de infra externa e não têm lógica de negócio testável
    '!src/lib/store/**/*.ts', // Zustand (client-side only)
    '!src/lib/prisma.ts', // Singleton de conexão
    '!src/lib/email.ts', // Serviço externo Resend
    '!src/lib/api/mealdb.ts', // API externa
    '!src/app/api/auth/[...nextauth]/route.ts', // Handler NextAuth
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};

export default config;
