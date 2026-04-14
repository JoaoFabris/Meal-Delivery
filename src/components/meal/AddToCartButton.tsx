'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Check, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuantitySelector } from './QuantitySelector'
import { useCartStore } from '@/lib/store/cart.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { Meal } from '@/types/meal.types'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

interface AddToCartButtonProps {
  meal: Meal
}

export function AddToCartButton({ meal }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCartStore()
  const { isLoggedIn } = useAuthStore()
  const router = useRouter()

  const total = meal.price * quantity

  function handleAdd() {
    // Usuário não logado — bloqueia e avisa
    if (!isLoggedIn) {
      toast.error('Faça login para adicionar ao carrinho', {
        description: 'Clique em "Entrar" no topo da página.',
        icon: '🔒',
      })
      return
    }

    addItem(meal, quantity)
    setAdded(true)
    toast.success(`${quantity}x ${meal.name} adicionado ao carrinho!`)

    setTimeout(() => {
      setAdded(false)
      router.push('/cart')
    }, 1200)
  }

  // Se não logado — mostra botão de login no lugar
  if (!isLoggedIn) {
    return (
      <div className="space-y-3">
        <Button
          onClick={() => {
            // Scroll suave até o Header onde fica o botão de login
            window.scrollTo({ top: 0, behavior: 'smooth' })
            toast('Clique em "Entrar" no topo da página 👆', { icon: '🔒' })
          }}
          variant="outline"
          className="w-full h-12 text-base font-semibold rounded-2xl border-2 border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white transition-all gap-2"
        >
          <LogIn className="h-5 w-5" />
          Entrar para comprar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Seletor de quantidade */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Quantidade</p>
          <QuantitySelector
            quantity={quantity}
            onIncrease={() => setQuantity((q) => Math.min(q + 1, 99))}
            onDecrease={() => setQuantity((q) => Math.max(q - 1, 1))}
            size="lg"
          />
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Total</p>
          <p className="text-2xl font-black text-[var(--color-brand)]">
            {formatPrice(total)}
          </p>
        </div>
      </div>

      {/* Botão adicionar */}
      <Button
        onClick={handleAdd}
        disabled={added}
        className="w-full h-14 text-base font-bold rounded-2xl transition-all duration-300 gap-2"
        style={{ backgroundColor: added ? '#16a34a' : 'var(--color-brand)' }}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Adicionado! Redirecionando...
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            Adicionar ao carrinho · {formatPrice(total)}
          </>
        )}
      </Button>
    </div>
  )
}