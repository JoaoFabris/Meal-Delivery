import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserLoginClient } from '@/app/(auth)/login/UserLoginClient'

// ── Mocks ─────────────────────────────────────────────────
const mockPush = jest.fn()
const mockSignIn = jest.fn()

jest.mock('next-auth/react', () => ({
    signIn: (...args: unknown[]) => mockSignIn(...args),
}))

jest.mock('next/navigation', () => ({
    useSearchParams: () => ({ get: () => null }),
    useRouter: () => ({ push: mockPush }),
}))

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a href={href}>{children}</a>
    ),
}))

global.fetch = jest.fn()

describe('UserLoginClient — renderização inicial', () => {
    beforeEach(() => jest.clearAllMocks())

    it('deve renderizar o toggle "Entrar"', () => {
        render(<UserLoginClient />)
        // pega o botão do toggle (não o botão submit)
        const btns = screen.getAllByText('Entrar')
        expect(btns.length).toBeGreaterThanOrEqual(1)
    })

    it('deve renderizar o toggle "Criar conta"', () => {
        render(<UserLoginClient />)
        const btns = screen.getAllByText('Criar conta')
        expect(btns.length).toBeGreaterThanOrEqual(1)
    })

    it('deve renderizar campo de e-mail', () => {
        render(<UserLoginClient />)
        expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    })

    it('deve renderizar campo de senha', () => {
        render(<UserLoginClient />)
        expect(screen.getByPlaceholderText('Mínimo 6 caracteres')).toBeInTheDocument()
    })

    it('deve renderizar botão "Continuar com Google"', () => {
        render(<UserLoginClient />)
        expect(screen.getByText('Continuar com Google')).toBeInTheDocument()
    })

    it('deve renderizar link para painel admin', () => {
        render(<UserLoginClient />)
        expect(screen.getByText('Acesse o painel admin')).toBeInTheDocument()
    })

    it('deve renderizar link "Esqueceu sua senha?" no modo login', () => {
        render(<UserLoginClient />)
        expect(screen.getByText('Esqueceu sua senha?')).toBeInTheDocument()
    })

    it('link "Esqueceu sua senha?" deve apontar para /forgot-password', () => {
        render(<UserLoginClient />)
        const link = screen.getByText('Esqueceu sua senha?')
        expect(link).toHaveAttribute('href', '/forgot-password')
    })
})

describe('UserLoginClient — toggle login/registro', () => {
    beforeEach(() => jest.clearAllMocks())

    it('não deve mostrar campo de nome no modo login', () => {
        render(<UserLoginClient />)
        expect(screen.queryByPlaceholderText('Seu nome completo')).not.toBeInTheDocument()
    })

    it('deve mostrar campo de nome ao clicar em "Criar conta"', async () => {
        render(<UserLoginClient />)
        // clica no botão do toggle (o primeiro "Criar conta")
        const toggleBtns = screen.getAllByText('Criar conta')
        fireEvent.click(toggleBtns[0])
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument()
        })
    })

    it('deve esconder "Esqueceu sua senha?" no modo registro', async () => {
        render(<UserLoginClient />)
        const toggleBtns = screen.getAllByText('Criar conta')
        fireEvent.click(toggleBtns[0])
        await waitFor(() => {
            expect(screen.queryByText('Esqueceu sua senha?')).not.toBeInTheDocument()
        })
    })

    it('deve voltar para modo login ao clicar em "Entrar" do toggle', async () => {
        render(<UserLoginClient />)
        // vai para registro
        fireEvent.click(screen.getAllByText('Criar conta')[0])
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument()
        })
        // volta para login
        fireEvent.click(screen.getAllByText('Entrar')[0])
        await waitFor(() => {
            expect(screen.queryByPlaceholderText('Seu nome completo')).not.toBeInTheDocument()
        })
    })
})

describe('UserLoginClient — mostrar/esconder senha', () => {
    beforeEach(() => jest.clearAllMocks())

    it('campo de senha deve ser do tipo password por padrão', () => {
        render(<UserLoginClient />)
        expect(screen.getByPlaceholderText('Mínimo 6 caracteres')).toHaveAttribute('type', 'password')
    })

    it('deve alternar para text ao clicar no botão de olho', () => {
        render(<UserLoginClient />)
        // botão de toggle senha — type="button" sem texto
        const toggleBtn = screen.getByRole('button', { name: '' })
        fireEvent.click(toggleBtn)
        expect(screen.getByPlaceholderText('Mínimo 6 caracteres')).toHaveAttribute('type', 'text')
    })

    it('deve voltar para password ao clicar novamente', () => {
        render(<UserLoginClient />)
        const toggleBtn = screen.getByRole('button', { name: '' })
        fireEvent.click(toggleBtn)
        fireEvent.click(toggleBtn)
        expect(screen.getByPlaceholderText('Mínimo 6 caracteres')).toHaveAttribute('type', 'password')
    })
})

