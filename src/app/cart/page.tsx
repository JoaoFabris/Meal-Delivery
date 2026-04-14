import type { Metadata } from 'next'
import { CartPageClient } from './CartPageClient'

export const metadata: Metadata = {
    title: 'Carrinho',
}

export default function CartPage() {
    return <CartPageClient />
}