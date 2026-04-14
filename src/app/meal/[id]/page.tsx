import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getMealById } from '@/lib/api/mealdb'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AddToCartButton } from '@/components/meal/AddToCartButton'
import { FavoriteButton } from '@/components/meal/FavoriteButton'
import { YoutubePlayer } from '@/components/meal/YoutubePlayer'
import { formatPrice } from '@/lib/utils'
import {
    MapPin,
    Tag,
    ChefHat,
    FlaskConical,
    Clock,
} from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const meal = await getMealById(id)
    if (!meal) return { title: 'Prato não encontrado' }
    return {
        title: meal.name,
        description: `${meal.category} · ${meal.area} · ${formatPrice(meal.price)}`,
    }
}

export default async function MealDetailPage({ params }: Props) {
    const { id } = await params
    const meal = await getMealById(id)

    if (!meal) notFound()

    const steps = meal.instructions
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 10)

    return (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                {/* Coluna esquerda — Imagem + Vídeo */}
                <div className="space-y-4">

                    {/* Foto do prato */}
                    <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-xl">
                        <Image
                            src={meal.thumbnail}
                            alt={meal.name}
                            fill
                            priority
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                    </div>

                    {/* Player de vídeo — lazy, só carrega iframe ao clicar */}
                    {meal.youtube && (
                        <YoutubePlayer
                            url={meal.youtube}
                            thumbnail={meal.thumbnail}
                            title={meal.name}
                        />
                    )}
                </div>

                {/* Coluna direita — Detalhes */}
                <div className="space-y-6">

                    {/* Cabeçalho */}
                    <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)] leading-tight">
                                {meal.name}
                            </h1>
                            <FavoriteButton meal={meal} />
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge
                                variant="secondary"
                                className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-full"
                            >
                                <Tag className="h-3.5 w-3.5" />
                                {meal.category}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-full"
                            >
                                <MapPin className="h-3.5 w-3.5" />
                                {meal.area}
                            </Badge>
                            {meal.tags.slice(0, 2).map((tag) => (
                                <Badge
                                    key={tag}
                                    className="px-3 py-1 text-sm rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand)] border-0"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        {/* Preço */}
                        <div className="flex items-center gap-3">
                            <p className="text-3xl font-black text-[var(--color-brand)]">
                                {formatPrice(meal.price)}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Entrega grátis</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Ingredientes */}
                    <div>
                        <h2 className="flex items-center gap-2 text-base font-bold mb-3">
                            <FlaskConical className="h-4 w-4 text-[var(--color-brand)]" />
                            Ingredientes
                            <span className="text-xs font-normal text-[var(--color-text-muted)]">
                                ({meal.ingredients.length} itens)
                            </span>
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {meal.ingredients.map((ing, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand)] flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium truncate">{ing.name}</p>
                                        {ing.measure && (
                                            <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                                                {ing.measure}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Modo de preparo */}
                    <div>
                        <h2 className="flex items-center gap-2 text-base font-bold mb-3">
                            <ChefHat className="h-4 w-4 text-[var(--color-brand)]" />
                            Como preparar
                        </h2>
                        <div className="space-y-3 max-h-52 overflow-y-auto pr-1 scrollbar-hide">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-white text-xs font-bold mt-0.5">
                                        {idx + 1}
                                    </span>
                                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Adicionar ao carrinho */}
                    <AddToCartButton meal={meal} />
                </div>
            </div>
        </div>
    )
}