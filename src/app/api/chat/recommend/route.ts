import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { searchMealsByName, getCategories } from '@/lib/api/mealdb';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { message, history } = await req.json();

    const categories = await getCategories();
    const categoryNames = categories.map((c) => c.strCategory).join(', ');

    // Limpa emojis e caracteres especiais
    const cleanMessage = message
      .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
      .replace(/[^\w\sáéíóúãõâêîôûàèìòùç]/g, '')
      .trim();

    // Mapeia termos em português para inglês (MealDB é em inglês)
    const keywordMap: Record<string, string> = {
      frango: 'chicken',
      peixe: 'fish',
      salmão: 'salmon',
      atum: 'tuna',
      massa: 'pasta',
      macarrão: 'pasta',
      lasanha: 'lasagna',
      pizza: 'pizza',
      leve: 'salad',
      salada: 'salad',
      sobremesa: 'cake',
      bolo: 'cake',
      doce: 'dessert',
      sorvete: 'ice cream',
      carne: 'beef',
      bife: 'steak',
      porco: 'pork',
      cordeiro: 'lamb',
      'frutos do mar': 'seafood',
      camarão: 'prawn',
      vegetariano: 'vegetable',
      vegano: 'vegan',
      sopa: 'soup',
      arroz: 'rice',
    };

    const lowerMessage = cleanMessage.toLowerCase();
    let searchTerm = cleanMessage;

    for (const [pt, en] of Object.entries(keywordMap)) {
      if (lowerMessage.includes(pt)) {
        searchTerm = en;
        break;
      }
    }

    const searchResults = await searchMealsByName(searchTerm.slice(0, 30));
    const mealsText = searchResults
      .slice(0, 8)
      .map((m) => `- ${m.strMeal} (ID: ${m.idMeal})`)
      .join('\n');

    const systemPrompt = `Você é um assistente culinário simpático e especialista do FoodApp.
Seu objetivo é ajudar o usuário a encontrar pratos do cardápio.

USUÁRIO ATUAL: ${session.user.name ?? 'Cliente'}

CATEGORIAS DISPONÍVEIS: ${categoryNames}

PRATOS ENCONTRADOS PARA O CONTEXTO:
${mealsText || 'Nenhum prato específico encontrado — sugira categorias disponíveis.'}

INSTRUÇÕES:
- Recomende apenas pratos reais listados acima.
- Nunca invente pratos que não estão na lista.
- Para cada prato recomendado, use EXATAMENTE este formato: [Nome do Prato](/meal/ID)
  Exemplo: [Mediterranean Pasta Salad](/meal/52772)
- Seja conciso, amigável e use emojis com moderação.
- Responda sempre em português (Brasil).
- Se não encontrar pratos relevantes, sugira as categorias disponíveis.
- Se o usuário perguntar algo fora do contexto de comida, redirecione gentilmente.`;

    const messages = [...(history ?? []), { role: 'user', content: message }];

    const grokResponse = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
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
