'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { Toaster } from '@/components/ui/sonner'
import { useEffect } from 'react'
import { useFavoritesStore } from '@/lib/store/favorites.store'

function FavoritesSyncer() {
    const { data: session } = useSession()
    const { setFavoriteIds, clearFavorites } = useFavoritesStore()

    useEffect(() => {
        if (!session?.user?.email) {
            clearFavorites()
            return
        }
        fetch('/api/favorites')
            .then(res => res.json())
            .then(data => setFavoriteIds(data.favorites ?? []))
    }, [session?.user?.email])

    return null
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <FavoritesSyncer />
            {children}
            <Toaster
                position="top-center"
                richColors
                offset={70}
                toastOptions={{
                    style: {
                        background: 'white',
                    },
                }}
            />
        </SessionProvider>
    )
}