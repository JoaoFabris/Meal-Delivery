'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/orders', label: 'Pedidos', icon: ClipboardList, exact: false },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden lg:flex w-56 flex-col bg-white border-r border-[var(--color-border)] min-h-screen">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[var(--color-border)]">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand)]">
                    <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <span className="font-black text-sm">FoodApp Admin</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV.map(({ href, label, icon: Icon, exact }) => {
                    const active = exact ? pathname === href : pathname.startsWith(href)
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                                active
                                    ? 'bg-[var(--color-brand)] text-white shadow-sm'
                                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]'
                            )}
                        >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            {label}
                        </Link>
                    )
                })}
            </nav>

            {/* Rodapé */}
            <div className="px-4 py-4 border-t border-[var(--color-border)]">
                <Link
                    href="/"
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors"
                >
                    ← Voltar ao site
                </Link>
            </div>
        </aside>
    )
}