// Setup específico para testes de componentes (ambiente jsdom).
// Adiciona os matchers do @testing-library/jest-dom (toBeInTheDocument, etc.)

import '@testing-library/jest-dom';

// Mock global do next/navigation, usado por quase todos os componentes
// que utilizam useRouter, usePathname, useSearchParams, etc.
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock global do next/image — renderiza como <img> simples
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, jsx-a11y/alt-text
    const React = require('react');
    return React.createElement('img', props);
  },
}));
