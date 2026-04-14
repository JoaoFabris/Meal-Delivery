import type { Metadata } from 'next'
import { ProfilePageClient } from './ProfilePageClient'

export const metadata: Metadata = {
    title: 'Meu Perfil',
}

export default function ProfilePage() {
    return <ProfilePageClient />
}