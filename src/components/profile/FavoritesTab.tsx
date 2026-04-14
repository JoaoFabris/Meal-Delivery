'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavoritesStore } from '@/lib/store/favorites.store'
import { FavoriteMealCard } from '@/components/meal/FavoriteMealCard'

export function FavoritesTab() {
    const { favorites } = useFavoritesStore()

    if (favorites.length === 0) {
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
                <Button
                    asChild
                    className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] rounded-full px-8"
                >
                    <Link href="/">Explorar cardápio</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--color-text-secondary)]">
                    {favorites.length} {favorites.length === 1 ? 'prato salvo' : 'pratos salvos'}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {favorites.map((meal) => (
                    <FavoriteMealCard key={meal.id} meal={meal} />
                ))}
            </div>
        </div>
    )
}