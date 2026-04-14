'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
    quantity: number
    onIncrease: () => void
    onDecrease: () => void
    min?: number
    max?: number
    size?: 'sm' | 'md' | 'lg'
}

export function QuantitySelector({
    quantity,
    onIncrease,
    onDecrease,
    min = 1,
    max = 99,
    size = 'md',
}: QuantitySelectorProps) {
    const sizes = {
        sm: { btn: 'h-7 w-7', text: 'text-sm w-6', icon: 'h-3 w-3' },
        md: { btn: 'h-9 w-9', text: 'text-base w-8', icon: 'h-4 w-4' },
        lg: { btn: 'h-11 w-11', text: 'text-lg w-10', icon: 'h-5 w-5' },
    }
    const s = sizes[size]

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={onDecrease}
                disabled={quantity <= min}
                aria-label="Diminuir quantidade"
                className={cn(
                    'flex items-center justify-center rounded-full border-2 transition-all duration-200',
                    s.btn,
                    quantity <= min
                        ? 'border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50'
                        : 'border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white active:scale-95'
                )}
            >
                <Minus className={s.icon} />
            </button>

            <span className={cn('text-center font-bold tabular-nums', s.text)}>
                {quantity}
            </span>

            <button
                onClick={onIncrease}
                disabled={quantity >= max}
                aria-label="Aumentar quantidade"
                className={cn(
                    'flex items-center justify-center rounded-full border-2 transition-all duration-200',
                    s.btn,
                    quantity >= max
                        ? 'border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50'
                        : 'border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white active:scale-95'
                )}
            >
                <Plus className={s.icon} />
            </button>
        </div>
    )
}