import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { message, history } = await req.json();

    // Busca dados do usuário + pedidos + favoritos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            items: true,
          },
        },
        favorites: true,
      },
    });

    // Busca todos os pratos disponíveis
    const meals = await prisma.meal.findMany({
      where: { available: true },
      orderBy: { category: 'asc' },
    });

    // IDs dos favoritos para enriquecer contexto
    const favoriteMealIds = new Set(user?.favorites.map((f) => f.mealId) ?? []);

    // Cardápio formatado para o system prompt
    const menuText = meals
      .map((meal) => {
        const isFav = favoriteMealIds.has(meal.id)
          ? ' ⭐ (favorito do usuário)'
          : '';
        return `- [${meal.category}] ${meal.name}${isFav}: ${meal.description ?? 'sem descrição'} | R$ ${meal.price.toFixed(2)}`;
      })
      .join('\n');

    // Histórico de pedidos formatado
    const orderHistory =
      user?.orders
        .map((order) => {
          const items = order.items
            .map((item) => {
              const meal = meals.find((m) => m.id === item.mealId);
              return `${meal?.name ?? 'Prato desconhecido'} (x${item.quantity})`;
            })
            .join(', ');
          return `Pedido em ${order.createdAt.toLocaleDateString('pt-BR')}: ${items} — Total: R$ ${order.total.toFixed(2)}`;
        })
        .join('\n') ?? 'Nenhum pedido anterior.';

    const systemPrompt = `Você é um assistente culinário simpático e especialista do restaurante "Meal Delivery".
Seu único objetivo é ajudar o usuário a escolher pratos do cardápio com base nas preferências, histórico e descrição dos itens.

USUÁRIO ATUAL:
- Nome: ${user?.name ?? 'Cliente'}
- Email: ${session.user.email}

CARDÁPIO DISPONÍVEL:
${menuText}

HISTÓRICO DE PEDIDOS RECENTES:
${orderHistory}

INSTRUÇÕES:
- Recomende pratos com base no que o usuário pede, descreve ou prefere.
- Priorize pratos favoritos (marcados com ⭐) quando fizer sentido.
- Nunca invente pratos que não estão no cardápio.
- Seja conciso, amigável e use emojis com moderação.
- Responda sempre em português (Brasil).
- Se o usuário perguntar algo fora do contexto de comida, redirecione gentilmente.`;

    // Histórico de conversa para a API
    const messages = [...(history ?? []), { role: 'user', content: message }];

    // Chamada para a API do Grok (xAI) com streaming
    const grokResponse = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          stream: true,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
        }),
      },
    );

    if (!grokResponse.ok) {
      const error = await grokResponse.text();
      console.error('Groq API error:', error);
      return NextResponse.json(
        { error: 'Erro na API do Groq' },
        { status: 500 },
      );
    }

    // Repassa o stream diretamente para o cliente
    return new NextResponse(grokResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Recommend route error:', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
