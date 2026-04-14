'use client'

import Link from 'next/link'
import { ClipboardList, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice } from '@/lib/utils'

interface Props {
    adminName: string
}

export function AdminDashboardClient({ adminName }: Props) {
    const { orders } = useCartStore()

    const stats = {
        total: orders.length,
        confirmed: orders.filter((o) => o.status === 'confirmed').length,
        pending: orders.filter((o) => o.status === 'pending').length,
        delivered: orders.filter((o) => o.status === 'delivered').length,
        revenue: orders.reduce((acc, o) => acc + o.total, 0),
    }

    const CARDS = [
        { label: 'Total de pedidos', value: stats.total, icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
        { label: 'Confirmados', value: stats.confirmed, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
        { label: 'Pendentes', value: stats.pending, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
        { label: 'Entregues', value: stats.delivered, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
    ]

    return (
        <div className="space-y-8 max-w-6xl mx-auto">

            {/* Boas vindas */}
            <div>
                <h2 className="text-2xl font-black">Olá, {adminName.split(' ')[0]} 👋</h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Aqui está um resumo geral do FoodApp.
                </p>
            </div>

            {/* Cards de stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CARDS.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-[var(--color-border)] p-5 space-y-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black">{value}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Receita total */}
            <div className="bg-gradient-to-r from-[var(--color-brand)] to-[#ff6b35] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-5 w-5 opacity-80" />
                    <p className="text-sm font-medium opacity-80">Receita total acumulada</p>
                </div>
                <p className="text-4xl font-black">{formatPrice(stats.revenue)}</p>
                <p className="text-xs opacity-60 mt-1">
                    Baseado em {stats.total} {stats.total === 1 ? 'pedido' : 'pedidos'}
                </p>
            </div>

            {/* Atalho para pedidos */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 flex items-center justify-between">
                <div>
                    <p className="font-semibold">Gerenciar pedidos</p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Veja, filtre e atualize o status dos pedidos
                    </p>
                </div>
                <Link
                    href="/admin/orders"
                    className="flex-shrink-0 rounded-xl bg-[var(--color-brand)] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[var(--color-brand-dark)] transition-colors"
                >
                    Ver pedidos →
                </Link>
            </div>
        </div>
    )
}