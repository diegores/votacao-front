import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import CreateMember from './CreateMember'
import { mockFetchResponse } from '../test/mocks'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('CreateMember Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    globalThis.fetch = vi.fn()
  })

  it('renders form elements correctly', () => {
    render(<CreateMember />)
    
    expect(screen.getByText('Cadastrar Membro')).toBeInTheDocument()
    expect(screen.getByText('Cadastre novos membros da cooperativa para participar das votações')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome Completo *')).toBeInTheDocument()
    expect(screen.getByLabelText('CPF *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /👥 Cadastrar Membro/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /← Voltar/ })).toBeInTheDocument()
  })

  it('displays character counters', () => {
    render(<CreateMember />)
    
    expect(screen.getByText('0/100 caracteres')).toBeInTheDocument()
    expect(screen.getByText('Apenas números são aceitos (11 dígitos)')).toBeInTheDocument()
  })

  it('updates character counter when typing in name field', async () => {
    const user = userEvent.setup()
    render(<CreateMember />)
    
    const nameInput = screen.getByLabelText('Nome Completo *')
    await user.type(nameInput, 'João Silva')
    
    expect(screen.getByText('10/100 caracteres')).toBeInTheDocument()
  })

  it('formats CPF correctly while typing', async () => {
    const user = userEvent.setup()
    render(<CreateMember />)
    
    const cpfInput = screen.getByLabelText('CPF *') as HTMLInputElement
    await user.type(cpfInput, '12345678900')
    
    expect(cpfInput.value).toBe('123.456.789-00')
  })

  it('shows validation error for empty name', async () => {
    const user = userEvent.setup()
    render(<CreateMember />)
    
    const nameInput = screen.getByLabelText('Nome Completo *') as HTMLInputElement
    const cpfInput = screen.getByLabelText('CPF *')
    const form = nameInput.closest('form')!
    
    // Clear name field and remove HTML5 validation temporarily  
    await user.clear(nameInput)
    nameInput.removeAttribute('required')
    await user.type(cpfInput, '12345678900')
    
    // Trigger form submission directly
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    
    await waitFor(() => {
      expect(screen.getByText('❌ Nome é obrigatório')).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid CPF', async () => {
    const user = userEvent.setup()
    render(<CreateMember />)
    
    const nameInput = screen.getByLabelText('Nome Completo *')
    const cpfInput = screen.getByLabelText('CPF *')
    
    await user.type(nameInput, 'João Silva')
    await user.type(cpfInput, '123456789') // Invalid CPF (only 9 digits)
    
    const submitButton = screen.getByRole('button', { name: /👥 Cadastrar Membro/ })
    await user.click(submitButton)
    
    expect(screen.getByText('❌ CPF deve ter 11 dígitos')).toBeInTheDocument()
  })

  it('shows validation error for whitespace-only name', async () => {
    const user = userEvent.setup()
    render(<CreateMember />)
    
    const nameInput = screen.getByLabelText('Nome Completo *')
    const cpfInput = screen.getByLabelText('CPF *')
    
    await user.type(nameInput, '   ')
    await user.type(cpfInput, '12345678900')
    
    const submitButton = screen.getByRole('button', { name: /👥 Cadastrar Membro/ })
    await user.click(submitButton)
    
    expect(screen.getByText('❌ Nome é obrigatório')).toBeInTheDocument()
  })

  it('successfully creates member with valid input', async () => {
    const user = userEvent.setup()
    vi.mocked(globalThis.fetch).mockResolvedValue(mockFetchResponse({}))
    
    render(<CreateMember />)
    
    const nameInput = screen.getByLabelText('Nome Completo *')
    const cpfInput = screen.getByLabelText('CPF *')
    
    await user.type(nameInput, 'João Silva Santos')
    await user.type(cpfInput, '12345678900')
    
    const submitButton = screen.getByRole('button', { name: /👥 Cadastrar Membro/ })
    await user.click(submitButton)
    
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:8080/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cpf: '12345678900',
        name: 'João Silva Santos'
      })
    })
    
    await waitFor(() => {
      expect(screen.getByText('✅ Membro cadastrado com sucesso!')).toBeInTheDocument()
    })
  })

  it('clears form after successful submission', async () => {
    const user = userEvent.setup()
    vi.mocked(globalThis.fetch).mockResolvedValue(mockFetchResponse({}))
    
    render(<CreateMember />)
    
    const nameInput = screen.getByLabelText('Nome Completo *') as HTMLInputElement
    const cpfInput = screen.getByLabelText('CPF *') as HTMLInputElement
    
    await user.type(nameInput, 'João Silva')
    await user.type(cpfInput, '12345678900')
    
    const submitButton = screen.getByRole('button', { name: /👥 Cadastrar Membro/ })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(nameInput.value).toBe('')
      expect(cpfInput.value).toBe('')
    })
  })

  it('navigates to home after successful submission', async () => {
    const user = userEvent.setup()
    vi.mocked(globalThis.fetch).mockResolvedValue(mockFetchResponse({}))
    
    render(<CreateMember />)
    
    const nameInput = screen.getByLabelText('Nome Completo *')
    const cpfInput = screen.getByLabelText('CPF *')
    
    await user.type(nameInput, 'João Silva')
    await user.type(cpfInput, '12345678900')
    
    const submitButton = screen.getByRole('button', { name: /👥 Cadastrar Membro/ })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    }, { timeout: 5000 })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    let resolveFetch: (value: Response) => void
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })
    vi.mocked(globalThis.fetch).mockReturnValue(fetchPromise)
    
    render(<CreateMember />)
    
    const nameInput = screen.getByLabelText('Nome Completo *')
    const cpfInput = screen.getByLabelText('CPF *')
    
    await user.type(nameInput, 'João Silva')
    await user.type(cpfInput, '12345678900')
    
    const submitButton = screen.getByRole('button', { name: /👥 Cadastrar Membro/ })
    await user.click(submitButton)
    
    expect(screen.getByText('Cadastrando...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    
    await act(async () => {
      resolveFetch!(mockFetchResponse({}))
    })
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    const mockErrorResponse = new Response(
      JSON.stringify({ message: 'CPF já cadastrado' }),
      {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'Content-Type': 'application/json' }
      }
    )
    Object.defineProperty(mockErrorResponse, 'ok', { value: false })
    
    vi.mocked(globalThis.fetch).mockResolvedValue(mockErrorResponse)
    
    render(<CreateMember />)
    
    const nameInput = screen.getByLabelText('Nome Completo *')
    const cpfInput = screen.getByLabelText('CPF *')
    
    await user.type(nameInput, 'João Silva')
    await user.type(cpfInput, '12345678900')
    
    const submitButton = screen.getByRole('button', { name: /👥 Cadastrar Membro/ })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('❌ CPF já cadastrado')).toBeInTheDocument()
    })
  })

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup()
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'))
    
    render(<CreateMember />)
    
    const nameInput = screen.getByLabelText('Nome Completo *')
    const cpfInput = screen.getByLabelText('CPF *')
    
    await user.type(nameInput, 'João Silva')
    await user.type(cpfInput, '12345678900')
    
    const submitButton = screen.getByRole('button', { name: /👥 Cadastrar Membro/ })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('❌ Network error')).toBeInTheDocument()
    })
  })

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateMember />)
    
    const backButton = screen.getByRole('button', { name: /← Voltar/ })
    await user.click(backButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('disables form during loading', async () => {
    const user = userEvent.setup()
    let resolveFetch: (value: Response) => void
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })
    vi.mocked(globalThis.fetch).mockReturnValue(fetchPromise)
    
    render(<CreateMember />)
    
    const nameInput = screen.getByLabelText('Nome Completo *')
    const cpfInput = screen.getByLabelText('CPF *')
    const submitButton = screen.getByRole('button', { name: /👥 Cadastrar Membro/ })
    const backButton = screen.getByRole('button', { name: /← Voltar/ })
    
    await user.type(nameInput, 'João Silva')
    await user.type(cpfInput, '12345678900')
    await user.click(submitButton)
    
    expect(nameInput).toBeDisabled()
    expect(cpfInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
    expect(backButton).toBeDisabled()
    
    await act(async () => {
      resolveFetch!(mockFetchResponse({}))
    })
  })

  it('respects character and length limits', () => {
    render(<CreateMember />)
    
    const nameInput = screen.getByLabelText('Nome Completo *')
    const cpfInput = screen.getByLabelText('CPF *')
    
    expect(nameInput).toHaveAttribute('maxLength', '100')
    expect(cpfInput).toHaveAttribute('maxLength', '14') // Formatted CPF length
  })

  it('displays helpful information', () => {
    render(<CreateMember />)
    
    expect(screen.getByText('💡 Informações importantes:')).toBeInTheDocument()
    expect(screen.getByText('• Cada CPF pode ser cadastrado apenas uma vez')).toBeInTheDocument()
    expect(screen.getByText('• O CPF será usado para identificar o membro nas votações')).toBeInTheDocument()
    expect(screen.getByText('• Nome deve ser o nome completo do membro')).toBeInTheDocument()
    expect(screen.getByText('• Todos os campos são obrigatórios')).toBeInTheDocument()
  })

  it('validates CPF with exactly 11 digits', async () => {
    const user = userEvent.setup()
    render(<CreateMember />)
    
    const nameInput = screen.getByLabelText('Nome Completo *')
    const cpfInput = screen.getByLabelText('CPF *')
    
    // Test with 10 digits
    await user.type(nameInput, 'João Silva')
    await user.type(cpfInput, '1234567890')
    
    const submitButton = screen.getByRole('button', { name: /👥 Cadastrar Membro/ })
    await user.click(submitButton)
    
    expect(screen.getByText('❌ CPF deve ter 11 dígitos')).toBeInTheDocument()
  })

  it('removes non-numeric characters from CPF', async () => {
    const user = userEvent.setup()
    render(<CreateMember />)
    
    const cpfInput = screen.getByLabelText('CPF *') as HTMLInputElement
    await user.type(cpfInput, 'abc123def456ghi789jk00')
    
    // Should only keep numeric characters and format them
    expect(cpfInput.value).toBe('123.456.789-00')
  })

  it('limits CPF input to formatted length', async () => {
    const user = userEvent.setup()
    render(<CreateMember />)
    
    const cpfInput = screen.getByLabelText('CPF *') as HTMLInputElement
    await user.type(cpfInput, '123456789001234') // More than 11 digits
    
    // Should stop at 11 digits (formatted as 14 characters)
    expect(cpfInput.value).toBe('123.456.789-00')
  })

  it('trims whitespace from name before submission', async () => {
    const user = userEvent.setup()
    vi.mocked(globalThis.fetch).mockResolvedValue(mockFetchResponse({}))
    
    render(<CreateMember />)
    
    const nameInput = screen.getByLabelText('Nome Completo *')
    const cpfInput = screen.getByLabelText('CPF *')
    
    await user.type(nameInput, '  João Silva Santos  ')
    await user.type(cpfInput, '12345678900')
    
    const submitButton = screen.getByRole('button', { name: /👥 Cadastrar Membro/ })
    await user.click(submitButton)
    
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:8080/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cpf: '12345678900',
        name: 'João Silva Santos' // Trimmed
      })
    })
  })
})