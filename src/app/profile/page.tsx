import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ProfilePageClient } from './ProfilePageClient'

export const metadata: Metadata = {
    title: 'Meu Perfil',
}

export default function ProfilePage() {
    return (
        <Suspense>
            <ProfilePageClient />
        </Suspense>
    )
}