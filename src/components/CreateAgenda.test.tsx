import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import CreateAgenda from './CreateAgenda'
import * as api from '../services/api'
import { mockAxiosResponse, mockErrorResponse } from '../test/mocks'

// Mock the API functions
vi.mock('../services/api')
const mockedApi = vi.mocked(api)

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('CreateAgenda Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockedApi.createAgenda.mockClear()
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('renders form elements correctly', () => {
    render(<CreateAgenda />)
    
    expect(screen.getByText('Criar Nova Pauta')).toBeInTheDocument()
    expect(screen.getByText('Crie um novo item de agenda para votação na cooperativa')).toBeInTheDocument()
    expect(screen.getByLabelText('Título da Pauta *')).toBeInTheDocument()
    expect(screen.getByLabelText('Descrição da Pauta *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /➕ Criar Pauta/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /← Voltar/ })).toBeInTheDocument()
  })

  it('displays character counters', () => {
    render(<CreateAgenda />)
    
    expect(screen.getByText('0/100 caracteres')).toBeInTheDocument()
    expect(screen.getByText('0/500 caracteres')).toBeInTheDocument()
  })

  it('updates character counter when typing in title field', async () => {
    const user = userEvent.setup()
    render(<CreateAgenda />)
    
    const titleInput = screen.getByLabelText('Título da Pauta *')
    await user.type(titleInput, 'Test Title')
    
    expect(screen.getByText('10/100 caracteres')).toBeInTheDocument()
  })

  it('updates character counter when typing in description field', async () => {
    const user = userEvent.setup()
    render(<CreateAgenda />)
    
    const descriptionInput = screen.getByLabelText('Descrição da Pauta *')
    await user.type(descriptionInput, 'Test description for agenda')
    
    expect(screen.getByText('27/500 caracteres')).toBeInTheDocument()
  })

  it('shows validation error for empty title', async () => {
    const user = userEvent.setup()
    render(<CreateAgenda />)
    
    const descriptionInput = screen.getByLabelText('Descrição da Pauta *')
    await user.type(descriptionInput, 'Valid description')
    
    const submitButton = screen.getByRole('button', { name: /➕ Criar Pauta/ })
    await user.click(submitButton)
    
    expect(screen.getByText('❌ Título e descrição são obrigatórios')).toBeInTheDocument()
  })

  it('shows validation error for empty description', async () => {
    const user = userEvent.setup()
    render(<CreateAgenda />)
    
    const titleInput = screen.getByLabelText('Título da Pauta *')
    await user.type(titleInput, 'Valid title')
    
    const submitButton = screen.getByRole('button', { name: /➕ Criar Pauta/ })
    await user.click(submitButton)
    
    expect(screen.getByText('❌ Título e descrição são obrigatórios')).toBeInTheDocument()
  })

  it('shows validation error for whitespace-only input', async () => {
    const user = userEvent.setup()
    render(<CreateAgenda />)
    
    const titleInput = screen.getByLabelText('Título da Pauta *')
    const descriptionInput = screen.getByLabelText('Descrição da Pauta *')
    
    await user.type(titleInput, '   ')
    await user.type(descriptionInput, '   ')
    
    const submitButton = screen.getByRole('button', { name: /➕ Criar Pauta/ })
    await user.click(submitButton)
    
    expect(screen.getByText('❌ Título e descrição são obrigatórios')).toBeInTheDocument()
  })

  it('successfully creates agenda with valid input', async () => {
    const user = userEvent.setup()
    mockedApi.createAgenda.mockResolvedValue(mockAxiosResponse({}))
    
    render(<CreateAgenda />)
    
    const titleInput = screen.getByLabelText('Título da Pauta *')
    const descriptionInput = screen.getByLabelText('Descrição da Pauta *')
    
    await user.type(titleInput, 'Test Agenda Title')
    await user.type(descriptionInput, 'Test agenda description')
    
    const submitButton = screen.getByRole('button', { name: /➕ Criar Pauta/ })
    await user.click(submitButton)
    
    expect(mockedApi.createAgenda).toHaveBeenCalledWith({
      title: 'Test Agenda Title',
      description: 'Test agenda description'
    })
    
    expect(screen.getByText('✅ Pauta criada com sucesso!')).toBeInTheDocument()
  })

  it('clears form after successful submission', async () => {
    const user = userEvent.setup()
    mockedApi.createAgenda.mockResolvedValue(mockAxiosResponse({}))
    
    render(<CreateAgenda />)
    
    const titleInput = screen.getByLabelText('Título da Pauta *') as HTMLInputElement
    const descriptionInput = screen.getByLabelText('Descrição da Pauta *') as HTMLTextAreaElement
    
    await user.type(titleInput, 'Test Title')
    await user.type(descriptionInput, 'Test description')
    
    const submitButton = screen.getByRole('button', { name: /➕ Criar Pauta/ })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(titleInput.value).toBe('')
      expect(descriptionInput.value).toBe('')
    })
  })

  it('navigates to home after successful submission', async () => {
    const user = userEvent.setup()
    mockedApi.createAgenda.mockResolvedValue(mockAxiosResponse({}))
    
    render(<CreateAgenda />)
    
    const titleInput = screen.getByLabelText('Título da Pauta *')
    const descriptionInput = screen.getByLabelText('Descrição da Pauta *')
    
    await user.type(titleInput, 'Test Title')
    await user.type(descriptionInput, 'Test description')
    
    const submitButton = screen.getByRole('button', { name: /➕ Criar Pauta/ })
    await user.click(submitButton)
    
    vi.advanceTimersByTime(2000)
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mockedApi.createAgenda.mockReturnValue(promise as any)
    
    render(<CreateAgenda />)
    
    const titleInput = screen.getByLabelText('Título da Pauta *')
    const descriptionInput = screen.getByLabelText('Descrição da Pauta *')
    
    await user.type(titleInput, 'Test Title')
    await user.type(descriptionInput, 'Test description')
    
    const submitButton = screen.getByRole('button', { name: /➕ Criar Pauta/ })
    await user.click(submitButton)
    
    expect(screen.getByText('Criando...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    
    resolvePromise!(mockAxiosResponse({}))
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    mockedApi.createAgenda.mockRejectedValue(mockErrorResponse('Server error'))
    
    render(<CreateAgenda />)
    
    const titleInput = screen.getByLabelText('Título da Pauta *')
    const descriptionInput = screen.getByLabelText('Descrição da Pauta *')
    
    await user.type(titleInput, 'Test Title')
    await user.type(descriptionInput, 'Test description')
    
    const submitButton = screen.getByRole('button', { name: /➕ Criar Pauta/ })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('❌ Erro ao criar pauta. Verifique se o backend está rodando.')).toBeInTheDocument()
    })
  })

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateAgenda />)
    
    const backButton = screen.getByRole('button', { name: /← Voltar/ })
    await user.click(backButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('disables form during loading', async () => {
    const user = userEvent.setup()
    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mockedApi.createAgenda.mockReturnValue(promise as any)
    
    render(<CreateAgenda />)
    
    const titleInput = screen.getByLabelText('Título da Pauta *')
    const descriptionInput = screen.getByLabelText('Descrição da Pauta *')
    const submitButton = screen.getByRole('button', { name: /➕ Criar Pauta/ })
    const backButton = screen.getByRole('button', { name: /← Voltar/ })
    
    await user.type(titleInput, 'Test Title')
    await user.type(descriptionInput, 'Test description')
    await user.click(submitButton)
    
    expect(titleInput).toBeDisabled()
    expect(descriptionInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
    expect(backButton).toBeDisabled()
    
    resolvePromise!(mockAxiosResponse({}))
  })

  it('respects character limits', async () => {
    const user = userEvent.setup()
    render(<CreateAgenda />)
    
    const titleInput = screen.getByLabelText('Título da Pauta *')
    const descriptionInput = screen.getByLabelText('Descrição da Pauta *')
    
    expect(titleInput).toHaveAttribute('maxLength', '100')
    expect(descriptionInput).toHaveAttribute('maxLength', '500')
  })

  it('displays helpful tips', () => {
    render(<CreateAgenda />)
    
    expect(screen.getByText('💡 Dicas para criar uma boa pauta:')).toBeInTheDocument()
    expect(screen.getByText('• Use um título claro e objetivo')).toBeInTheDocument()
    expect(screen.getByText('• Explique o contexto e impacto da decisão')).toBeInTheDocument()
    expect(screen.getByText('• Inclua informações suficientes para tomada de decisão')).toBeInTheDocument()
    expect(screen.getByText('• Evite termos técnicos desnecessários')).toBeInTheDocument()
  })
})