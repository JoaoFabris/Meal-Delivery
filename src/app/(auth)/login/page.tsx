import { Suspense } from 'react'
import { UserLoginClient } from './UserLoginClient'

export const metadata = {
    title: 'Entrar | FoodApp',
    description: 'Faça login para acessar sua conta.',
}

export default function LoginPage() {
    return (
        <Suspense>
            <UserLoginClient />
        </Suspense>
    )
}