'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { Check } from 'lucide-react';
import { Category } from '@/types/meal.types';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('category') ?? 'Todas';
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  function onMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    const walk = (x - startX.current) * 1.5;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }

  function onMouseUp() { isDragging.current = false; }

  function handleSelect(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    if (category === 'Todas' || category === active) {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  const all = [
    { idCategory: '0', strCategory: 'Todas', strCategoryThumb: '', strCategoryDescription: '' },
    ...categories,
  ];

  return (
    <div
      ref={scrollRef}
      // py-2 garante espaço vertical para o scale-105 não ser cortado
      className="flex gap-3 overflow-x-auto scrollbar-hide py-2 pb-3 cursor-grab active:cursor-grabbing select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {all.map((cat) => {
        const isActive = active === cat.strCategory;
        return (
          <button
            key={cat.idCategory}
            onClick={() => handleSelect(cat.strCategory)}
            className={cn(
              // overflow-hidden removido daqui — cada camada interna tem seu próprio rounded
              'flex-shrink-0 relative rounded-2xl transition-all duration-300 group w-28 h-28',
              isActive
                ? 'ring-2 ring-[var(--color-brand)] ring-inset scale-105 shadow-xl shadow-[var(--color-brand)]/25'
                : 'hover:scale-105 hover:shadow-lg hover:shadow-black/15'
            )}
          >
            {/* Fundo */}
            {cat.strCategoryThumb ? (
              // overflow-hidden + rounded-2xl movidos para cá
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <Image
                  src={cat.strCategoryThumb}
                  alt={cat.strCategory}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="112px"
                />
              </div>
            ) : (
              <div className="absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-brand)] to-[#ff6b35] flex items-center justify-center text-4xl">
                🍽️
              </div>
            )}

            {/* Overlay — rounded-2xl adicionado para seguir o recorte */}
            <div className={cn(
              'absolute inset-0 rounded-2xl transition-all duration-300',
              isActive
                ? 'bg-gradient-to-t from-black/75 via-black/20 to-[var(--color-brand)]/20'
                : 'bg-gradient-to-t from-black/65 via-black/10 to-transparent group-hover:from-black/75'
            )} />

            {/* Checkmark quando ativo */}
            {isActive && (
              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[var(--color-brand)] flex items-center justify-center shadow-md">
                <Check className="h-3 w-3 text-white stroke-[3]" />
              </div>
            )}

            {/* Nome */}
            <div className="absolute bottom-0 inset-x-0 px-2 pb-2.5 pt-4 bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl">
              <p className="text-white text-[11px] font-bold text-center leading-tight drop-shadow">
                {cat.strCategory}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}