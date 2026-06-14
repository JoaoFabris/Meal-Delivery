import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '@/components/layout/Header'

// ── Mocks ─────────────────────────────────────────────────
const mockPush = jest.fn()
const mockSignOut = jest.fn()
const mockSignIn = jest.fn()

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}))

jest.mock('next-auth/react', () => ({
    useSession: jest.fn(),
    signIn: (...args: unknown[]) => mockSignIn(...args),
    signOut: (...args: unknown[]) => mockSignOut(...args),
}))

jest.mock('@/components/cart/CartSheet', () => ({
    CartSheet: () => <div data-testid="cart-sheet">CartSheet</div>,
}))

// Mock dos componentes UI do Radix (DropdownMenu não funciona bem em jsdom)
jest.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
        <div onClick={onClick}>{children}</div>
    ),
    DropdownMenuSeparator: () => <hr />,
}))

jest.mock('@/components/ui/avatar', () => ({
    Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AvatarFallback: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AvatarImage: () => null,
}))

const { useSession } = require('next-auth/react')

// ── Fixtures ──────────────────────────────────────────────
const userSession = {
    data: {
        user: { name: 'João Silva', email: 'joao@test.com', image: null, isAdmin: false },
    },
}

const adminSession = {
    data: {
        user: { name: 'Admin User', email: 'admin@test.com', image: null, isAdmin: true },
    },
}

describe('Header — sem sessão', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useSession.mockReturnValue({ data: null })
    })

    it('deve renderizar o logo "food"', () => {
        render(<Header />)
        expect(screen.getByText('food')).toBeInTheDocument()
    })

    it('deve renderizar o logo "app"', () => {
        render(<Header />)
        expect(screen.getByText('app')).toBeInTheDocument()
    })

    it('logo deve ser um link para a home', () => {
        render(<Header />)
        const logo = screen.getByText('food').closest('a')
        expect(logo).toHaveAttribute('href', '/')
    })

    it('deve mostrar botão "Entrar" quando não logado', () => {
        render(<Header />)
        expect(screen.getByText('Entrar')).toBeInTheDocument()
    })

    it('botão "Entrar" deve ser link para /login', () => {
        render(<Header />)
        const link = screen.getByText('Entrar').closest('a')
        expect(link).toHaveAttribute('href', '/login')
    })

    it('não deve mostrar CartSheet quando não logado', () => {
        render(<Header />)
        expect(screen.queryByTestId('cart-sheet')).not.toBeInTheDocument()
    })

    it('não deve mostrar badge Admin quando não logado', () => {
        render(<Header />)
        expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    })

    it('deve renderizar campo de busca desktop', () => {
        render(<Header />)
        expect(screen.getByPlaceholderText(/buscar pratos, cuisines/i)).toBeInTheDocument()
    })

    it('deve atualizar campo de busca ao digitar', () => {
        render(<Header />)
        const input = screen.getByPlaceholderText(/buscar pratos, cuisines/i) as HTMLInputElement
        fireEvent.change(input, { target: { value: 'pizza' } })
        expect(input.value).toBe('pizza')
    })

    it('não deve navegar ao submeter busca vazia', () => {
        render(<Header />)
        const form = screen.getByPlaceholderText(/buscar pratos, cuisines/i).closest('form')!
        fireEvent.submit(form)
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('deve navegar ao submeter busca com texto', () => {
        render(<Header />)
        const input = screen.getByPlaceholderText(/buscar pratos, cuisines/i)
        fireEvent.change(input, { target: { value: 'sushi' } })
        const form = input.closest('form')!
        fireEvent.submit(form)
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('search=sushi'))
    })
})

describe('Header — com sessão de usuário', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useSession.mockReturnValue(userSession)
    })

    it('deve mostrar o primeiro nome do usuário', () => {
        render(<Header />)
        expect(screen.getByText('João')).toBeInTheDocument()
    })

    it('deve mostrar CartSheet quando logado', () => {
        render(<Header />)
        expect(screen.getByTestId('cart-sheet')).toBeInTheDocument()
    })

    it('não deve mostrar badge Admin para usuário comum', () => {
        render(<Header />)
        expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    })

    it('não deve mostrar botão Entrar quando logado', () => {
        render(<Header />)
        expect(screen.queryByText('Entrar')).not.toBeInTheDocument()
    })

    it('deve mostrar link de Favoritos no dropdown', () => {
        render(<Header />)
        expect(screen.getByText('Favoritos')).toBeInTheDocument()
    })

    it('deve mostrar link de Meus pedidos no dropdown', () => {
        render(<Header />)
        expect(screen.getByText('Meus pedidos')).toBeInTheDocument()
    })

    it('deve chamar signOut ao clicar em Sair', () => {
        render(<Header />)
        fireEvent.click(screen.getByText('Sair'))
        expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' })
    })

    it('não deve mostrar link Painel Admin para usuário comum', () => {
        render(<Header />)
        expect(screen.queryByText('Painel Admin')).not.toBeInTheDocument()
    })
})

describe('Header — com sessão de admin', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useSession.mockReturnValue(adminSession)
    })

    it('deve mostrar badge "Admin" para administrador', () => {
        render(<Header />)
        const adminElements = screen.getAllByText('Admin')
        expect(adminElements.length).toBeGreaterThanOrEqual(1)
    })

    it('deve mostrar link Painel Admin no dropdown', () => {
        render(<Header />)
        expect(screen.getByText('Painel Admin')).toBeInTheDocument()
    })

    it('deve mostrar badge "Administrador" dentro do dropdown', () => {
        render(<Header />)
        expect(screen.getByText('Administrador')).toBeInTheDocument()
    })
})