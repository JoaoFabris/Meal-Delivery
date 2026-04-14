import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Order } from '@/types/meal.types'

// Estende o tipo Order para aceitar 'cancelled'
type ExtendedStatus = Order['status'] | 'cancelled'

interface AdminOrdersStore {
  // Mapa de orderId -> status sobrescrito pelo admin
  overrides: Record<string, ExtendedStatus>
  updateStatus: (orderId: string, status: ExtendedStatus) => void
  getStatus: (orderId: string) => ExtendedStatus | undefined
}

export const useAdminOrderStore = create<AdminOrdersStore>()(
  persist(
    (set, get) => ({
      overrides: {},

      updateStatus: (orderId, status) => {
        set({
          overrides: { ...get().overrides, [orderId]: status },
        })
      },

      getStatus: (orderId) => {
        return get().overrides[orderId]
      },
    }),
    { name: 'foodapp-admin-orders' }
  )
)