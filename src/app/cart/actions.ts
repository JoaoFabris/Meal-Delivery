'use server';

import { auth } from '@/lib/auth';

type ValidationResult = {
  ok: boolean;
  message?: string;
};

export async function validateSessionForOrder(): Promise<ValidationResult> {
  const session = await auth();

  console.log('[validateSessionForOrder] session:', JSON.stringify(session));

  if (!session?.user?.email) {
    return {
      ok: false,
      message:
        'Sua sessão expirou. Faça login novamente para finalizar o pedido.',
    };
  }

  return { ok: true };
}
