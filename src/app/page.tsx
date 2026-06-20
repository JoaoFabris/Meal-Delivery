import { Suspense } from 'react'
import { getCategories } from '@/lib/api/mealdb'
import { CategoryFilter } from '@/components/meal/CategoryFilter'
import { MealGrid } from '@/components/meal/MealGrid'
import { MealCardSkeleton } from '@/components/meal/MealCardSkeleton'
import { HeroSection } from '@/components/home/HeroSection'

interface HomeProps {
  searchParams: Promise<{ search?: string; category?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { search = '', category = 'Todas' } = await searchParams
  const categories = await getCategories()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <HeroSection />

      {/* Filtros */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
          Categorias
        </h2>
        <Suspense>
          <CategoryFilter categories={categories} />
        </Suspense>
      </section>

      {/* Pratos */}
      <section>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-5">
          {search
            ? `Resultados para "${search}"`
            : category !== 'Todas'
              ? category
              : 'Destaques do dia'}
        </h2>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <MealCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <MealGrid search={search} category={category} />
        </Suspense>
      </section>
    </div>
  )
}