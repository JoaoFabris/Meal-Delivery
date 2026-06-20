'use client'

import { useState } from 'react'
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice } from '@/lib/utils'

export function CartSheet() {
    const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCartStore()
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const count = totalItems()

    function handleGoToCart() {
        setOpen(false)
        router.push('/cart')
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="relative flex items-center gap-2 rounded-full bg-red border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:border-[var(--color-brand)] transition-colors">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="hidden sm:inline">Carrinho</span>
                    {count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand)] text-white text-[11px] font-bold">
                            {count > 9 ? '9+' : count}
                        </span>
                    )}
                </button>
            </SheetTrigger>

            <SheetContent className="flex flex-col w-full sm:max-w-md p-0 bg-white">
                <SheetHeader className="px-6 pt-6 pb-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-[var(--color-brand)]" />
                        Meu Carrinho
                        {count > 0 && (
                            <span className="ml-auto text-sm font-normal text-[var(--color-text-secondary)]">
                                {count} {count === 1 ? 'item' : 'itens'}
                            </span>
                        )}
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        Itens adicionados ao seu carrinho
                    </SheetDescription>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-3)]">
                            <ShoppingBag className="h-8 w-8 text-[var(--color-text-muted)]" />
                        </div>
                        <p className="font-medium text-[var(--color-text-primary)]">Carrinho vazio</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Adicione pratos para começar seu pedido
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                            {items.map((item) => (
                                <div key={item.meal.id} className="flex gap-3">
                                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                                        <Image
                                            src={item.meal.thumbnail}
                                            alt={item.meal.name}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    </div>

                                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.meal.name}</p>
                                        <p className="text-sm text-[var(--color-brand)] font-semibold">
                                            {formatPrice(item.meal.price)}
                                        </p>

                                        <div className="flex items-center gap-2 mt-auto">
                                            <button
                                                onClick={() => updateQuantity(item.meal.id, item.quantity - 1)}
                                                className="flex h-6 w-6 items-center justify-center rounded-full border hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.meal.id, item.quantity + 1)}
                                                className="flex h-6 w-6 items-center justify-center rounded-full border hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>

                                            <button
                                                onClick={() => removeItem(item.meal.id)}
                                                className="ml-auto text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t px-6 py-5 space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-[var(--color-text-secondary)]">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(totalPrice())}</span>
                                </div>
                                <div className="flex justify-between text-[var(--color-text-secondary)]">
                                    <span>Taxa de entrega</span>
                                    <span className="text-green-600 font-medium">Grátis</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold text-base">
                                    <span>Total</span>
                                    <span className="text-[var(--color-brand)]">{formatPrice(totalPrice())}</span>
                                </div>
                            </div>

                            {/* Botão agora fecha o sheet e navega */}
                            <Button
                                onClick={handleGoToCart}
                                className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white h-12 text-base font-semibold rounded-xl"
                            >
                                Finalizar pedido
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}