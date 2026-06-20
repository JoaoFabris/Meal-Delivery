'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle, Truck, User } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DbOrder, DbOrderItem } from '@/app/admin/orders/AdminOrdersClient'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERED' | 'CANCELLED'

const STATUS_CONFIG = {
    PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    CONFIRMED: { label: 'Confirmado', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
    PREPARING: { label: 'Preparando', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock },
    DELIVERED: { label: 'Entregue', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck },
    CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
}

const ACTIONS: { label: string; status: OrderStatus; style: string }[] = [
    { label: 'Confirmar', status: 'CONFIRMED', style: 'border-green-300 text-green-700 hover:bg-green-50' },
    { label: 'Marcar entregue', status: 'DELIVERED', style: 'border-blue-300 text-blue-700 hover:bg-blue-50' },
    { label: 'Cancelar', status: 'CANCELLED', style: 'border-red-300 text-red-700 hover:bg-red-50' },
]

interface AdminOrderCardProps {
    order: DbOrder
    onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void
}

export function AdminOrderCard({ order, onStatusUpdate }: AdminOrderCardProps) {
    const [expanded, setExpanded] = useState(false)
    const [updating, setUpdating] = useState(false)
    const currentStatus = order.status as OrderStatus
    const config = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.PENDING
    const StatusIcon = config.icon

    const date = new Date(order.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })

    async function handleStatusUpdate(newStatus: OrderStatus) {
        setUpdating(true)
        try {
            const res = await fetch(`/api/admin/orders/${order.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            if (res.ok) {
                onStatusUpdate(order.id, newStatus)
            }
        } finally {
            setUpdating(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden transition-shadow hover:shadow-md">
            <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[var(--color-text-muted)]">
                            #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <Badge variant="outline" className={cn('text-xs font-medium px-2 py-0.5 rounded-full border flex items-center gap-1', config.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                        </Badge>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">{date}</p>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-surface-3)]">
                        <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs">{order.user?.name ?? `Cliente #${order.id.slice(-4).toUpperCase()}`}</span>
                </div>

                <span className="font-bold text-[var(--color-brand)] flex-shrink-0">{formatPrice(order.total)}</span>

                <button
                    onClick={() => setExpanded(v => !v)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-2)] transition-colors flex-shrink-0"
                >
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
            </div>

            <div className="flex gap-2 px-5 pb-4">
                {order.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
                        {item.meal?.thumbnail && (
                            <Image src={item.meal.thumbnail} alt={item.meal?.name ?? ''} fill className="object-cover" sizes="40px" />
                        )}
                        {item.quantity > 1 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">×{item.quantity}</span>
                            </div>
                        )}
                    </div>
                ))}
                {order.items.length > 4 && (
                    <div className="h-10 w-10 rounded-lg bg-[var(--color-surface-3)] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[var(--color-text-muted)]">+{order.items.length - 4}</span>
                    </div>
                )}
                <span className="text-xs text-[var(--color-text-muted)] self-center ml-1">
                    {order.items.reduce((a, i) => a + i.quantity, 0)} itens
                </span>
            </div>

            {expanded && (
                <div className="border-t border-[var(--color-border)] px-5 py-4 space-y-4">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Itens do pedido</p>
                        {order.items.map((item) => (
                            <Link key={item.id} href={item.meal ? `/meal/${item.mealId}` : '#'} target="_blank"
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors group">
                                <div className="relative h-11 w-11 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--color-surface-2)]">
                                    {item.meal?.thumbnail && (
                                        <Image src={item.meal.thumbnail} alt={item.meal?.name ?? ''} fill className="object-cover" sizes="44px" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate group-hover:text-[var(--color-brand)] transition-colors">
                                        {item.meal?.name ?? item.mealId}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-muted)]">{item.quantity}× {formatPrice(item.price)}</p>
                                </div>
                                <span className="text-sm font-semibold flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="flex justify-between items-center py-2 border-t border-[var(--color-border)] font-bold">
                        <span>Total</span>
                        <span className="text-[var(--color-brand)]">{formatPrice(order.total)}</span>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Atualizar status</p>
                        <div className="flex flex-wrap gap-2">
                            {ACTIONS.filter(a => a.status !== currentStatus).map((action) => (
                                <button
                                    key={action.status}
                                    onClick={() => handleStatusUpdate(action.status)}
                                    disabled={updating}
                                    className={cn('px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 disabled:opacity-50', action.style)}
                                >
                                    {action.label}
                                </button>
                            ))}
                            {currentStatus === 'CANCELLED' && (
                                <p className="text-xs text-[var(--color-text-muted)] self-center">Pedido cancelado — nenhuma ação disponível</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}