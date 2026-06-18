import { create } from 'zustand';
import { Meal } from '@/types/meal.types';

interface FavoritesStore {
  favoriteIds: string[];
  loaded: boolean;
  setFavoriteIds: (ids: string[]) => void;
  isFavorite: (mealId: string) => boolean;
  toggleFavorite: (meal: Meal) => Promise<void>;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()((set, get) => ({
  favoriteIds: [],
  loaded: false,

  setFavoriteIds: (ids) => set({ favoriteIds: ids, loaded: true }),

  clearFavorites: () => set({ favoriteIds: [], loaded: false }),

  isFavorite: (mealId) => get().favoriteIds.includes(mealId),

  toggleFavorite: async (meal) => {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mealId: meal.id }),
    });
    const data = await res.json();
    if (data.favorited) {
      set({ favoriteIds: [...get().favoriteIds, meal.id] });
    } else {
      set({ favoriteIds: get().favoriteIds.filter((id) => id !== meal.id) });
    }
  },
}));
