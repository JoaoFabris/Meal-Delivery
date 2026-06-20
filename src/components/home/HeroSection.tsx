'use client'

import { Suspense } from 'react'
import { SearchBar } from '@/components/meal/SearchBar'

export function HeroSection() {
    return (
        <section className="relative rounded-3xl overflow-hidden text-white text-center min-h-[320px] flex items-center justify-center">
            {/* Fundo animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#c0392b] via-[var(--color-brand)] to-[#ff6b35]">
                {/* Ondas animadas */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='1' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,128,864,144C960,160,1056,160,1152,144C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'bottom',
                        }}
                    />
                </div>

                {/* Bolhas animadas */}
                <div className="absolute top-8 left-8 w-32 h-32 rounded-full bg-white/10 animate-pulse" />
                <div className="absolute top-4 right-16 w-20 h-20 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-8 left-24 w-16 h-16 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-4 right-8 w-24 h-24 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-1/2 left-4 w-10 h-10 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '0.8s' }} />

                {/* Grade de pontos */}
                <div
                    className="absolute inset-0 opacity-15"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: '28px 28px',
                    }}
                />
            </div>

            {/* Conteúdo */}
            <div className="relative z-10 space-y-5 px-6 py-12">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide">
                    Bem-vindo ao FoodApp
                </div>

                <h1 className="text-3xl sm:text-5xl font-black leading-tight drop-shadow-sm">
                    O que você quer
                    <br />
                    <span className="text-white/90">comer hoje?</span>
                </h1>

                <p className="text-sm opacity-80 max-w-sm mx-auto leading-relaxed">
                    Explore centenas de pratos do mundo todo, entregues até você com rapidez e sabor.
                </p>

                {/* SearchBar */}
                <div className="mx-auto max-w-md pt-1">
                    <Suspense>
                        <SearchBar hero />
                    </Suspense>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center gap-8 pt-3">
                    {[
                        { label: 'Pratos', value: '200+' },
                        { label: 'Categorias', value: '14' },
                        { label: 'Países', value: '30+' },
                    ].map(({ label, value }, i) => (
                        <div key={label} className="text-center">
                            {i > 0 && <div className="absolute -left-4 top-1/2 -translate-y-1/2 h-6 w-px bg-white/30" />}
                            <p className="text-2xl font-black drop-shadow-sm">{value}</p>
                            <p className="text-xs opacity-70 font-medium">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}