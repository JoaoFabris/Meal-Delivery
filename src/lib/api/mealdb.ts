import { Category, Meal, MealRaw, MealSummary } from '@/types/meal.types'

// Tenta ler do .env, se não encontrar, usa a URL direta da API como fallback
const BASE_URL = process.env.NEXT_PUBLIC_MEALDB_API_URL || 'https://www.themealdb.com/api/json/v1/1';

// Converte o preço simulado a partir do id do prato
function generatePrice(id: string): number {
  const num = parseInt(id, 10)
  // Gera um preço entre R$19,90 e R$79,90
  return Math.round(((num % 60) + 19.9) * 100) / 100
}

// Extrai ingredientes do objeto bruto da API
function extractIngredients(raw: MealRaw) {
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    const name = raw[`strIngredient${i}`]
    const measure = raw[`strMeasure${i}`]
    if (name && name.trim()) {
      ingredients.push({ name: name.trim(), measure: measure?.trim() ?? '' })
    }
  }
  return ingredients
}

// Normaliza o objeto bruto em Meal limpo
function normalizeMeal(raw: MealRaw): Meal {
  return {
    id: raw.idMeal,
    name: raw.strMeal,
    category: raw.strCategory,
    area: raw.strArea,
    instructions: raw.strInstructions,
    thumbnail: raw.strMealThumb,
    tags: raw.strTags ? raw.strTags.split(',').map((t) => t.trim()) : [],
    youtube: raw.strYoutube ?? null,
    source: raw.strSource ?? null,
    ingredients: extractIngredients(raw),
    price: generatePrice(raw.idMeal),
  }
}

// Busca prato por ID
export async function getMealById(id: string): Promise<Meal | null> {
  const res = await fetch(`${BASE_URL}/lookup.php?i=${id}`, {
    next: { revalidate: 3600 }, // cache de 1h (ISR)
  })
  if (!res.ok) return null
  const data = await res.json()
  const raw: MealRaw = data.meals?.[0]
  if (!raw) return null
  return normalizeMeal(raw)
}

// Busca pratos por nome
export async function searchMealsByName(name: string): Promise<MealSummary[]> {
  const res = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(name)}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.meals ?? []
}

// Busca pratos por categoria
export async function getMealsByCategory(category: string): Promise<MealSummary[]> {
  const res = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.meals ?? []
}

// Lista todas as categorias
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/categories.php`, {
    next: { revalidate: 86400 }, // cache de 24h
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.categories ?? []
}

// Busca pratos aleatórios para popular a home
export async function getRandomMeals(count: number = 20): Promise<MealSummary[]> {
  const promises = Array.from({ length: count }, () =>
    fetch(`${BASE_URL}/random.php`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => d.meals?.[0] as MealSummary)
      .catch(() => null)
  )
  const results = await Promise.all(promises)
  return results.filter(Boolean) as MealSummary[]
}