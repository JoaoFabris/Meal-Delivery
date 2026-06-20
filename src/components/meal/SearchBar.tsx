'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { cn } from '@/lib/utils'

interface SearchBarProps {
    hero?: boolean
}

export function SearchBar({ hero }: SearchBarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const queryInUrl = searchParams.get('search') ?? ''
    const [value, setValue] = useState(queryInUrl)
    const [lastQueryInUrl, setLastQueryInUrl] = useState(queryInUrl)

    if (queryInUrl !== lastQueryInUrl) {
        setLastQueryInUrl(queryInUrl)
        setValue(queryInUrl)
    }

    const debouncedSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (term) {
            params.set('search', term)
        } else {
            params.delete('search')
        }
        router.push(`/?${params.toString()}`, { scroll: false })
    }, 400)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.value
        setValue(newValue)
        debouncedSearch(newValue)
    }

    function handleClear() {
        setValue('')
        debouncedSearch('')
    }

    return (
        <div className="relative w-full">
            <Search className={cn(
                'absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4',
                hero ? 'text-gray-400' : 'text-[var(--color-text-muted)]'
            )} />
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder="Buscar pelo nome do prato..."
                className={cn(
                    'w-full h-12 rounded-full pl-10 pr-9 text-sm outline-none transition-all text-gray-900',
                    hero
                        ? 'bg-white shadow-xl shadow-black/20 border-0 focus:ring-4 focus:ring-white/30 placeholder:text-gray-400'
                        : 'border border-[var(--color-border)] bg-white focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10'
                )}
            />
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}