import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// ── Meals ─────────────────────────────────────────────────
export const createMealSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  imageUrl: z.string().url('URL da imagem inválida').optional(),
  available: z.boolean().optional().default(true),
});

export const updateMealSchema = createMealSchema.partial();

// ── Orders ────────────────────────────────────────────────
export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        mealId: z.string().min(1, 'ID do prato é obrigatório'),
        quantity: z.number().int().positive('Quantidade deve ser positiva'),
      }),
    )
    .min(1, 'O pedido deve ter pelo menos 1 item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(
    ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERED', 'CANCELLED'],
    {
      error: 'Status inválido',
    },
  ),
});

// ── Users ─────────────────────────────────────────────────
export const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('E-mail inválido').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateMealInput = z.infer<typeof createMealSchema>;
export type UpdateMealInput = z.infer<typeof updateMealSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
