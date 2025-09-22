import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import VotingSession from './VotingSession'
import * as api from '../services/api'
import { mockOpenAgenda, mockAgenda, mockMember, mockVotes, mockAxiosResponse, mockFetchResponse, mockErrorResponse } from '../test/mocks'

// Mock the API functions
vi.mock('../services/api')
const mockedApi = vi.mocked(api)

// Mock useParams and useNavigate
const mockNavigate = vi.fn()
const mockParams = { id: '1' }

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  }
})

describe('VotingSession Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockedApi.getAgenda.mockClear()
    mockedApi.submitVote.mockClear()
    global.fetch = vi.fn()
  })

  it('renders loading state initially', () => {
    mockedApi.getAgenda.mockReturnValue(new Promise(() => {})) // Never resolves
    vi.mocked(global.fetch).mockReturnValue(new Promise(() => {}))
    
    render(<VotingSession />)
    
    expect(screen.getByText('Carregando sessão de votação...')).toBeInTheDocument()
  })

  it('renders agenda not found when agenda does not exist', async () => {
    mockedApi.getAgenda.mockRejectedValue(new Error('Not found'))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse([]))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar dados. Verifique se o backend está rodando.')).toBeInTheDocument()
    })
  })

  it('renders closed session message when voting is not open', async () => {
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByText('Sessão de Votação Fechada')).toBeInTheDocument()
      expect(screen.getByText('Esta pauta não está mais disponível para votação.')).toBeInTheDocument()
    })
  })

  it('renders voting interface when session is open', async () => {
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByText(mockOpenAgenda.title)).toBeInTheDocument()
      expect(screen.getByText(mockOpenAgenda.description)).toBeInTheDocument()
      expect(screen.getByText('🗳️ Registrar Voto')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  it('displays members in dropdown', async () => {
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByText(`${mockMember.name} (${mockMember.cpf})`)).toBeInTheDocument()
    })
  })

  it('displays existing votes', async () => {
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse(mockVotes))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByText('📊 Votos Registrados (2)')).toBeInTheDocument()
      expect(screen.getByText('Test Member 1')).toBeInTheDocument()
      expect(screen.getByText('✅ SIM')).toBeInTheDocument()
      expect(screen.getByText('❌ NÃO')).toBeInTheDocument()
    })
  })

  it('shows validation error when trying to vote without selecting member', async () => {
    const user = userEvent.setup()
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /✅ Votar SIM/ })).toBeInTheDocument()
    })
    
    const voteButton = screen.getByRole('button', { name: /✅ Votar SIM/ })
    await user.click(voteButton)
    
    expect(screen.getByText('❌ Selecione um membro antes de votar!')).toBeInTheDocument()
  })

  it('successfully submits a vote', async () => {
    const user = userEvent.setup()
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    mockedApi.submitVote.mockResolvedValue(mockAxiosResponse({}))
    
    // Mock fetch calls for data fetching
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
      // Mock fetch calls for refetch after vote
      .mockResolvedValueOnce(mockAxiosResponse(mockOpenAgenda))
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([mockVotes[0]]))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
    
    const memberSelect = screen.getByRole('combobox')
    await user.selectOptions(memberSelect, mockMember.cpf)
    
    const voteButton = screen.getByRole('button', { name: /✅ Votar SIM/ })
    await user.click(voteButton)
    
    expect(mockedApi.submitVote).toHaveBeenCalledWith('1', {
      memberCpf: mockMember.cpf,
      voteValue: 'SIM'
    })
    
    await waitFor(() => {
      expect(screen.getByText('✅ Voto "SIM" registrado com sucesso!')).toBeInTheDocument()
    })
  })

  it('prevents duplicate voting from same member', async () => {
    const user = userEvent.setup()
    const memberWhoVoted = { ...mockMember, cpf: mockVotes[0].memberCpf }
    
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([memberWhoVoted]))
      .mockResolvedValueOnce(mockFetchResponse(mockVotes))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
    
    const memberSelect = screen.getByRole('combobox')
    await user.selectOptions(memberSelect, memberWhoVoted.cpf)
    
    expect(screen.getByText('⚠️ Este membro já votou nesta pauta')).toBeInTheDocument()
    
    const voteButton = screen.getByRole('button', { name: /✅ Votar SIM/ })
    await user.click(voteButton)
    
    expect(screen.getByText('❌ Este membro já votou nesta pauta!')).toBeInTheDocument()
  })

  it('handles voting errors gracefully', async () => {
    const user = userEvent.setup()
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    mockedApi.submitVote.mockRejectedValue(mockErrorResponse('Voting failed'))
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
    
    const memberSelect = screen.getByRole('combobox')
    await user.selectOptions(memberSelect, mockMember.cpf)
    
    const voteButton = screen.getByRole('button', { name: /✅ Votar SIM/ })
    await user.click(voteButton)
    
    await waitFor(() => {
      expect(screen.getByText('❌ Voting failed')).toBeInTheDocument()
    })
  })

  it('shows loading state while voting', async () => {
    const user = userEvent.setup()
    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    mockedApi.submitVote.mockReturnValue(promise as any)
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
    
    const memberSelect = screen.getByRole('combobox')
    await user.selectOptions(memberSelect, mockMember.cpf)
    
    const voteButton = screen.getByRole('button', { name: /✅ Votar SIM/ })
    await user.click(voteButton)
    
    expect(screen.getByText('Votando...')).toBeInTheDocument()
    expect(voteButton).toBeDisabled()
    
    resolvePromise!(mockAxiosResponse({}))
  })

  it('clears member selection after successful vote', async () => {
    const user = userEvent.setup()
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    mockedApi.submitVote.mockResolvedValue(mockAxiosResponse({}))
    
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
      // Mock fetch calls for refetch after vote
      .mockResolvedValueOnce(mockAxiosResponse(mockOpenAgenda))
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
    
    const memberSelect = screen.getByRole('combobox') as HTMLSelectElement
    await user.selectOptions(memberSelect, mockMember.cpf)
    
    const voteButton = screen.getByRole('button', { name: /✅ Votar SIM/ })
    await user.click(voteButton)
    
    await waitFor(() => {
      expect(memberSelect.value).toBe('')
    })
  })

  it('navigates to results page when results button is clicked', async () => {
    const user = userEvent.setup()
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /📊 Ver Resultados Consolidados/ })).toBeInTheDocument()
    })
    
    const resultsButton = screen.getByRole('button', { name: /📊 Ver Resultados Consolidados/ })
    await user.click(resultsButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/results/1')
  })

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup()
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByText('← Voltar para Agendas')).toBeInTheDocument()
    })
    
    const backButton = screen.getByText('← Voltar para Agendas')
    await user.click(backButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('displays session end time when available', async () => {
    const agendaWithEndTime = {
      ...mockOpenAgenda,
      sessionEndTime: '2024-01-01T11:00:00Z'
    }
    
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(agendaWithEndTime))
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByText(/⏰ Sessão termina em:/)).toBeInTheDocument()
    })
  })

  it('shows helpful information about voting rules', async () => {
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByText('💡 Cada membro pode votar apenas uma vez por pauta')).toBeInTheDocument()
    })
  })

  it('handles both SIM and NAO votes correctly', async () => {
    const user = userEvent.setup()
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    mockedApi.submitVote.mockResolvedValue(mockAxiosResponse({}))
    
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
      .mockResolvedValueOnce(mockAxiosResponse(mockOpenAgenda))
      .mockResolvedValueOnce(mockFetchResponse([mockMember]))
      .mockResolvedValueOnce(mockFetchResponse([]))
    
    render(<VotingSession />)
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
    
    const memberSelect = screen.getByRole('combobox')
    await user.selectOptions(memberSelect, mockMember.cpf)
    
    const voteNoButton = screen.getByRole('button', { name: /❌ Votar NÃO/ })
    await user.click(voteNoButton)
    
    expect(mockedApi.submitVote).toHaveBeenCalledWith('1', {
      memberCpf: mockMember.cpf,
      voteValue: 'NAO'
    })
  })
})