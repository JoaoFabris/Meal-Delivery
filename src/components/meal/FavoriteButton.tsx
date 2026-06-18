'use client'

import { Heart } from 'lucide-react'
import { useFavoritesStore } from '@/lib/store/favorites.store'
import { Meal } from '@/types/meal.types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function FavoriteButton({ meal }: { meal: Meal }) {
    const { isFavorite, toggleFavorite } = useFavoritesStore()
    const { data: session } = useSession()
    const router = useRouter()
    const favorited = isFavorite(meal.id)

    function handle() {
        if (!session) {
            toast.error('Faça login para salvar favoritos', { icon: '🔒' })
            router.push('/login')
            return
        }
        toggleFavorite(meal)
        toast(favorited ? 'Removido dos favoritos' : 'Salvo nos favoritos', {
            icon: favorited ? '💔' : '❤️',
        })
    }

    return (
        <button
            onClick={handle}
            aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className={cn(
                'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
                favorited
                    ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white scale-110'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]'
            )}
        >
            <Heart className={cn('h-5 w-5', favorited && 'fill-current')} />
        </button>
    )
}