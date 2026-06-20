'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, MapPin } from 'lucide-react'
import { Meal } from '@/types/meal.types'
import { useFavoritesStore } from '@/lib/store/favorites.store'
import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice, truncate } from '@/lib/utils'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const CATEGORY_COLORS: Record<string, string> = {
    Beef: 'bg-red-100 text-red-700',
    Chicken: 'bg-orange-100 text-orange-700',
    Dessert: 'bg-pink-100 text-pink-700',
    Lamb: 'bg-amber-100 text-amber-700',
    Pasta: 'bg-yellow-100 text-yellow-700',
    Seafood: 'bg-blue-100 text-blue-700',
    Vegetarian: 'bg-green-100 text-green-700',
    Vegan: 'bg-emerald-100 text-emerald-700',
    Pork: 'bg-rose-100 text-rose-700',
    Side: 'bg-purple-100 text-purple-700',
    Starter: 'bg-cyan-100 text-cyan-700',
    Breakfast: 'bg-lime-100 text-lime-700',
    Miscellaneous: 'bg-slate-100 text-slate-700',
    Goat: 'bg-stone-100 text-stone-700',
}

interface MealCardProps {
    meal: Meal
}

export function MealCard({ meal }: MealCardProps) {
    const { isFavorite, toggleFavorite } = useFavoritesStore()
    const { addItem } = useCartStore()
    const { data: session } = useSession()
    const router = useRouter()
    const favorited = isFavorite(meal.id)

    function handleFavorite(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        if (!session) {
            toast.error('Faça login para salvar favoritos', { icon: '🔒' })
            router.push('/login')
            return
        }
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

    const description = meal.ingredients.slice(0, 5).map((i) => i.name).join(', ')
    const categoryColor = CATEGORY_COLORS[meal.category] ?? 'bg-gray-100 text-gray-700'

    return (
        <Link href={`/meal/${meal.id}`} className="group block">
            <article className="relative rounded-2xl bg-white border border-[var(--color-border)] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/10 hover:border-transparent">

                {/* Imagem */}
                <div className="relative h-48 overflow-hidden">
                    <Image
                        src={meal.thumbnail}
                        alt={meal.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badge categoria colorida */}
                    <span className={cn(
                        'absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm',
                        categoryColor
                    )}>
                        {meal.category}
                    </span>

                    {/* Botão favoritar */}
                    <button
                        onClick={handleFavorite}
                        aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        className={cn(
                            'absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 shadow-sm',
                            favorited
                                ? 'bg-[var(--color-brand)] text-white scale-110 shadow-[var(--color-brand)]/30 shadow-lg'
                                : 'bg-white/90 text-[var(--color-text-muted)] hover:bg-[var(--color-brand)] hover:text-white hover:scale-110'
                        )}
                    >
                        <Heart className={cn('h-4 w-4 transition-transform duration-200', favorited && 'fill-current scale-110')} />
                    </button>

                    {/* Botão carrinho aparece no hover */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <button
                            onClick={handleAddToCart}
                            aria-label="Adicionar ao carrinho"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--color-brand)] shadow-lg transition-all duration-200 hover:bg-[var(--color-brand)] hover:text-white hover:scale-110 active:scale-95"
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4">
                    <div className="flex items-center gap-1 mb-1.5">
                        <MapPin className="h-3 w-3 text-[var(--color-text-muted)]" />
                        <span className="text-xs text-[var(--color-text-muted)]">{meal.area}</span>
                    </div>

                    <h3 className="font-bold text-[var(--color-text-primary)] text-sm leading-snug mb-1.5 line-clamp-1 group-hover:text-[var(--color-brand)] transition-colors duration-200">
                        {meal.name}
                    </h3>

                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed min-h-[2.5rem]">
                        {truncate(description, 80)}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
                        <div>
                            <span className="text-lg font-black text-[var(--color-brand)]">
                                {formatPrice(meal.price)}
                            </span>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            aria-label="Adicionar ao carrinho"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand)] text-white shadow-sm transition-all duration-200 hover:bg-[var(--color-brand-dark)] hover:scale-110 active:scale-95 group-hover:shadow-[var(--color-brand)]/30 group-hover:shadow-md"
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </article>
        </Link>
    )
}