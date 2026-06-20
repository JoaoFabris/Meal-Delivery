import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/middleware/errorHandler';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 },
      );
    }

    // Atualiza senha se fornecida
    if (data.newPassword) {
      if (!user.password) {
        return NextResponse.json(
          { error: 'Conta Google não possui senha para alterar' },
          { status: 400 },
        );
      }
      if (!data.currentPassword) {
        return NextResponse.json(
          { error: 'Senha atual é obrigatória' },
          { status: 400 },
        );
      }
      const valid = await bcrypt.compare(data.currentPassword, user.password);
      if (!valid) {
        return NextResponse.json(
          { error: 'Senha atual incorreta' },
          { status: 400 },
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.newPassword && {
          password: await bcrypt.hash(data.newPassword, 12),
        }),
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return handleApiError(error);
  }
}
