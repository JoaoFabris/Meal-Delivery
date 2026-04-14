'use client'

import { useEffect, useState, useCallback } from 'react'
import { MealCard } from './MealCard'
import { MealCardSkeleton } from './MealCardSkeleton'
import { Meal, MealSummary } from '@/types/meal.types'
import {
    getMealById,
    getMealsByCategory,
    getRandomMeals,
    searchMealsByName,
} from '@/lib/api/mealdb'
import { UtensilsCrossed } from 'lucide-react'

interface MealGridProps {
    search: string
    category: string
}

async function hydrateMeals(summaries: MealSummary[]): Promise<Meal[]> {
    const slice = summaries.slice(0, 12)
    const results = await Promise.all(slice.map((s) => getMealById(s.idMeal)))
    const meals = results.filter(Boolean) as Meal[]
    // Remove duplicatas que a API do MealDB às vezes retorna
    return meals.filter((meal, index, self) =>
        index === self.findIndex((m) => m.id === meal.id)
    )
}

export function MealGrid({ search, category }: MealGridProps) {
    const [meals, setMeals] = useState<Meal[]>([])
    const [loading, setLoading] = useState(true)

    const fetchMeals = useCallback(async () => {
        setLoading(true)
        try {
            let summaries: MealSummary[] = []

            if (search) {
                summaries = await searchMealsByName(search)
            } else if (category && category !== 'Todas') {
                summaries = await getMealsByCategory(category)
            } else {
                summaries = await getRandomMeals(12)
            }

            const hydrated = await hydrateMeals(summaries)
            setMeals(hydrated)
        } catch {
            setMeals([])
        } finally {
            setLoading(false)
        }
    }, [search, category])

    useEffect(() => {
        fetchMeals()
    }, [fetchMeals])

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                    <MealCardSkeleton key={i} />
                ))}
            </div>
        )
    }

    if (meals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-3)]">
                    <UtensilsCrossed className="h-8 w-8 text-[var(--color-text-muted)]" />
                </div>
                <p className="font-semibold text-[var(--color-text-primary)]">Nenhum prato encontrado</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                    Tente outro nome ou categoria
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
            ))}
        </div>
    )
}