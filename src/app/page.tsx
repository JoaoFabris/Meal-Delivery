import { Suspense } from 'react';
import { getCategories } from '@/lib/api/mealdb';
import { CategoryFilter } from '@/components/meal/CategoryFilter';
import { SearchBar } from '@/components/meal/SearchBar';
import { MealGrid } from '@/components/meal/MealGrid';
import { MealCardSkeleton } from '@/components/meal/MealCardSkeleton';

interface HomeProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { search = '', category = 'Todas' } = await searchParams;
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-r from-[var(--color-brand)] to-[#ff6b35] p-8 text-white text-center">
        <p className="text-sm font-medium opacity-80 mb-1">
          Bem-vindo ao FoodApp{' '}
        </p>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-2">
          O que você quer
          <br />
          comer hoje?
        </h1>
        <p className="text-sm opacity-75">
          Pratos de todo o mundo, entregues até você.
        </p>
      </section>

      {/* Filtros */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex-shrink-0">
            Categorias
          </h2>
          <div className="sm:ml-auto w-full sm:max-w-xs">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
        </div>

        <Suspense>
          <CategoryFilter categories={categories} />
        </Suspense>
      </section>

      {/* Título da seção de pratos */}
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
  );
}
