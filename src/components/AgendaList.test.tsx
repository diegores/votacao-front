import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import { AgendaList } from './AgendaList'
import * as api from '../services/api'
import { mockAgenda, mockOpenAgenda, mockAxiosResponse } from '../test/mocks'

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

describe('AgendaList Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockedApi.getAgendas.mockClear()
    mockedApi.openVotingSession.mockClear()
  })

  it('renders loading state initially', () => {
    mockedApi.getAgendas.mockReturnValue(new Promise(() => {})) // Never resolves
    render(<AgendaList />)
    
    expect(screen.getByText('Carregando agendas...')).toBeInTheDocument()
  })

  it('renders empty state when no agendas exist', async () => {
    mockedApi.getAgendas.mockResolvedValue(mockAxiosResponse([]))
    
    render(<AgendaList />)
    
    await waitFor(() => {
      expect(screen.getByText('Nenhuma agenda encontrada')).toBeInTheDocument()
      expect(screen.getByText('Crie uma nova pauta para começar a gerenciar votações.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /➕ Criar Primeira Pauta/ })).toBeInTheDocument()
    })
  })

  it('renders agendas when data is loaded', async () => {
    mockedApi.getAgendas.mockResolvedValue(mockAxiosResponse([mockAgenda, mockOpenAgenda]))
    
    render(<AgendaList />)
    
    await waitFor(() => {
      expect(screen.getByText('Sistema de Votação - Agendas')).toBeInTheDocument()
      expect(screen.getByText(mockAgenda.title)).toBeInTheDocument()
      expect(screen.getByText(mockAgenda.description)).toBeInTheDocument()
      expect(screen.getByText(mockOpenAgenda.title)).toBeInTheDocument()
    })
  })

  it('displays correct status for open and closed agendas', async () => {
    mockedApi.getAgendas.mockResolvedValue(mockAxiosResponse([mockAgenda, mockOpenAgenda]))
    
    render(<AgendaList />)
    
    await waitFor(() => {
      expect(screen.getByText('🔴 Votação Fechada')).toBeInTheDocument()
      expect(screen.getByText('🟢 Votação Aberta')).toBeInTheDocument()
    })
  })

  it('opens voting session when button is clicked', async () => {
    const user = userEvent.setup()
    mockedApi.getAgendas.mockResolvedValue(mockAxiosResponse([mockAgenda]))
    mockedApi.openVotingSession.mockResolvedValue(mockAxiosResponse({}))
    
    render(<AgendaList />)
    
    await waitFor(() => {
      expect(screen.getByText(mockAgenda.title)).toBeInTheDocument()
    })
    
    const openSessionButton = screen.getByRole('button', { name: /🚀 Abrir Sessão/ })
    await user.click(openSessionButton)
    
    expect(mockedApi.openVotingSession).toHaveBeenCalledWith(mockAgenda.id, 1)
  })

  it('disables open session button for already open agendas', async () => {
    mockedApi.getAgendas.mockResolvedValue(mockAxiosResponse([mockOpenAgenda]))
    
    render(<AgendaList />)
    
    await waitFor(() => {
      const sessionButton = screen.getByRole('button', { name: /✅ Sessão Ativa/ })
      expect(sessionButton).toBeDisabled()
    })
  })

  it('navigates to voting page when vote button is clicked', async () => {
    const user = userEvent.setup()
    mockedApi.getAgendas.mockResolvedValue(mockAxiosResponse([mockOpenAgenda]))
    
    render(<AgendaList />)
    
    await waitFor(() => {
      expect(screen.getByText(mockOpenAgenda.title)).toBeInTheDocument()
    })
    
    const voteButton = screen.getByRole('button', { name: /🗳️ Votar Agora/ })
    await user.click(voteButton)
    
    expect(mockNavigate).toHaveBeenCalledWith(`/vote/${mockOpenAgenda.id}`)
  })

  it('navigates to results page when results button is clicked', async () => {
    const user = userEvent.setup()
    mockedApi.getAgendas.mockResolvedValue(mockAxiosResponse([mockAgenda]))
    
    render(<AgendaList />)
    
    await waitFor(() => {
      expect(screen.getByText(mockAgenda.title)).toBeInTheDocument()
    })
    
    const resultsButton = screen.getByRole('button', { name: /📊 Ver Resultados/ })
    await user.click(resultsButton)
    
    expect(mockNavigate).toHaveBeenCalledWith(`/results/${mockAgenda.id}`)
  })

  it('shows session duration input for closed agendas', async () => {
    mockedApi.getAgendas.mockResolvedValue(mockAxiosResponse([mockAgenda]))
    
    render(<AgendaList />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument()
      expect(screen.getByText('Duração (min):')).toBeInTheDocument()
    })
  })

  it('updates session duration when input changes', async () => {
    const user = userEvent.setup()
    mockedApi.getAgendas.mockResolvedValue(mockAxiosResponse([mockAgenda]))
    mockedApi.openVotingSession.mockResolvedValue(mockAxiosResponse({}))
    
    render(<AgendaList />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    })
    
    const durationInput = screen.getByDisplayValue('1')
    await user.clear(durationInput)
    await user.type(durationInput, '5')
    
    const openSessionButton = screen.getByRole('button', { name: /🚀 Abrir Sessão/ })
    await user.click(openSessionButton)
    
    expect(mockedApi.openVotingSession).toHaveBeenCalledWith(mockAgenda.id, 5)
  })

  it('handles API errors gracefully', async () => {
    mockedApi.getAgendas.mockRejectedValue(new Error('API Error'))
    
    // Mock window.alert since it will be called on error
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<AgendaList />)
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Erro ao carregar agendas. Verifique se o backend está rodando.')
    })
    
    alertSpy.mockRestore()
  })

  it('formats creation date correctly', async () => {
    const agendaWithDate = {
      ...mockAgenda,
      createdAt: '2024-01-15T10:30:00.000Z'
    }
    mockedApi.getAgendas.mockResolvedValue(mockAxiosResponse([agendaWithDate]))
    
    render(<AgendaList />)
    
    await waitFor(() => {
      expect(screen.getByText(/Criada em:/)).toBeInTheDocument()
    })
  })

  it('navigates to create agenda when create first agenda button is clicked', async () => {
    const user = userEvent.setup()
    mockedApi.getAgendas.mockResolvedValue(mockAxiosResponse([]))
    
    render(<AgendaList />)
    
    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /➕ Criar Primeira Pauta/ })
      expect(createButton).toBeInTheDocument()
    })
    
    const createButton = screen.getByRole('button', { name: /➕ Criar Primeira Pauta/ })
    await user.click(createButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/create')
  })
})