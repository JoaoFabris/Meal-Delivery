'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AdminLoginClient() {
    const searchParams = useSearchParams()
    const isUnauthorized = searchParams.get('error') === 'unauthorized'

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-2)] px-4">
            <div className="w-full max-w-sm space-y-8">

                {/* Logo */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brand)] shadow-lg">
                            <ShieldCheck className="h-7 w-7 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black">Painel Admin</h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Acesso restrito a administradores
                    </p>
                </div>

                {/* Erro de não autorizado */}
                {isUnauthorized && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
                        <p className="text-sm font-medium text-red-700">
                            Sua conta não tem permissão de administrador.
                        </p>
                        <p className="text-xs text-red-500 mt-1">
                            Entre em contato com o responsável pelo sistema.
                        </p>
                    </div>
                )}

                {/* Botões de login */}
                <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 space-y-3 shadow-sm">
                    <p className="text-xs text-center text-[var(--color-text-muted)] mb-4">
                        Faça login com uma conta autorizada
                    </p>

                    <Button
                        onClick={() => signIn('google', { callbackUrl: '/admin' })}
                        variant="outline"
                        className="w-full h-11 rounded-xl gap-3 font-medium hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-all"
                    >
                        {/* SVG inline do Google para evitar dependência extra */}
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Entrar com Google
                    </Button>

                    <Button
                        onClick={() => signIn('github', { callbackUrl: '/admin' })}
                        variant="outline"
                        className="w-full h-11 rounded-xl gap-3 font-medium hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-all"
                    >
                        <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                        Entrar com GitHub
                    </Button>
                </div>

                <p className="text-center text-xs text-[var(--color-text-muted)]">
                    Apenas emails cadastrados em{' '}
                    <code className="font-mono bg-[var(--color-surface-3)] px-1 rounded">
                        ADMIN_EMAILS
                    </code>{' '}
                    têm acesso.
                </p>
            </div>
        </div>
    )
}