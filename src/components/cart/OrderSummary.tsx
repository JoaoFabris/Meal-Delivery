'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart.store';
import { formatPrice } from '@/lib/utils';
import { LogIn } from 'lucide-react';
import { CheckCircle2, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { validateSessionForOrder, createOrder } from '@/app/cart/actions';

const DELIVERY_FEE = 0;
const DISCOUNT_CODE = 'FOODAPP10';
const DISCOUNT_PERCENT = 10;

export function OrderSummary() {
  const { items, totalPrice, totalItems, checkout } = useCartStore();
  const { status } = useSession();
  const [coupon, setCoupon] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const subtotal = totalPrice();
  const discount = discountApplied ? subtotal * (DISCOUNT_PERCENT / 100) : 0;
  const total = subtotal - discount + DELIVERY_FEE;

  function handleCoupon() {
    if (coupon.trim().toUpperCase() === DISCOUNT_CODE) {
      setDiscountApplied(true);
      toast.success(`Cupom aplicado! ${DISCOUNT_PERCENT}% de desconto 🎉`);
    } else {
      toast.error('Cupom inválido');
    }
  }

  async function handleCheckout() {
    setLoading(true);

    const validation = await validateSessionForOrder();
    if (!validation.ok) {
      toast.error(validation.message ?? 'Faça login para concluir seu pedido');
      setLoading(false);
      router.push('/login');
      return;
    }

    try {
      await createOrder(items, total);
      checkout();
      router.push('/cart/success');
    } catch {
      toast.error('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }
  const isLoggedIn = status === 'authenticated';

  return (
    <div className="space-y-4">
      {/* Cupom */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2 text-sm">
          <Tag className="h-4 w-4 text-[var(--color-brand)]" />
          Cupom de desconto
        </h3>

        {discountApplied ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>
              {DISCOUNT_CODE} — {DISCOUNT_PERCENT}% aplicado!
            </span>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder={`Ex: ${DISCOUNT_CODE}`}
              className="flex-1 h-10 rounded-xl border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleCoupon()}
            />
            <Button
              onClick={handleCoupon}
              variant="outline"
              className="h-10 rounded-xl text-sm font-semibold border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white transition-all"
            >
              Aplicar
            </Button>
          </div>
        )}
      </div>

      {/* Resumo de valores */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 space-y-3">
        <h3 className="font-semibold text-sm">Resumo do pedido</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-[var(--color-text-secondary)]">
            <span>
              Subtotal ({totalItems()} {totalItems() === 1 ? 'item' : 'itens'})
            </span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-[var(--color-text-secondary)]">
            <span>Taxa de entrega</span>
            <span className="text-green-600 font-medium">Grátis</span>
          </div>

          {discountApplied && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Desconto ({DISCOUNT_PERCENT}%)</span>
              <span>− {formatPrice(discount)}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-base">
          <span>Total</span>
          <span className="text-[var(--color-brand)] text-xl">
            {formatPrice(total)}
          </span>
        </div>

        {/* Botão finalizar */}
        {isLoggedIn ? (
          <Button
            onClick={handleCheckout}
            disabled={loading || items.length === 0}
            className="w-full h-13 text-base font-bold rounded-xl mt-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Confirmando sessão...
              </>
            ) : (
              `Finalizar pedido · ${formatPrice(total)}`
            )}
          </Button>
        ) : (
          <div className="space-y-3 mt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-brand-light)] border border-red-100">
              <LogIn className="h-5 w-5 text-[var(--color-brand)] flex-shrink-0" />
              <p className="text-xs text-[var(--color-brand)] font-medium">
                Faça login para concluir seu pedido
              </p>
            </div>
            <Button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                toast('Clique em "Entrar" no topo da página 👆', {
                  icon: '🔒',
                });
              }}
              variant="outline"
              className="w-full h-12 rounded-xl font-semibold border-2 border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white transition-all gap-2"
            >
              <LogIn className="h-4 w-4" />
              Entrar para finalizar
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-[var(--color-text-muted)]">
          🔒 Pagamento 100% seguro e criptografado
        </p>
      </div>
    </div>
  );
}
