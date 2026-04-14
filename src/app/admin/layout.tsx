import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user?.isAdmin) redirect('/admin/login')

    return (
        <div className="min-h-screen bg-[var(--color-surface-2)] flex">
            <AdminSidebar />
            <div className="flex flex-col flex-1 min-w-0">
                <AdminHeader user={session.user} />
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    )
}