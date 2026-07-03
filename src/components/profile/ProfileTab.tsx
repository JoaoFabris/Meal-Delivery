'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Eye, EyeOff, Loader2, Save, KeyRound, ChevronDown, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function ProfileTab() {
    const { data: session, update } = useSession()
    const user = session?.user
    const isGoogleUser = !!(user?.image && user.image.includes('googleusercontent'))

    const [name, setName] = useState(user?.name ?? '')
    const [showPasswordSection, setShowPasswordSection] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)

    // Validação em tempo real
    const hasMinLength = newPassword.length >= 6
    const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword
    const confirmHasError = confirmPassword.length > 0 && newPassword !== confirmPassword
    const isChangingPassword = !!(currentPassword || newPassword || confirmPassword)
    const passwordSectionInvalid =
        isChangingPassword && (!currentPassword || !hasMinLength || !passwordsMatch)

    function closePasswordSection() {
        setShowPasswordSection(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (newPassword && newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem')
            return
        }

        if (newPassword && newPassword.length < 6) {
            toast.error('A nova senha deve ter no mínimo 6 caracteres')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    ...(newPassword && { currentPassword, newPassword }),
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error ?? 'Erro ao salvar alterações')
                return
            }

            await update({ name: data.user.name })
            toast.success('Perfil atualizado com sucesso!')
            closePasswordSection()
        } catch {
            toast.error('Erro de conexão. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md space-y-6">
            <div>
                <h2 className="text-lg font-bold">Editar perfil</h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                    Atualize suas informações pessoais
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-text-muted)]">Nome</label>
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome completo"
                        required
                        className="h-10 rounded-xl"
                    />
                </div>

                {/* Email — bloqueado */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-text-muted)]">
                        E-mail {isGoogleUser && <span className="text-[var(--color-brand)]">(conta Google)</span>}
                    </label>
                    <Input
                        type="email"
                        value={user?.email ?? ''}
                        disabled
                        className="h-10 rounded-xl opacity-60 cursor-not-allowed"
                    />
                </div>

                {/* Senha — só para usuários com email/senha */}
                {!isGoogleUser && (
                    <div className="pt-2 border-t border-[var(--color-border)]">
                        {/* Toggle da seção */}
                        <button
                            type="button"
                            onClick={() => (showPasswordSection ? closePasswordSection() : setShowPasswordSection(true))}
                            className="flex w-full items-center justify-between py-3 text-left"
                        >
                            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                                <KeyRound className="h-4 w-4 text-[var(--color-text-muted)]" />
                                Alterar senha
                            </span>
                            <ChevronDown
                                className={cn(
                                    'h-4 w-4 text-[var(--color-text-muted)] transition-transform duration-200',
                                    showPasswordSection && 'rotate-180'
                                )}
                            />
                        </button>

                        {showPasswordSection && (
                            <div className="space-y-4 pb-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-[var(--color-text-muted)]">Senha atual</label>
                                    <div className="relative">
                                        <Input
                                            type={showCurrent ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Sua senha atual"
                                            autoComplete="current-password"
                                            className="h-11 rounded-xl pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrent(!showCurrent)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] p-1"
                                            aria-label={showCurrent ? 'Ocultar senha' : 'Mostrar senha'}
                                        >
                                            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-[var(--color-text-muted)]">Nova senha</label>
                                    <div className="relative">
                                        <Input
                                            type={showNew ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres"
                                            autoComplete="new-password"
                                            className="h-11 rounded-xl pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] p-1"
                                            aria-label={showNew ? 'Ocultar senha' : 'Mostrar senha'}
                                        >
                                            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {/* Indicador de força mínima */}
                                    {newPassword.length > 0 && (
                                        <p
                                            className={cn(
                                                'flex items-center gap-1 text-xs pt-0.5',
                                                hasMinLength ? 'text-green-600' : 'text-[var(--color-text-muted)]'
                                            )}
                                        >
                                            {hasMinLength ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                            Mínimo de 6 caracteres
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-[var(--color-text-muted)]">Confirmar nova senha</label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repita a nova senha"
                                            autoComplete="new-password"
                                            aria-invalid={confirmHasError}
                                            className={cn(
                                                'h-11 rounded-xl pr-10',
                                                confirmHasError && 'border-red-300 focus-visible:ring-red-200',
                                                passwordsMatch && 'border-green-300 focus-visible:ring-green-200'
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] p-1"
                                            aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                                        >
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {confirmPassword.length > 0 && (
                                        <p
                                            className={cn(
                                                'flex items-center gap-1 text-xs pt-0.5',
                                                passwordsMatch ? 'text-green-600' : 'text-red-500'
                                            )}
                                        >
                                            {passwordsMatch ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                            {passwordsMatch ? 'As senhas coincidem' : 'As senhas não coincidem'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading || passwordSectionInvalid}
                    className="w-full h-11 rounded-xl bg-[var(--color-brand)] hover:opacity-90 font-medium gap-2"
                >
                    {loading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <><Save className="h-4 w-4" /> Salvar alterações</>
                    }
                </Button>
            </form>
        </div>
    )
}