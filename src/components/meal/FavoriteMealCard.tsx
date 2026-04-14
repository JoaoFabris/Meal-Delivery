'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, MapPin } from 'lucide-react'
import { Meal } from '@/types/meal.types'
import { useFavoritesStore } from '@/lib/store/favorites.store'
import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export function FavoriteMealCard({ meal }: { meal: Meal }) {
    const { removeFavorite } = useFavoritesStore()
    const { addItem } = useCartStore()

    function handleRemove(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        removeFavorite(meal.id)
        toast('Removido dos favoritos', { icon: '💔' })
    }

    function handleAddToCart(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        addItem(meal, 1)
        toast.success(`${meal.name} adicionado ao carrinho!`)
    }

    return (
        <Link href={`/meal/${meal.id}`} className="group block">
            <article className="relative rounded-2xl bg-white border border-[var(--color-border)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-transparent">

                {/* Imagem */}
                <div className="relative h-44 overflow-hidden">
                    <Image
                        src={meal.thumbnail}
                        alt={meal.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Badge categoria */}
                    <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[var(--color-text-primary)] border-0 text-xs font-medium shadow-sm">
                        {meal.category}
                    </Badge>

                    {/* Botão remover favorito */}
                    <button
                        onClick={handleRemove}
                        aria-label="Remover dos favoritos"
                        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand)] text-white hover:scale-110 transition-transform"
                    >
                        <Heart className="h-4 w-4 fill-current" />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="p-4">
                    <div className="flex items-center gap-1 mb-1">
                        <MapPin className="h-3 w-3 text-[var(--color-text-muted)]" />
                        <span className="text-xs text-[var(--color-text-muted)]">{meal.area}</span>
                    </div>

                    <h3 className="font-semibold text-sm line-clamp-1 mb-3">
                        {meal.name}
                    </h3>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
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