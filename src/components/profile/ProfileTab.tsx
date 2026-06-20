'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Eye, EyeOff, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function ProfileTab() {
    const { data: session, update } = useSession()
    const user = session?.user
    const isGoogleUser = !!(user?.image && user.image.includes('googleusercontent'))

    const [name, setName] = useState(user?.name ?? '')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (newPassword && newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem')
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
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
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
                    <div className="space-y-4 pt-2 border-t border-[var(--color-border)]">
                        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide pt-2">
                            Alterar senha
                        </p>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-[var(--color-text-muted)]">Senha atual</label>
                            <div className="relative">
                                <Input
                                    type={showCurrent ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Sua senha atual"
                                    className="h-10 rounded-xl pr-10"
                                />
                                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
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
                                    minLength={6}
                                    className="h-10 rounded-xl pr-10"
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-[var(--color-text-muted)]">Confirmar nova senha</label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repita a nova senha"
                                className="h-10 rounded-xl"
                            />
                        </div>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 rounded-xl bg-[var(--color-brand)] hover:opacity-90 font-medium gap-2"
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