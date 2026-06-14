import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '@/components/meal/SearchBar'

// ── Mocks ─────────────────────────────────────────────────
const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}))

describe('SearchBar — renderização', () => {
    beforeEach(() => jest.clearAllMocks())

    it('deve renderizar o campo de busca', () => {
        render(<SearchBar />)
        expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument()
    })

    it('deve iniciar com campo vazio', () => {
        render(<SearchBar />)
        const input = screen.getByPlaceholderText(/buscar/i) as HTMLInputElement
        expect(input.value).toBe('')
    })
})

describe('SearchBar — interações', () => {
    beforeEach(() => jest.clearAllMocks())

    it('deve atualizar o valor ao digitar', async () => {
        render(<SearchBar />)
        const input = screen.getByPlaceholderText(/buscar/i) as HTMLInputElement
        await userEvent.type(input, 'pizza')
        expect(input.value).toBe('pizza')
    })

    it('deve limpar o campo ao apagar o texto', async () => {
        render(<SearchBar />)
        const input = screen.getByPlaceholderText(/buscar/i) as HTMLInputElement
        await userEvent.type(input, 'pizza')
        await userEvent.clear(input)
        expect(input.value).toBe('')
    })

    it('deve chamar router.push após debounce ao digitar', async () => {
        jest.useFakeTimers()
        render(<SearchBar />)
        const input = screen.getByPlaceholderText(/buscar/i)

        fireEvent.change(input, { target: { value: 'sushi' } })
        expect(mockPush).not.toHaveBeenCalled()

        act(() => { jest.advanceTimersByTime(500) })

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                expect.stringContaining('search=sushi'),
                expect.objectContaining({ scroll: false })
            )
        })

        jest.useRealTimers()
    })
    it('deve remover query param search quando campo é limpo', async () => {
        jest.useFakeTimers()
        render(<SearchBar />)
        const input = screen.getByPlaceholderText(/buscar/i)

        // Primeiro digita algo para ter search na URL
        fireEvent.change(input, { target: { value: 'sushi' } })
        act(() => { jest.advanceTimersByTime(500) })

        // Depois limpa
        fireEvent.change(input, { target: { value: '' } })
        act(() => { jest.advanceTimersByTime(500) })

        await waitFor(() => {
            const calls = mockPush.mock.calls
            const lastCall = calls[calls.length - 1][0] as string
            expect(lastCall).not.toContain('search=')
        })

        jest.useRealTimers()
    })
})