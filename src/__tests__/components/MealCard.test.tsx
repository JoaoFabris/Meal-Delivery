import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MealCard } from '@/components/meal/MealCard'
import { Meal } from '@/types/meal.types'

// ── Mocks ─────────────────────────────────────────────────
const mockToggleFavorite = jest.fn()
const mockIsFavorite = jest.fn()
const mockAddItem = jest.fn()
const mockToast = jest.fn()

jest.mock('@/lib/store/favorites.store', () => ({
    useFavoritesStore: () => ({
        isFavorite: mockIsFavorite,
        toggleFavorite: mockToggleFavorite,
    }),
}))

jest.mock('@/lib/store/cart.store', () => ({
    useCartStore: () => ({
        addItem: mockAddItem,
    }),
}))

jest.mock('sonner', () => ({
    toast: Object.assign(
        (...args: unknown[]) => mockToast(...args),
        {
            success: (...args: unknown[]) => mockToast('success', ...args),
            error: (...args: unknown[]) => mockToast('error', ...args),
        }
    ),
}))

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a href={href}>{children}</a>
    ),
}))

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ fill, ...props }: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} alt={props.alt} />
    },
}))

jest.mock('next-auth/react', () => ({
    useSession: () => ({ data: { user: { email: 'test@test.com' } }, status: 'authenticated' }),
}))

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
}))

// ── Fixture ───────────────────────────────────────────────
const mealFixture: Meal = {
    id: 'meal-1',
    name: 'X-Burguer Clássico',
    category: 'Burgers',
    area: 'Brazilian',
    instructions: 'Prepare o hambúrguer...',
    thumbnail: 'https://exemplo.com/img.jpg',
    tags: [],
    youtube: null,
    source: null,
    ingredients: [
        { name: 'Pão', measure: '1' },
        { name: 'Carne', measure: '150g' },
        { name: 'Queijo', measure: '1 fatia' },
    ],
    price: 28.9,
}

describe('MealCard — renderização', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockIsFavorite.mockReturnValue(false)
    })

    it('deve renderizar o nome do prato', () => {
        render(<MealCard meal={mealFixture} />)
        expect(screen.getByText('X-Burguer Clássico')).toBeInTheDocument()
    })

    it('deve renderizar a categoria do prato', () => {
        render(<MealCard meal={mealFixture} />)
        expect(screen.getByText('Burgers')).toBeInTheDocument()
    })

    it('deve renderizar a área/localidade do prato', () => {
        render(<MealCard meal={mealFixture} />)
        expect(screen.getByText('Brazilian')).toBeInTheDocument()
    })

    it('deve renderizar o preço formatado', () => {
        render(<MealCard meal={mealFixture} />)
        expect(screen.getByText('R$ 28,90')).toBeInTheDocument()
    })

    it('deve renderizar a descrição com base nos ingredientes', () => {
        render(<MealCard meal={mealFixture} />)
        expect(screen.getByText(/Pão, Carne, Queijo/)).toBeInTheDocument()
    })

    it('deve linkar para a página do prato', () => {
        render(<MealCard meal={mealFixture} />)
        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', '/meal/meal-1')
    })
})

describe('MealCard — botão de favoritar', () => {
    beforeEach(() => jest.clearAllMocks())

    it('deve mostrar aria-label "Adicionar aos favoritos" quando não favoritado', () => {
        mockIsFavorite.mockReturnValue(false)
        render(<MealCard meal={mealFixture} />)
        expect(screen.getByLabelText('Adicionar aos favoritos')).toBeInTheDocument()
    })

    it('deve mostrar aria-label "Remover dos favoritos" quando favoritado', () => {
        mockIsFavorite.mockReturnValue(true)
        render(<MealCard meal={mealFixture} />)
        expect(screen.getByLabelText('Remover dos favoritos')).toBeInTheDocument()
    })

    it('deve chamar toggleFavorite ao clicar no botão de favoritar', () => {
        mockIsFavorite.mockReturnValue(false)
        render(<MealCard meal={mealFixture} />)

        fireEvent.click(screen.getByLabelText('Adicionar aos favoritos'))

        expect(mockToggleFavorite).toHaveBeenCalledWith(mealFixture)
    })

    it('deve mostrar toast "Adicionado aos favoritos" ao favoritar', () => {
        mockIsFavorite.mockReturnValue(false)
        render(<MealCard meal={mealFixture} />)

        fireEvent.click(screen.getByLabelText('Adicionar aos favoritos'))

        expect(mockToast).toHaveBeenCalledWith(
            'Adicionado aos favoritos',
            expect.objectContaining({ icon: '❤️' })
        )
    })

    it('deve mostrar toast "Removido dos favoritos" ao desfavoritar', () => {
        mockIsFavorite.mockReturnValue(true)
        render(<MealCard meal={mealFixture} />)

        fireEvent.click(screen.getByLabelText('Remover dos favoritos'))

        expect(mockToast).toHaveBeenCalledWith(
            'Removido dos favoritos',
            expect.objectContaining({ icon: '💔' })
        )
    })

    it('clique no botão de favoritar não deve navegar (preventDefault)', () => {
        mockIsFavorite.mockReturnValue(false)
        render(<MealCard meal={mealFixture} />)

        const event = fireEvent.click(screen.getByLabelText('Adicionar aos favoritos'))

        // O evento de clique deve ser tratado (preventDefault chamado internamente)
        // Verificamos que a navegação não ocorreu testando que o link não foi acionado
        expect(event).toBe(false) // fireEvent retorna false quando preventDefault foi chamado
    })
})

describe('MealCard — botão de adicionar ao carrinho', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockIsFavorite.mockReturnValue(false)
    })

    it('deve chamar addItem ao clicar em adicionar ao carrinho', () => {
        render(<MealCard meal={mealFixture} />)

        const buttons = screen.getAllByLabelText('Adicionar ao carrinho')
        fireEvent.click(buttons[buttons.length - 1])

        expect(mockAddItem).toHaveBeenCalledWith(mealFixture, 1)
    })

    it('deve mostrar toast de sucesso ao adicionar ao carrinho', () => {
        render(<MealCard meal={mealFixture} />)

        const buttons = screen.getAllByLabelText('Adicionar ao carrinho')
        fireEvent.click(buttons[buttons.length - 1])

        expect(mockToast).toHaveBeenCalledWith(
            'success',
            expect.stringContaining('X-Burguer Clássico')
        )
    })
})