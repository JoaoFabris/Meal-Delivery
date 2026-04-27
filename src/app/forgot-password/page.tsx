'use client'

// src/app/forgot-password/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { UtensilsCrossed, ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/password/forgot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error?.message ?? 'Erro ao processar solicitação.')
                return
            }

            setSent(true)
        } catch {
            setError('Erro de conexão. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-2)] px-6 py-12">
            <div className="w-full max-w-sm space-y-6">

                {/* Logo */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand)] shadow-lg">
                            <UtensilsCrossed className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black">FoodApp</h1>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm space-y-4">

                    {sent ? (
                        // ── Estado de sucesso ──────────────────────────
                        <div className="text-center space-y-4 py-4">
                            <div className="flex justify-center">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="font-bold text-lg">Verifique seu e-mail</h2>
                                <p className="text-sm text-[var(--color-text-muted)]">
                                    Se <strong>{email}</strong> estiver cadastrado, você receberá
                                    as instruções para redefinir sua senha em breve.
                                </p>
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-2)] rounded-lg p-3">
                                Em desenvolvimento, verifique o terminal do servidor para ver o link de recuperação.
                            </p>
                        </div>
                    ) : (
                        // ── Formulário ─────────────────────────────────
                        <>
                            <div className="space-y-1">
                                <h2 className="font-bold text-lg">Esqueceu sua senha?</h2>
                                <p className="text-sm text-[var(--color-text-muted)]">
                                    Digite seu e-mail e enviaremos um link para redefinir sua senha.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-[var(--color-text-muted)]">
                                        E-mail
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                                        <Input
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(null) }}
                                            required
                                            className="h-10 rounded-xl pl-9"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                        {error}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 rounded-xl font-medium bg-[var(--color-brand)] hover:opacity-90"
                                >
                                    {loading
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : 'Enviar link de recuperação'}
                                </Button>
                            </form>
                        </>
                    )}
                </div>

                {/* Voltar */}
                <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para o login
                </Link>
            </div>
        </div>
    )
}