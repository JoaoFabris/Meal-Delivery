import {
  registerSchema,
  loginSchema,
  createMealSchema,
  updateMealSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  updateUserSchema,
} from '@/lib/validations';

describe('registerSchema', () => {
  const valid = {
    name: 'João Silva',
    email: 'joao@email.com',
    password: 'senha123',
  };

  it('deve aceitar dados válidos', () => {
    expect(() => registerSchema.parse(valid)).not.toThrow();
  });

  it('deve rejeitar nome com menos de 2 caracteres', () => {
    expect(() => registerSchema.parse({ ...valid, name: 'A' })).toThrow();
  });

  it('deve rejeitar e-mail inválido', () => {
    expect(() =>
      registerSchema.parse({ ...valid, email: 'nao-e-email' }),
    ).toThrow();
  });

  it('deve rejeitar senha com menos de 6 caracteres', () => {
    expect(() => registerSchema.parse({ ...valid, password: '123' })).toThrow();
  });

  it('deve rejeitar campos ausentes', () => {
    expect(() => registerSchema.parse({})).toThrow();
  });
});

describe('loginSchema', () => {
  const valid = { email: 'joao@email.com', password: 'senha123' };

  it('deve aceitar credenciais válidas', () => {
    expect(() => loginSchema.parse(valid)).not.toThrow();
  });

  it('deve rejeitar e-mail inválido', () => {
    expect(() => loginSchema.parse({ ...valid, email: 'invalido' })).toThrow();
  });

  it('deve rejeitar senha vazia', () => {
    expect(() => loginSchema.parse({ ...valid, password: '' })).toThrow();
  });
});

describe('createMealSchema', () => {
  const valid = {
    name: 'X-Burguer',
    price: 28.9,
    category: 'Burgers',
    available: true,
  };

  it('deve aceitar prato válido', () => {
    expect(() => createMealSchema.parse(valid)).not.toThrow();
  });

  it('deve aceitar prato com campos opcionais', () => {
    const withOptionals = {
      ...valid,
      description: 'Delicioso hambúrguer',
      imageUrl: 'https://exemplo.com/img.jpg',
    };
    expect(() => createMealSchema.parse(withOptionals)).not.toThrow();
  });

  it('deve rejeitar preço negativo', () => {
    expect(() => createMealSchema.parse({ ...valid, price: -10 })).toThrow();
  });

  it('deve rejeitar preço zero', () => {
    expect(() => createMealSchema.parse({ ...valid, price: 0 })).toThrow();
  });

  it('deve rejeitar URL de imagem inválida', () => {
    expect(() =>
      createMealSchema.parse({ ...valid, imageUrl: 'nao-e-url' }),
    ).toThrow();
  });

  it('deve rejeitar categoria vazia', () => {
    expect(() => createMealSchema.parse({ ...valid, category: '' })).toThrow();
  });

  it('deve usar available=true como padrão', () => {
    const result = createMealSchema.parse({
      name: 'Prato',
      price: 10,
      category: 'Cat',
    });
    expect(result.available).toBe(true);
  });
});

describe('updateMealSchema', () => {
  it('deve aceitar atualização parcial (só preço)', () => {
    expect(() => updateMealSchema.parse({ price: 35.9 })).not.toThrow();
  });

  it('deve aceitar objeto vazio (nenhum campo obrigatório)', () => {
    expect(() => updateMealSchema.parse({})).not.toThrow();
  });

  it('deve rejeitar preço inválido mesmo em update parcial', () => {
    expect(() => updateMealSchema.parse({ price: -5 })).toThrow();
  });
});

describe('createOrderSchema', () => {
  const valid = {
    items: [{ mealId: 'meal-1', quantity: 2 }],
  };

  it('deve aceitar pedido válido', () => {
    expect(() => createOrderSchema.parse(valid)).not.toThrow();
  });

  it('deve aceitar múltiplos itens', () => {
    const multiItems = {
      items: [
        { mealId: 'meal-1', quantity: 2 },
        { mealId: 'meal-2', quantity: 1 },
      ],
    };
    expect(() => createOrderSchema.parse(multiItems)).not.toThrow();
  });

  it('deve rejeitar lista de itens vazia', () => {
    expect(() => createOrderSchema.parse({ items: [] })).toThrow();
  });

  it('deve rejeitar quantidade zero', () => {
    expect(() =>
      createOrderSchema.parse({ items: [{ mealId: 'meal-1', quantity: 0 }] }),
    ).toThrow();
  });

  it('deve rejeitar quantidade negativa', () => {
    expect(() =>
      createOrderSchema.parse({ items: [{ mealId: 'meal-1', quantity: -1 }] }),
    ).toThrow();
  });

  it('deve rejeitar mealId vazio', () => {
    expect(() =>
      createOrderSchema.parse({ items: [{ mealId: '', quantity: 1 }] }),
    ).toThrow();
  });
});

describe('updateOrderStatusSchema', () => {
  it('deve aceitar status PENDING', () => {
    expect(() =>
      updateOrderStatusSchema.parse({ status: 'PENDING' }),
    ).not.toThrow();
  });

  it('deve aceitar todos os status válidos', () => {
    const statuses = [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'DELIVERED',
      'CANCELLED',
    ];
    statuses.forEach((status) => {
      expect(() => updateOrderStatusSchema.parse({ status })).not.toThrow();
    });
  });

  it('deve rejeitar status inválido', () => {
    expect(() =>
      updateOrderStatusSchema.parse({ status: 'INVALID' }),
    ).toThrow();
  });

  it('deve rejeitar status em minúsculo', () => {
    expect(() =>
      updateOrderStatusSchema.parse({ status: 'pending' }),
    ).toThrow();
  });
});

describe('updateUserSchema', () => {
  it('deve aceitar atualização só de nome', () => {
    expect(() => updateUserSchema.parse({ name: 'Novo Nome' })).not.toThrow();
  });

  it('deve aceitar atualização só de e-mail', () => {
    expect(() =>
      updateUserSchema.parse({ email: 'novo@email.com' }),
    ).not.toThrow();
  });

  it('deve aceitar objeto vazio', () => {
    expect(() => updateUserSchema.parse({})).not.toThrow();
  });

  it('deve rejeitar e-mail inválido', () => {
    expect(() => updateUserSchema.parse({ email: 'invalido' })).toThrow();
  });

  it('deve rejeitar nome com menos de 2 caracteres', () => {
    expect(() => updateUserSchema.parse({ name: 'A' })).toThrow();
  });
});
