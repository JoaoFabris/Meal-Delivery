'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FavoriteMealCard } from '@/components/meal/FavoriteMealCard'
import { useFavoritesStore } from '@/lib/store/favorites.store'
import { getMealById } from '@/lib/api/mealdb'
import { Meal } from '@/types/meal.types'
import { MealCardSkeleton } from '@/components/meal/MealCardSkeleton'

export function FavoritesTab() {
    const { favoriteIds, loaded } = useFavoritesStore()
    const [meals, setMeals] = useState<Meal[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        console.log('[FavoritesTab] favoriteIds:', favoriteIds, 'loaded:', loaded)
        if (!loaded) return
        if (favoriteIds.length === 0) {
            setMeals([])
            setLoading(false)
            return
        }
        setLoading(true)
        Promise.all(favoriteIds.map(id => getMealById(id)))
            .then(results => setMeals(results.filter(Boolean) as Meal[]))
            .finally(() => setLoading(false))
    }, [favoriteIds, loaded])

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => <MealCardSkeleton key={i} />)}
            </div>
        )
    }

    if (meals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-3)]">
                    <Heart className="h-8 w-8 text-[var(--color-text-muted)]" />
                </div>
                <div>
                    <p className="font-semibold text-[var(--color-text-primary)] mb-1">
                        Nenhum favorito ainda
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Salve seus pratos preferidos tocando no coração ❤️
                    </p>
                </div>
                <Button asChild className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] rounded-full px-8">
                    <Link href="/">Explorar cardápio</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-5">
            <p className="text-sm text-[var(--color-text-secondary)]">
                {meals.length} {meals.length === 1 ? 'prato salvo' : 'pratos salvos'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {meals.map((meal) => <FavoriteMealCard key={meal.id} meal={meal} />)}
            </div>
        </div>
    )
}