'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Meal, MealSummary } from '@/types/meal.types'
import { useFavoritesStore } from '@/lib/store/favorites.store'
import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice, truncate } from '@/lib/utils'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface MealCardProps {
    meal: Meal
}

export function MealCard({ meal }: MealCardProps) {
    const { isFavorite, toggleFavorite } = useFavoritesStore()
    const { addItem } = useCartStore()
    const favorited = isFavorite(meal.id)

    function handleFavorite(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(meal)
        toast(favorited ? 'Removido dos favoritos' : 'Adicionado aos favoritos', {
            icon: favorited ? '💔' : '❤️',
        })
    }

    function handleAddToCart(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        addItem(meal, 1)
        toast.success(`${meal.name} adicionado ao carrinho!`)
    }

    // Gera descrição a partir dos ingredientes
    const description = meal.ingredients
        .slice(0, 5)
        .map((i) => i.name)
        .join(', ')

    return (
        <Link href={`/meal/${meal.id}`} className="group block">
            <article className="relative rounded-2xl bg-white border border-[var(--color-border)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-transparent">

                {/* Imagem */}
                <div className="relative h-48 overflow-hidden">
                    <Image
                        src={meal.thumbnail}
                        alt={meal.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badge categoria */}
                    <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[var(--color-text-primary)] border-0 text-xs font-medium shadow-sm">
                        {meal.category}
                    </Badge>

                    {/* Botão favoritar */}
                    <button
                        onClick={handleFavorite}
                        aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        className={cn(
                            'absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200',
                            favorited
                                ? 'bg-[var(--color-brand)] text-white scale-110'
                                : 'bg-white/90 text-[var(--color-text-muted)] hover:bg-[var(--color-brand)] hover:text-white'
                        )}
                    >
                        <Heart className={cn('h-4 w-4', favorited && 'fill-current')} />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="p-4">
                    {/* Localidade */}
                    <div className="flex items-center gap-1 mb-1.5">
                        <MapPin className="h-3 w-3 text-[var(--color-text-muted)]" />
                        <span className="text-xs text-[var(--color-text-muted)]">{meal.area}</span>
                    </div>

                    {/* Nome */}
                    <h3 className="font-semibold text-[var(--color-text-primary)] text-sm leading-snug mb-1.5 line-clamp-1">
                        {meal.name}
                    </h3>

                    {/* Ingredientes — 2 linhas */}
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed min-h-[2.5rem]">
                        {truncate(description, 80)}
                    </p>

                    {/* Rodapé */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
                        <span className="text-base font-bold text-[var(--color-brand)]">
                            {formatPrice(meal.price)}
                        </span>

                        <button
                            onClick={handleAddToCart}
                            aria-label="Adicionar ao carrinho"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand)] text-white shadow-sm transition-all duration-200 hover:bg-[var(--color-brand-dark)] hover:scale-110 active:scale-95"
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </article>
        </Link>
    )
}