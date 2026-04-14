'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';
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

  // Drag to scroll
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
      className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 pr-4 cursor-grab active:cursor-grabbing select-none"
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
              'flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border',
              isActive
                ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-sm'
                : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]'
            )}
          >
            {cat.strCategoryThumb ? (
              <Image
                src={cat.strCategoryThumb}
                alt={cat.strCategory}
                width={28}
                height={28}
                className={cn(
                  'rounded-full object-cover flex-shrink-0',
                  isActive && 'brightness-0 invert'
                )}
              />
            ) : (
              <span className="text-lg leading-none">🍽️</span>
            )}
            {cat.strCategory}
          </button>
        );
      })}
    </div>
  );
}