'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ClipboardList, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { getMealById } from '@/lib/api/mealdb'
import { Meal } from '@/types/meal.types'
import { MealCardSkeleton } from '@/components/meal/MealCardSkeleton'

const STATUS_MAP = {
    PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    CONFIRMED: { label: 'Confirmado', color: 'bg-green-100 text-green-700 border-green-200' },
    PREPARING: { label: 'Preparando', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    DELIVERED: { label: 'Entregue', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200' },
}

type DbOrderItem = {
    id: string
    mealId: string
    quantity: number
    price: number
    meal?: Meal | null
}

type DbOrder = {
    id: string
    total: number
    status: keyof typeof STATUS_MAP
    createdAt: string
    items: DbOrderItem[]
}

function OrderCard({ order }: { order: DbOrder }) {
    const status = STATUS_MAP[order.status]
    const date = new Date(order.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

    return (
        <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                <div>
                    <p className="text-xs text-[var(--color-text-muted)] font-mono mb-0.5">
                        #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                        <Clock className="h-3 w-3" />
                        {date}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
                        {status.label}
                    </Badge>
                    <span className="font-bold text-[var(--color-brand)]">
                        {formatPrice(order.total)}
                    </span>
                </div>
            </div>

            <div className="px-5 py-4 space-y-3">
                {order.items.map((item) => (
                    <Link key={item.id} href={item.meal ? `/meal/${item.mealId}` : '#'} className="flex items-center gap-3 group">
                        <div className="relative h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden bg-[var(--color-surface-2)]">
                            {item.meal?.thumbnail && (
                                <Image
                                    src={item.meal.thumbnail}
                                    alt={item.meal.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="48px"
                                />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-[var(--color-brand)] transition-colors">
                                {item.meal?.name ?? item.mealId}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                                {item.quantity}× {formatPrice(item.price)}
                            </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand)] transition-colors flex-shrink-0" />
                    </Link>
                ))}
            </div>

            <div className="px-5 pb-4 flex items-center justify-between">
                <p className="text-xs text-[var(--color-text-muted)]">
                    {order.items.reduce((acc, i) => acc + i.quantity, 0)} itens no total
                </p>
                <button className="text-xs font-medium text-[var(--color-brand)] hover:underline underline-offset-2 transition-all">
                    Pedir novamente
                </button>
            </div>
        </div>
    )
}

export function OrdersTab() {
    const [orders, setOrders] = useState<DbOrder[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/user/orders')
            .then(res => res.json())
            .then(async (data) => {
                const ordersWithMeals = await Promise.all(
                    data.orders.map(async (order: DbOrder) => ({
                        ...order,
                        items: await Promise.all(
                            order.items.map(async (item: DbOrderItem) => ({
                                ...item,
                                meal: await getMealById(item.mealId),
                            }))
                        ),
                    }))
                )
                setOrders(ordersWithMeals)
            })
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 2 }).map((_, i) => <MealCardSkeleton key={i} />)}
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-3)]">
                    <ClipboardList className="h-8 w-8 text-[var(--color-text-muted)]" />
                </div>
                <div>
                    <p className="font-semibold text-[var(--color-text-primary)] mb-1">Nenhum pedido ainda</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">Seus pedidos finalizados aparecem aqui</p>
                </div>
                <Button asChild className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] rounded-full px-8">
                    <Link href="/">Fazer primeiro pedido</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
                {orders.length} {orders.length === 1 ? 'pedido realizado' : 'pedidos realizados'}
            </p>
            {orders.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
    )
}