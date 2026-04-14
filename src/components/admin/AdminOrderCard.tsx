'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    ChevronDown,
    ChevronUp,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    User,
} from 'lucide-react'
import { Order } from '@/types/meal.types'
import { useAdminOrderStore } from '@/lib/store/adminOrders.store'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const STATUS_CONFIG = {
    pending: {
        label: 'Pendente',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Clock,
    },
    confirmed: {
        label: 'Confirmado',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle2,
    },
    delivered: {
        label: 'Entregue',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Truck,
    },
    cancelled: {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
    },
}

const ACTIONS: { label: string; status: Order['status']; style: string }[] = [
    {
        label: 'Confirmar',
        status: 'confirmed',
        style: 'border-green-300 text-green-700 hover:bg-green-50',
    },
    {
        label: 'Marcar entregue',
        status: 'delivered',
        style: 'border-blue-300 text-blue-700 hover:bg-blue-50',
    },
    {
        label: 'Cancelar',
        status: 'cancelled' as Order['status'],
        style: 'border-red-300 text-red-700 hover:bg-red-50',
    },
]

interface AdminOrderCardProps {
    order: Order
}

export function AdminOrderCard({ order }: AdminOrderCardProps) {
    const [expanded, setExpanded] = useState(false)
    const { updateStatus, getStatus } = useAdminOrderStore()

    const currentStatus = getStatus(order.id) ?? order.status
    const config = STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
    const StatusIcon = config.icon

    const date = new Date(order.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

    return (
        <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden transition-shadow hover:shadow-md">

            {/* Cabeçalho do card */}
            <div className="flex items-center gap-4 px-5 py-4">

                {/* ID + data */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[var(--color-text-muted)]">
                            #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <Badge
                            variant="outline"
                            className={cn('text-xs font-medium px-2 py-0.5 rounded-full border flex items-center gap-1', config.color)}
                        >
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                        </Badge>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">{date}</p>
                </div>

                {/* Info do usuário mock */}
                <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-surface-3)]">
                        <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs">Cliente #{order.id.slice(-4).toUpperCase()}</span>
                </div>

                {/* Total */}
                <span className="font-bold text-[var(--color-brand)] flex-shrink-0">
                    {formatPrice(order.total)}
                </span>

                {/* Toggle expandir */}
                <button
                    onClick={() => setExpanded((v) => !v)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-2)] transition-colors flex-shrink-0"
                >
                    {expanded ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </button>
            </div>

            {/* Preview dos itens (sempre visível) */}
            <div className="flex gap-2 px-5 pb-4">
                {order.items.slice(0, 4).map((item) => (
                    <div
                        key={item.meal.id}
                        className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0"
                    >
                        <Image
                            src={item.meal.thumbnail}
                            alt={item.meal.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                        />
                        {item.quantity > 1 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">×{item.quantity}</span>
                            </div>
                        )}
                    </div>
                ))}
                {order.items.length > 4 && (
                    <div className="h-10 w-10 rounded-lg bg-[var(--color-surface-3)] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[var(--color-text-muted)]">
                            +{order.items.length - 4}
                        </span>
                    </div>
                )}
                <span className="text-xs text-[var(--color-text-muted)] self-center ml-1">
                    {order.items.reduce((a, i) => a + i.quantity, 0)} itens
                </span>
            </div>

            {/* Detalhes expandidos */}
            {expanded && (
                <div className="border-t border-[var(--color-border)] px-5 py-4 space-y-4">

                    {/* Lista completa de itens */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                            Itens do pedido
                        </p>
                        {order.items.map((item) => (
                            <Link
                                key={item.meal.id}
                                href={`/meal/${item.meal.id}`}
                                target="_blank"
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors group"
                            >
                                <div className="relative h-11 w-11 rounded-xl overflow-hidden flex-shrink-0">
                                    <Image
                                        src={item.meal.thumbnail}
                                        alt={item.meal.name}
                                        fill
                                        className="object-cover"
                                        sizes="44px"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate group-hover:text-[var(--color-brand)] transition-colors">
                                        {item.meal.name}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-muted)]">
                                        {item.quantity}× {formatPrice(item.meal.price)}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold flex-shrink-0">
                                    {formatPrice(item.meal.price * item.quantity)}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center py-2 border-t border-[var(--color-border)] font-bold">
                        <span>Total</span>
                        <span className="text-[var(--color-brand)]">{formatPrice(order.total)}</span>
                    </div>

                    {/* Ações de status */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                            Atualizar status
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {ACTIONS.filter((a) => a.status !== currentStatus).map((action) => (
                                <button
                                    key={action.status}
                                    onClick={() => updateStatus(order.id, action.status)}
                                    className={cn(
                                        'px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-200',
                                        action.style
                                    )}
                                >
                                    {action.label}
                                </button>
                            ))}
                            {currentStatus === 'cancelled' && (
                                <p className="text-xs text-[var(--color-text-muted)] self-center">
                                    Pedido cancelado — nenhuma ação disponível
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}