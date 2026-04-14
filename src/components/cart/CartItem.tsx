'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { CartItem as CartItemType } from '@/types/meal.types'
import { useCartStore } from '@/lib/store/cart.store'
import { QuantitySelector } from '@/components/meal/QuantitySelector'
import { formatPrice } from '@/lib/utils'

interface CartItemProps {
    item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCartStore()

    return (
        <div className="flex gap-4 p-4 bg-white rounded-2xl border border-[var(--color-border)]">
            {/* Imagem */}
            <Link href={`/meal/${item.meal.id}`} className="flex-shrink-0">
                <div className="relative h-24 w-24 rounded-xl overflow-hidden">
                    <Image
                        src={item.meal.thumbnail}
                        alt={item.meal.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="96px"
                    />
                </div>
            </Link>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <Link href={`/meal/${item.meal.id}`}>
                            <h3 className="font-semibold text-sm leading-snug hover:text-[var(--color-brand)] transition-colors line-clamp-2">
                                {item.meal.name}
                            </h3>
                        </Link>
                        <div className="flex gap-1.5 mt-1">
                            <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full">
                                {item.meal.category}
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full">
                                {item.meal.area}
                            </span>
                        </div>
                    </div>

                    {/* Remover */}
                    <button
                        onClick={() => removeItem(item.meal.id)}
                        aria-label="Remover item"
                        className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                {/* Rodapé: preço + quantidade */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    <QuantitySelector
                        quantity={item.quantity}
                        onIncrease={() => updateQuantity(item.meal.id, item.quantity + 1)}
                        onDecrease={() => updateQuantity(item.meal.id, item.quantity - 1)}
                        size="sm"
                    />
                    <div className="text-right">
                        <p className="text-xs text-[var(--color-text-muted)]">
                            {formatPrice(item.meal.price)} × {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-[var(--color-brand)]">
                            {formatPrice(item.meal.price * item.quantity)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}