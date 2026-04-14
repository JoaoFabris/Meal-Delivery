'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UserLoginClient() {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') ?? '/'

    return (
        <div className="min-h-screen flex">

            {/* Banner lateral */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[var(--color-brand)] flex-col justify-between p-12">
                {/* Padrão decorativo de fundo */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: '32px 32px',
                    }}
                />

                {/* Círculos decorativos */}
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white opacity-5" />
                <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-white opacity-5" />

                {/* Logo no topo */}
                <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <UtensilsCrossed className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-white font-black text-xl tracking-tight">FoodApp</span>
                </div>

                {/* Texto principal */}
                <div className="relative space-y-6">
                    <h2 className="text-4xl font-black text-white leading-tight">
                        Peça suas<br />refeições favoritas<br />com facilidade.
                    </h2>
                    <p className="text-white/70 text-base leading-relaxed max-w-xs">
                        Explore centenas de receitas, salve seus favoritos e acompanhe seus pedidos em um só lugar.
                    </p>

                    {/* Destaques */}
                    <div className="space-y-3 pt-2">
                        {[
                            'Favoritos salvos na sua conta',
                            'Histórico completo de pedidos',
                            'Experiência personalizada',
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-white/80 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rodapé do banner */}
                <p className="relative text-white/40 text-xs">
                    © {new Date().getFullYear()} FoodApp. Todos os direitos reservados.
                </p>
            </div>

            {/* Painel de login */}
            <div className="flex-1 flex items-center justify-center bg-[var(--color-surface-2)] px-6 py-12">
                <div className="w-full max-w-sm space-y-8">

                    {/* Header (visível só no mobile — no desktop o banner já tem) */}
                    <div className="lg:hidden text-center space-y-2">
                        <div className="flex justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand)] shadow-lg">
                                <UtensilsCrossed className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black">FoodApp</h1>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Faça login para continuar
                        </p>
                    </div>

                    {/* Título no desktop */}
                    <div className="hidden lg:block space-y-1">
                        <h1 className="text-2xl font-black">Bem-vindo de volta</h1>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Entre na sua conta para continuar
                        </p>
                    </div>

                    {/* Card de login */}
                    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 space-y-3 shadow-sm">
                        <Button
                            onClick={() => signIn('google', { callbackUrl })}
                            variant="outline"
                            className="w-full h-11 rounded-xl gap-3 font-medium hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-all"
                        >
                            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continuar com Google
                        </Button>
                    </div>

                    {/* Separador e link admin */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--color-border)]" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-[var(--color-surface-2)] px-3 text-xs text-[var(--color-text-muted)]">
                                    ou
                                </span>
                            </div>
                        </div>

                        <p className="text-center text-xs text-[var(--color-text-muted)]">
                            É administrador?{' '}
                            <a
                                href="/admin/login"
                                className="font-medium text-[var(--color-brand)] hover:underline"
                            >
                                Acesse o painel admin
                            </a>
                        </p>
                    </div>

                    <p className="text-center text-xs text-[var(--color-text-muted)]">
                        Ao entrar, você concorda com os nossos{' '}
                        <a href="#" className="underline hover:text-[var(--color-brand)]">Termos de uso</a>
                        {' '}e{' '}
                        <a href="#" className="underline hover:text-[var(--color-brand)]">Política de privacidade</a>.
                    </p>
                </div>
            </div>
        </div>
    )
}