import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Meal, Order } from '@/types/meal.types'

interface CartStore {
  items: CartItem[]
  orders: Order[]

  addItem: (meal: Meal, quantity?: number) => void
  removeItem: (mealId: string) => void
  updateQuantity: (mealId: string, quantity: number) => void
  clearCart: () => void
  checkout: () => Order

  // Computed (helpers)
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      orders: [],

      addItem: (meal, quantity = 1) => {
        const items = get().items
        const existing = items.find((i) => i.meal.id === meal.id)
        if (existing) {
          set({
            items: items.map((i) =>
              i.meal.id === meal.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          })
        } else {
          set({ items: [...items, { meal, quantity }] })
        }
      },

      removeItem: (mealId) => {
        set({ items: get().items.filter((i) => i.meal.id !== mealId) })
      },

      updateQuantity: (mealId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(mealId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.meal.id === mealId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      checkout: () => {
        const items = get().items
        const order: Order = {
          id: crypto.randomUUID(),
          items,
          total: get().totalPrice(),
          createdAt: new Date().toISOString(),
          status: 'confirmed',
        }
        set({ orders: [...get().orders, order], items: [] })
        return order
      },

      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((acc, i) => acc + i.meal.price * i.quantity, 0),
    }),
    {
      name: 'foodapp-cart', // persiste no localStorage
    }
  )
)