describe('UserLoginClient — login com credenciais', () => {
    beforeEach(() => jest.clearAllMocks())

    it('deve chamar signIn credentials ao submeter', async () => {
        mockSignIn.mockResolvedValue({ error: null })
        render(<UserLoginClient />)

        await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'joao@test.com')
        await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), 'senha123')

        const form = screen.getByPlaceholderText('seu@email.com').closest('form')!
        fireEvent.submit(form)

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith('credentials', expect.objectContaining({
                email: 'joao@test.com',
                password: 'senha123',
                redirect: false,
            }))
        })
    })

    it('deve mostrar erro para credenciais inválidas', async () => {
        mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' })
        render(<UserLoginClient />)

        await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'joao@test.com')
        await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), 'errada')

        fireEvent.submit(screen.getByPlaceholderText('seu@email.com').closest('form')!)

        await waitFor(() => {
            expect(screen.getByText('E-mail ou senha inválidos.')).toBeInTheDocument()
        })
    })

    it('deve redirecionar para home após login bem-sucedido', async () => {
        mockSignIn.mockResolvedValue({ error: null })
        render(<UserLoginClient />)

        await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'joao@test.com')
        await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), 'senha123')
        fireEvent.submit(screen.getByPlaceholderText('seu@email.com').closest('form')!)

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/')
        })
    })

    it('deve chamar signIn google ao clicar no botão Google', () => {
        mockSignIn.mockResolvedValue({})
        render(<UserLoginClient />)
        fireEvent.click(screen.getByText('Continuar com Google'))
        expect(mockSignIn).toHaveBeenCalledWith('google', expect.objectContaining({ callbackUrl: '/' }))
    })
})

describe('UserLoginClient — registro', () => {
    beforeEach(() => jest.clearAllMocks())

    it('deve chamar /api/auth/register ao submeter no modo criar conta', async () => {
        ; (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ message: 'ok' }),
        })
        mockSignIn.mockResolvedValue({ error: null })

        render(<UserLoginClient />)
        fireEvent.click(screen.getAllByText('Criar conta')[0])
        await waitFor(() => screen.getByPlaceholderText('Seu nome completo'))

        await userEvent.type(screen.getByPlaceholderText('Seu nome completo'), 'João Silva')
        await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'joao@test.com')
        await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), 'senha123')

        fireEvent.submit(screen.getByPlaceholderText('seu@email.com').closest('form')!)

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
                method: 'POST',
            }))
        })
    })

    it('deve mostrar erro ao registrar com e-mail duplicado', async () => {
        ; (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({ error: { message: 'Este e-mail já está cadastrado.' } }),
        })

        render(<UserLoginClient />)
        fireEvent.click(screen.getAllByText('Criar conta')[0])
        await waitFor(() => screen.getByPlaceholderText('Seu nome completo'))

        await userEvent.type(screen.getByPlaceholderText('Seu nome completo'), 'João')
        await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'joao@test.com')
        await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), 'senha123')
        fireEvent.submit(screen.getByPlaceholderText('seu@email.com').closest('form')!)

        await waitFor(() => {
            expect(screen.getByText('Este e-mail já está cadastrado.')).toBeInTheDocument()
        })
    })

    it('deve mostrar erro de conexão em caso de falha de rede', async () => {
        ; (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

        render(<UserLoginClient />)
        fireEvent.click(screen.getAllByText('Criar conta')[0])
        await waitFor(() => screen.getByPlaceholderText('Seu nome completo'))

        await userEvent.type(screen.getByPlaceholderText('Seu nome completo'), 'João')
        await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'joao@test.com')
        await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), 'senha123')
        fireEvent.submit(screen.getByPlaceholderText('seu@email.com').closest('form')!)

        await waitFor(() => {
            expect(screen.getByText('Erro de conexão. Tente novamente.')).toBeInTheDocument()
        })
    })
})