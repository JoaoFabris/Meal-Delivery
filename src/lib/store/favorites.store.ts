import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Meal } from '@/types/meal.types'

interface FavoritesStore {
  favorites: Meal[]
  addFavorite: (meal: Meal) => void
  removeFavorite: (mealId: string) => void
  isFavorite: (mealId: string) => boolean
  toggleFavorite: (meal: Meal) => void
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (meal) => {
        if (!get().isFavorite(meal.id)) {
          set({ favorites: [...get().favorites, meal] })
        }
      },

      removeFavorite: (mealId) => {
        set({ favorites: get().favorites.filter((m) => m.id !== mealId) })
      },

      isFavorite: (mealId) => get().favorites.some((m) => m.id === mealId),

      toggleFavorite: (meal) => {
        if (get().isFavorite(meal.id)) {
          get().removeFavorite(meal.id)
        } else {
          get().addFavorite(meal)
        }
      },
    }),
    {
      name: 'foodapp-favorites',
    }
  )
)