// Resposta bruta da API TheMealDB
export interface MealRaw {
    idMeal: string
    strMeal: string
    strDrinkAlternate: string | null
    strCategory: string
    strArea: string
    strInstructions: string
    strMealThumb: string
    strTags: string | null
    strYoutube: string | null
    strSource: string | null
    strImageSource: string | null
    strCreativeCommonsConfirmed: string | null
    dateModified: string | null
    // Ingredientes e medidas (a API retorna até 20)
    [key: `strIngredient${number}`]: string | null
    [key: `strMeasure${number}`]: string | null
  }
  
  // Versão limpa e tipada para uso no app
  export interface Meal {
    id: string
    name: string
    category: string
    area: string
    instructions: string
    thumbnail: string
    tags: string[]
    youtube: string | null
    source: string | null
    ingredients: Ingredient[]
    // Campo calculado — preço simulado baseado no id
    price: number
  }
  
  export interface Ingredient {
    name: string
    measure: string
  }
  
  export interface Category {
    idCategory: string
    strCategory: string
    strCategoryThumb: string
    strCategoryDescription: string
  }
  
  // Versão resumida que vem na listagem
  export interface MealSummary {
    idMeal: string
    strMeal: string
    strMealThumb: string
  }
  
  // Item dentro do carrinho
  export interface CartItem {
    meal: Meal
    quantity: number
  }
  
  // Pedido finalizado
  export interface Order {
    id: string
    items: CartItem[]
    total: number
    createdAt: string
    status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  }