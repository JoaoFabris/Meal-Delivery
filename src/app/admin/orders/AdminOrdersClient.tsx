'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { AdminOrderCard } from '@/components/admin/AdminOrderCard'
import { cn } from '@/lib/utils'
import { getMealById } from '@/lib/api/mealdb'
import { Meal } from '@/types/meal.types'
import { MealCardSkeleton } from '@/components/meal/MealCardSkeleton'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERED' | 'CANCELLED'
type StatusFilter = 'all' | OrderStatus

export type DbOrderItem = {
    id: string
    mealId: string
    quantity: number
    price: number
    meal?: Meal | null
}

export type DbOrder = {
    id: string
    total: number
    status: OrderStatus
    createdAt: string
    userId: string
    items: DbOrderItem[]
    user?: { name?: string | null; email?: string | null }
}

const FILTERS: { label: string; value: StatusFilter }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Pendente', value: 'PENDING' },
    { label: 'Confirmado', value: 'CONFIRMED' },
    { label: 'Entregue', value: 'DELIVERED' },
    { label: 'Cancelado', value: 'CANCELLED' },
]

export function AdminOrdersClient() {
    const [orders, setOrders] = useState<DbOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

    useEffect(() => {
        fetch('/api/admin/orders')
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

    function handleStatusUpdate(orderId: string, newStatus: OrderStatus) {
        setOrders(prev =>
            prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        )
    }

    const filtered = useMemo(() => {
        return orders.filter((o) => {
            const matchStatus = statusFilter === 'all' || o.status === statusFilter
            const matchSearch =
                !search.trim() ||
                o.id.toLowerCase().includes(search.toLowerCase()) ||
                o.items.some((i) =>
                    i.meal?.name.toLowerCase().includes(search.toLowerCase())
                )
            return matchStatus && matchSearch
        })
    }, [orders, search, statusFilter])

    if (loading) {
        return (
            <div className="space-y-4 max-w-5xl mx-auto">
                {Array.from({ length: 3 }).map((_, i) => <MealCardSkeleton key={i} />)}
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-black">Pedidos</h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                    {orders.length} {orders.length === 1 ? 'pedido registrado' : 'pedidos registrados'}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por ID ou nome do prato..."
                        className="w-full h-10 rounded-xl border border-[var(--color-border)] bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10"
                    />
                </div>
                <div className="flex items-center gap-1 bg-white rounded-xl border border-[var(--color-border)] p-1">
                    <SlidersHorizontal className="h-4 w-4 text-[var(--color-text-muted)] ml-2 flex-shrink-0" />
                    {FILTERS.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => setStatusFilter(value)}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                                statusFilter === value
                                    ? 'bg-[var(--color-brand)] text-white shadow-sm'
                                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-white rounded-2xl border border-[var(--color-border)]">
                    <p className="font-semibold">Nenhum pedido encontrado</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Tente outro filtro ou termo de busca</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((order) => (
                        <AdminOrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} />
                    ))}
                </div>
            )}
        </div>
    )
}