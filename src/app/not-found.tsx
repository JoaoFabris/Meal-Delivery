import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-surface-3)]">
                <UtensilsCrossed className="h-10 w-10 text-[var(--color-text-muted)]" />
            </div>
            <div>
                <h1 className="text-3xl font-black mb-2">Prato não encontrado</h1>
                <p className="text-[var(--color-text-secondary)]">
                    Esse prato não existe ou foi removido do cardápio.
                </p>
            </div>
            <Button asChild className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] rounded-full px-8">
                <Link href="/">Voltar ao cardápio</Link>
            </Button>
        </div>
    )
}