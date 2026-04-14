import { Metadata } from 'next'
import { AdminOrdersClient } from './AdminOrdersClient'

export const metadata: Metadata = { title: 'Admin — Pedidos' }

export default function AdminOrdersPage() {
    return <AdminOrdersClient />
}