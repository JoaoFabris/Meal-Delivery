import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { AdminDashboardClient } from './AdminDashboardClient'

export const metadata: Metadata = { title: 'Admin — Dashboard' }

export default async function AdminDashboardPage() {
    const session = await auth()

    console.log(session?.user)

    if (!session?.user?.isAdmin) {
        redirect('/admin/login?error=unauthorized')
    }

    return <AdminDashboardClient adminName={session.user.name ?? 'Admin'} />
}