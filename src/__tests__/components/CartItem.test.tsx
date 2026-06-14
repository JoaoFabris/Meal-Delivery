import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { CartItem } from '@/components/cart/CartItem'
import { CartItem as CartItemType } from '@/types/meal.types'

// ── Mocks ─────────────────────────────────────────────────
const mockUpdateQuantity = jest.fn()
const mockRemoveItem = jest.fn()

jest.mock('@/lib/store/cart.store', () => ({
    useCartStore: () => ({
        updateQuantity: mockUpdateQuantity,
        removeItem: mockRemoveItem,
    }),
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

// ── Fixture ───────────────────────────────────────────────
const itemFixture: CartItemType = {
    meal: {
        id: 'meal-1',
        name: 'X-Burguer Clássico',
        category: 'Burgers',
        area: 'Brazilian',
        instructions: 'Prepare...',
        thumbnail: 'https://exemplo.com/img.jpg',
        tags: [],
        youtube: null,
        source: null,
        ingredients: [],
        price: 28.9,
    },
    quantity: 2,
}

describe('CartItem — renderização', () => {
    beforeEach(() => jest.clearAllMocks())

    it('deve renderizar o nome do prato', () => {
        render(<CartItem item={itemFixture} />)
        expect(screen.getByText('X-Burguer Clássico')).toBeInTheDocument()
    })

    it('deve renderizar a categoria e a área', () => {
        render(<CartItem item={itemFixture} />)
        expect(screen.getByText('Burgers')).toBeInTheDocument()
        expect(screen.getByText('Brazilian')).toBeInTheDocument()
    })

    it('deve renderizar a quantidade atual', () => {
        render(<CartItem item={itemFixture} />)
        expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('deve renderizar o preço unitário multiplicado pela quantidade', () => {
        render(<CartItem item={itemFixture} />)
        expect(screen.getByText('R$ 28,90 × 2')).toBeInTheDocument()
    })

    it('deve renderizar o subtotal do item', () => {
        render(<CartItem item={itemFixture} />)
        expect(screen.getByText('R$ 57,80')).toBeInTheDocument()
    })

    it('deve linkar para a página do prato', () => {
        render(<CartItem item={itemFixture} />)
        const links = screen.getAllByRole('link')
        links.forEach((link) => {
            expect(link).toHaveAttribute('href', '/meal/meal-1')
        })
    })
})

describe('CartItem — controle de quantidade', () => {
    beforeEach(() => jest.clearAllMocks())

    it('deve chamar updateQuantity com quantidade+1 ao clicar em aumentar', () => {
        render(<CartItem item={itemFixture} />)

        fireEvent.click(screen.getByLabelText('Aumentar quantidade'))

        expect(mockUpdateQuantity).toHaveBeenCalledWith('meal-1', 3)
    })

    it('deve chamar updateQuantity com quantidade-1 ao clicar em diminuir', () => {
        render(<CartItem item={itemFixture} />)

        fireEvent.click(screen.getByLabelText('Diminuir quantidade'))

        expect(mockUpdateQuantity).toHaveBeenCalledWith('meal-1', 1)
    })

    it('botão de diminuir não deve estar desabilitado quando quantidade > 1', () => {
        render(<CartItem item={itemFixture} />)
        expect(screen.getByLabelText('Diminuir quantidade')).not.toBeDisabled()
    })

    it('botão de diminuir deve estar desabilitado quando quantidade = 1', () => {
        const singleItem = { ...itemFixture, quantity: 1 }
        render(<CartItem item={singleItem} />)
        expect(screen.getByLabelText('Diminuir quantidade')).toBeDisabled()
    })
})

describe('CartItem — remoção', () => {
    beforeEach(() => jest.clearAllMocks())

    it('deve chamar removeItem ao clicar no botão de remover', () => {
        render(<CartItem item={itemFixture} />)

        fireEvent.click(screen.getByLabelText('Remover item'))

        expect(mockRemoveItem).toHaveBeenCalledWith('meal-1')
    })
})