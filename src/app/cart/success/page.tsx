'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CheckCircle2, ClipboardList, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice } from '@/lib/utils'
import { Order } from '@/types/meal.types'

export default function SuccessPage() {
    const { orders } = useCartStore()
    const [lastOrder, setLastOrder] = useState<Order | null>(null)

    useEffect(() => {
        if (orders.length > 0) {
            setLastOrder(orders[orders.length - 1])
        }
    }, [orders])

    return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-8">

            {/* Ícone animado */}
            <div className="flex justify-center">
                <div className="relative flex h-24 w-24 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-30" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Mensagem */}
            <div className="space-y-2">
                <h1 className="text-3xl font-black text-[var(--color-text-primary)]">
                    Pedido confirmado! 🎉
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                    Seu pedido foi recebido e está sendo preparado com carinho.
                </p>
            </div>

            {/* Detalhes do pedido */}
            {lastOrder && (
                <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 text-left space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-sm">Detalhes do pedido</h2>
                        <span className="text-xs text-[var(--color-text-muted)] font-mono">
                            #{lastOrder.id.slice(0, 8).toUpperCase()}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {lastOrder.items.map((item) => (
                            <div key={item.meal.id} className="flex justify-between text-sm">
                                <span className="text-[var(--color-text-secondary)]">
                                    {item.quantity}× {item.meal.name}
                                </span>
                                <span className="font-medium">
                                    {formatPrice(item.meal.price * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between font-bold pt-2 border-t border-[var(--color-border)]">
                        <span>Total pago</span>
                        <span className="text-[var(--color-brand)]">
                            {formatPrice(lastOrder.total)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] pt-1">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        Status: Confirmado · Previsão 30–45 min
                    </div>
                </div>
            )}

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    asChild
                    variant="outline"
                    className="flex-1 h-12 rounded-xl gap-2 border-[var(--color-border)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                >
                    <Link href="/profile?tab=orders">
                        <ClipboardList className="h-4 w-4" />
                        Ver meus pedidos
                    </Link>
                </Button>
                <Button
                    asChild
                    className="flex-1 h-12 rounded-xl gap-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)]"
                >
                    <Link href="/">
                        <Home className="h-4 w-4" />
                        Voltar ao início
                    </Link>
                </Button>
            </div>
        </div>
    )
}