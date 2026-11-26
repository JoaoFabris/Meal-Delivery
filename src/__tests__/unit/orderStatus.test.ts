import { ALLOWED_TRANSITIONS, canTransition, isOrderStatus, ORDER_STATUSES } from '@/lib/orderStatus';

describe('orderStatus — regras de transição', () => {
  it('reconhece apenas os status válidos', () => {
    ORDER_STATUSES.forEach((s) => expect(isOrderStatus(s)).toBe(true));
    expect(isOrderStatus('READY')).toBe(false);
    expect(isOrderStatus(undefined)).toBe(false);
    expect(isOrderStatus(42)).toBe(false);
  });

  it('permite o fluxo para frente', () => {
    expect(canTransition('PENDING', 'CONFIRMED')).toBe(true);
    expect(canTransition('CONFIRMED', 'PREPARING')).toBe(true);
    expect(canTransition('CONFIRMED', 'DELIVERED')).toBe(true);
    expect(canTransition('PREPARING', 'DELIVERED')).toBe(true);
  });

  it('permite cancelar enquanto o pedido não foi entregue', () => {
    expect(canTransition('PENDING', 'CANCELLED')).toBe(true);
    expect(canTransition('CONFIRMED', 'CANCELLED')).toBe(true);
    expect(canTransition('PREPARING', 'CANCELLED')).toBe(true);
  });

  it('não permite voltar o status nem sair de um status final', () => {
    expect(canTransition('CONFIRMED', 'PENDING')).toBe(false);
    expect(canTransition('DELIVERED', 'CONFIRMED')).toBe(false);
    expect(canTransition('DELIVERED', 'CANCELLED')).toBe(false);
    expect(canTransition('CANCELLED', 'CONFIRMED')).toBe(false);
    expect(ALLOWED_TRANSITIONS.DELIVERED).toHaveLength(0);
    expect(ALLOWED_TRANSITIONS.CANCELLED).toHaveLength(0);
  });

  it('não permite transição para o mesmo status', () => {
    ORDER_STATUSES.forEach((s) => expect(canTransition(s, s)).toBe(false));
  });
});
