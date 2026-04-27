'use client'

// src/app/reset-password/page.tsx
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { UtensilsCrossed, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Token ausente na URL
    if (!token) {
        return (
            <div className="text-center space-y-4 py-4">
                <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                    <h2 className="font-bold text-lg">Link inválido</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Este link de recuperação é inválido ou expirou.
                    </p>
                </div>
                <Link href="/forgot-password" className="text-sm text-[var(--color-brand)] hover:underline">
                    Solicitar novo link
                </Link>
            </div>
        )
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (password !== confirm) {
            setError('As senhas não coincidem.')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error?.message ?? 'Erro ao redefinir senha.')
                return
            }

            setSuccess(true)
            setTimeout(() => router.push('/login'), 3000)
        } catch {
            setError('Erro de conexão. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="text-center space-y-4 py-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                    <h2 className="font-bold text-lg">Senha redefinida!</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Sua senha foi alterada com sucesso. Redirecionando para o login...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-1">
                <h2 className="font-bold text-lg">Redefinir senha</h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                    Digite sua nova senha abaixo.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-text-muted)]">
                        Nova senha
                    </label>
                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(null) }}
                            required
                            minLength={6}
                            className="h-10 rounded-xl pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-text-muted)]">
                        Confirmar senha
                    </label>
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Repita a nova senha"
                        value={confirm}
                        onChange={(e) => { setConfirm(e.target.value); setError(null) }}
                        required
                        minLength={6}
                        className="h-10 rounded-xl"
                    />
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
                        : 'Salvar nova senha'}
                </Button>
            </form>
        </>
    )
}

export default function ResetPasswordPage() {
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

                <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm space-y-4">
                    <Suspense fallback={<div className="text-center text-sm text-[var(--color-text-muted)]">Carregando...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>

                <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors"
                >
                    Voltar para o login
                </Link>
            </div>
        </div>
    )
}