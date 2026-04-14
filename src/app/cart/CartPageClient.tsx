'use client'

import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartItem } from '@/components/cart/CartItem'
import { OrderSummary } from '@/components/cart/OrderSummary'
import { useCartStore } from '@/lib/store/cart.store'

export function CartPageClient() {
    const { items, clearCart } = useCartStore()

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black">Meu Carrinho</h1>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            {items.length === 0
                                ? 'Nenhum item adicionado'
                                : `${items.length} ${items.length === 1 ? 'prato' : 'pratos'} selecionados`}
                        </p>
                    </div>
                </div>

                {items.length > 0 && (
                    <button
                        onClick={clearCart}
                        className="text-sm text-[var(--color-text-muted)] hover:text-red-500 transition-colors underline underline-offset-2"
                    >
                        Limpar carrinho
                    </button>
                )}
            </div>

            {/* Carrinho vazio */}
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-surface-3)]">
                        <ShoppingBag className="h-10 w-10 text-[var(--color-text-muted)]" />
                    </div>
                    <div>
                        <p className="text-lg font-bold mb-1">Seu carrinho está vazio</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Explore nosso cardápio e adicione pratos incríveis
                        </p>
                    </div>
                    <Button
                        asChild
                        className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] rounded-full px-8"
                    >
                        <Link href="/">Ver cardápio</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Lista de itens */}
                    <div className="lg:col-span-2 space-y-3">
                        {items.map((item) => (
                            <CartItem key={item.meal.id} item={item} />
                        ))}
                    </div>

                    {/* Resumo sticky */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <OrderSummary />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}