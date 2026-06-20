import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/middleware/errorHandler';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    console.log(
      '[favorites] email:',
      session.user.email,
      'user found:',
      !!user,
    );
    if (!user) return NextResponse.json({ favorites: [] });

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ favorites: favorites.map((f) => f.mealId) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { mealId } = await req.json();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user)
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 },
      );

    const existing = await prisma.favorite.findUnique({
      where: { userId_mealId: { userId: user.id, mealId } },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { userId_mealId: { userId: user.id, mealId } },
      });
      return NextResponse.json({ favorited: false });
    }

    await prisma.favorite.create({ data: { userId: user.id, mealId } });
    return NextResponse.json({ favorited: true });
  } catch (error) {
    return handleApiError(error);
  }
}
