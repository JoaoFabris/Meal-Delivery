import type { Config } from 'jest';

const config: Config = {
  projects: [
    // ── Testes de back-end (Node) ──────────────────────────
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: [
        '<rootDir>/src/__tests__/unit',
        '<rootDir>/src/__tests__/integration',
      ],
      testMatch: ['**/*.test.ts'],
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
    // ── Testes de front-end (jsdom) ────────────────────────
    {
      displayName: 'frontend',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/src/__tests__/components'],
      testMatch: ['**/*.test.tsx'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$':
          '<rootDir>/src/__tests__/__mocks__/styleMock.ts',
        '\\.(jpg|jpeg|png|gif|svg|ico)$':
          '<rootDir>/src/__tests__/__mocks__/fileMock.ts',
      },
      setupFilesAfterEnv: [
        '<rootDir>/jest.setup.ts',
        '<rootDir>/jest.setup.dom.ts',
      ],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
      },
    },
  ],

  collectCoverageFrom: [
    'src/lib/**/*.ts',
    'src/app/api/**/*.ts',
    'src/components/**/*.tsx',
    '!src/components/ui/**',
    '!src/lib/store/**',
    '!src/lib/api/mealdb.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};

export default config;
