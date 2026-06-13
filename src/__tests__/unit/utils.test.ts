// src/__tests__/unit/utils.test.ts

import { cn, formatPrice, truncate } from '@/lib/utils';

// ─── cn (className merger) ──────────────────────────────────────────────────

describe('cn', () => {
  it('combina classes simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('ignora valores falsy (undefined, null, false)', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar');
  });

  it('resolve conflitos Tailwind — último vence', () => {
    // p-2 vs p-4: tailwind-merge deve manter apenas p-4
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('resolve conflitos de cores Tailwind', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('suporta objetos condicionais', () => {
    expect(cn({ 'font-bold': true, italic: false })).toBe('font-bold');
  });

  it('suporta arrays de classes', () => {
    expect(cn(['flex', 'items-center'])).toBe('flex items-center');
  });

  it('retorna string vazia quando não há classes válidas', () => {
    expect(cn()).toBe('');
    expect(cn(undefined, false, null)).toBe('');
  });

  it('combina classes condicionais e estáticas', () => {
    const isActive = true;
    expect(cn('base', { active: isActive, disabled: false })).toBe(
      'base active',
    );
  });
});

// ─── formatPrice ────────────────────────────────────────────────────────────

describe('formatPrice', () => {
  it('formata valor inteiro em BRL', () => {
    const result = formatPrice(100);
    expect(result).toContain('100');
    expect(result).toMatch(/R\$/);
  });

  it('formata valor decimal com duas casas', () => {
    const result = formatPrice(28.9);
    expect(result).toContain('28');
    expect(result).toContain('90');
  });

  it('formata zero', () => {
    const result = formatPrice(0);
    expect(result).toContain('0');
    expect(result).toMatch(/R\$/);
  });

  it('formata valores grandes com separador de milhar', () => {
    const result = formatPrice(1000);
    // pt-BR usa ponto como separador de milhar: 1.000,00
    expect(result).toContain('1');
    expect(result).toContain('000');
  });

  it('formata valores negativos', () => {
    const result = formatPrice(-50);
    expect(result).toContain('50');
  });

  it('formata valor com muitas casas decimais arredondando', () => {
    const result = formatPrice(9.999);
    // Deve arredondar para 10,00
    expect(result).toContain('10');
  });
});

// ─── truncate ───────────────────────────────────────────────────────────────

describe('truncate', () => {
  it('retorna o texto original quando menor que maxLength', () => {
    expect(truncate('Olá', 10)).toBe('Olá');
  });

  it('retorna o texto original quando igual a maxLength', () => {
    expect(truncate('abcde', 5)).toBe('abcde');
  });

  it('trunca e adiciona reticências quando maior que maxLength', () => {
    const result = truncate('Texto muito longo aqui', 10);
    expect(result.endsWith('…')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(11); // 10 chars + '…'
  });

  it('remove espaços antes das reticências (trimEnd)', () => {
    // 'Olá mu' tem espaço no final antes do corte
    const result = truncate('Olá mundo', 6);
    expect(result).not.toMatch(/ …$/);
    expect(result.endsWith('…')).toBe(true);
  });

  it('funciona com string vazia', () => {
    expect(truncate('', 5)).toBe('');
  });

  it('funciona com maxLength zero', () => {
    const result = truncate('abc', 0);
    expect(result).toBe('…');
  });

  it('funciona com maxLength 1', () => {
    const result = truncate('abc', 1);
    expect(result.endsWith('…')).toBe(true);
  });

  it('preserva texto com caracteres especiais sem truncar', () => {
    const text = 'Maçã';
    expect(truncate(text, 10)).toBe(text);
  });
});
