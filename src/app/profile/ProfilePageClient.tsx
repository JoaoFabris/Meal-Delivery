'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Heart, ClipboardList, User, LogOut } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { FavoritesTab } from '@/components/profile/FavoritesTab'
import { OrdersTab } from '@/components/profile/OrdersTab'
import { useFavoritesStore } from '@/lib/store/favorites.store'
import { useCartStore } from '@/lib/store/cart.store'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'favorites', label: 'Favoritos', icon: Heart },
  { id: 'orders', label: 'Pedidos', icon: ClipboardList },
]

export function ProfilePageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') ?? 'favorites'

  const { data: session } = useSession()
  const user = session?.user

  const { favorites } = useFavoritesStore()
  const { orders } = useCartStore()

  const counts: Record<string, number> = {
    favorites: favorites.length,
    orders: orders.length,
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  function setTab(tab: string) {
    router.push(`/profile?tab=${tab}`, { scroll: false })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Card do usuário */}
      <div className="bg-white rounded-3xl border border-[var(--color-border)] p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name ?? ''}
              className="h-16 w-16 rounded-full object-cover shadow-md flex-shrink-0"
            />
          ) : (
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[#ff6b35] text-white text-xl font-black shadow-md">
              {initials}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black truncate">{user?.name}</h1>
            <p className="text-sm text-[var(--color-text-muted)] truncate">{user?.email}</p>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Editar</span>
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        <Separator className="my-5" />

        {/* Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-2xl bg-[var(--color-surface-2)]">
            <p className="text-2xl font-black text-[var(--color-brand)]">{favorites.length}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Favoritos</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-[var(--color-surface-2)]">
            <p className="text-2xl font-black text-[var(--color-brand)]">{orders.length}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Pedidos</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-[var(--color-surface-2)] col-span-2 sm:col-span-1">
            <p className="text-2xl font-black text-[var(--color-brand)]">
              {orders.reduce((acc, o) => acc + o.items.reduce((a, i) => a + i.quantity, 0), 0)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Pratos pedidos</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 p-1 bg-white rounded-2xl border border-[var(--color-border)] w-fit mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-[var(--color-brand)] text-white shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {counts[tab.id] > 0 && (
                  <span
                    className={cn(
                      'flex h-5 min-w-5 items-center justify-center rounded-full text-[11px] font-bold px-1.5',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'
                    )}
                  >
                    {counts[tab.id]}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {activeTab === 'favorites' && <FavoritesTab />}
        {activeTab === 'orders' && <OrdersTab />}
      </div>
    </div>
  )
}