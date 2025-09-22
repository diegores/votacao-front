import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import VotingResult from './VotingResult'
import * as api from '../services/api'
import { mockOpenAgenda, mockAgenda, mockVotingResult, mockVotes, mockAxiosResponse, mockFetchResponse } from '../test/mocks'

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

describe('VotingResult Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockedApi.getVotingResult.mockClear()
    mockedApi.getAgenda.mockClear()
    global.fetch = vi.fn()
  })

  it('renders loading state initially', () => {
    mockedApi.getVotingResult.mockReturnValue(new Promise(() => {}))
    mockedApi.getAgenda.mockReturnValue(new Promise(() => {}))
    vi.mocked(global.fetch).mockReturnValue(new Promise(() => {}))
    
    render(<VotingResult />)
    
    expect(screen.getByText('Carregando resultados...')).toBeInTheDocument()
  })

  it('renders error state when data loading fails', async () => {
    mockedApi.getVotingResult.mockRejectedValue(new Error('API Error'))
    mockedApi.getAgenda.mockRejectedValue(new Error('API Error'))
    vi.mocked(global.fetch).mockRejectedValue(new Error('Fetch Error'))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao Carregar Resultados')).toBeInTheDocument()
      expect(screen.getByText('Erro ao carregar resultados. Verifique se o backend está rodando.')).toBeInTheDocument()
    })
  })

  it('renders results when data is loaded successfully', async () => {
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(mockVotingResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockVotes))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByText('📊 Resultados da Votação')).toBeInTheDocument()
      expect(screen.getByText(mockAgenda.title)).toBeInTheDocument()
      expect(screen.getByText(mockAgenda.description)).toBeInTheDocument()
    })
  })

  it('displays correct vote counts and percentages', async () => {
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(mockVotingResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockVotes))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByText('3 (60%)')).toBeInTheDocument() // Yes votes
      expect(screen.getByText('2 (40%)')).toBeInTheDocument() // No votes
      expect(screen.getByText('5')).toBeInTheDocument() // Total votes
    })
  })

  it('displays APROVADA status when yes votes win', async () => {
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(mockVotingResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockVotes))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByText('✅ APROVADA')).toBeInTheDocument()
    })
  })

  it('displays REJEITADA status when no votes win', async () => {
    const rejectedResult = { yesVotes: 2, noVotes: 3, totalVotes: 5 }
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(rejectedResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockVotes))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByText('❌ REJEITADA')).toBeInTheDocument()
    })
  })

  it('displays EMPATE status when votes are tied', async () => {
    const tiedResult = { yesVotes: 2, noVotes: 2, totalVotes: 4 }
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(tiedResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockVotes))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByText('⚖️ EMPATE')).toBeInTheDocument()
    })
  })

  it('displays "Nenhum voto registrado" when no votes exist', async () => {
    const noVotesResult = { yesVotes: 0, noVotes: 0, totalVotes: 0 }
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(noVotesResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse([]))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByText('Nenhum voto registrado')).toBeInTheDocument()
      expect(screen.getByText('Nenhum voto registrado')).toBeInTheDocument()
    })
  })

  it('displays vote details correctly', async () => {
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(mockVotingResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockVotes))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByText('🗳️ Detalhes dos Votos')).toBeInTheDocument()
      expect(screen.getByText('Test Member 1')).toBeInTheDocument()
      expect(screen.getByText('Test Member 2')).toBeInTheDocument()
      expect(screen.getByText('✅ SIM')).toBeInTheDocument()
      expect(screen.getByText('❌ NÃO')).toBeInTheDocument()
    })
  })

  it('shows session status correctly for open agenda', async () => {
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(mockVotingResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockVotes))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByText('🟢 Aberta')).toBeInTheDocument()
    })
  })

  it('shows session status correctly for closed agenda', async () => {
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(mockVotingResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockVotes))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByText('🔴 Fechada')).toBeInTheDocument()
    })
  })

  it('renders progress bars with correct widths', async () => {
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(mockVotingResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockVotes))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      const yesProgressBar = screen.getByText('✅ Votos SIM').closest('div')?.querySelector('.bg-green-500')
      const noProgressBar = screen.getByText('❌ Votos NÃO').closest('div')?.querySelector('.bg-red-500')
      
      expect(yesProgressBar).toHaveStyle('width: 60%')
      expect(noProgressBar).toHaveStyle('width: 40%')
    })
  })

  it('navigates to voting page when continue voting button is clicked (open session)', async () => {
    const user = userEvent.setup()
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(mockVotingResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockOpenAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockVotes))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /🗳️ Continuar Votando/ })).toBeInTheDocument()
    })
    
    const continueVotingButton = screen.getByRole('button', { name: /🗳️ Continuar Votando/ })
    await user.click(continueVotingButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/vote/1')
  })

  it('disables continue voting button when session is closed', async () => {
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(mockVotingResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockVotes))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /🗳️ Votação Encerrada/ })
      expect(button).toBeDisabled()
    })
  })

  it('navigates to agendas page when back button is clicked', async () => {
    const user = userEvent.setup()
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(mockVotingResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockVotes))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByText('← Voltar para Agendas')).toBeInTheDocument()
    })
    
    const backButton = screen.getByText('← Voltar para Agendas')
    await user.click(backButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('navigates to agendas page when "Ver Todas as Agendas" button is clicked', async () => {
    const user = userEvent.setup()
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(mockVotingResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockVotes))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /📋 Ver Todas as Agendas/ })).toBeInTheDocument()
    })
    
    const agendasButton = screen.getByRole('button', { name: /📋 Ver Todas as Agendas/ })
    await user.click(agendasButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('formats vote timestamps correctly', async () => {
    const votesWithTimestamp = [
      {
        ...mockVotes[0],
        votedAt: '2024-01-15T10:30:45.000Z'
      }
    ]
    
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(mockVotingResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(votesWithTimestamp))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      // Check that timestamp is formatted in pt-BR locale
      expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument()
    })
  })

  it('handles empty vote details gracefully', async () => {
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(mockVotingResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse([]))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByText('Nenhum voto registrado')).toBeInTheDocument()
    })
  })

  it('calculates percentages correctly for edge cases', async () => {
    const singleVoteResult = { yesVotes: 1, noVotes: 0, totalVotes: 1 }
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(singleVoteResult))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(mockAgenda))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse([mockVotes[0]]))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByText('1 (100%)')).toBeInTheDocument() // Yes votes
      expect(screen.getByText('0 (0%)')).toBeInTheDocument() // No votes
    })
  })

  it('shows not found message when results are missing', async () => {
    mockedApi.getVotingResult.mockResolvedValue(mockAxiosResponse(null))
    mockedApi.getAgenda.mockResolvedValue(mockAxiosResponse(null))
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse([]))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByText('Resultados não encontrados')).toBeInTheDocument()
    })
  })

  it('navigates back from error state', async () => {
    const user = userEvent.setup()
    mockedApi.getVotingResult.mockRejectedValue(new Error('API Error'))
    
    render(<VotingResult />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /← Voltar para Agendas/ })).toBeInTheDocument()
    })
    
    const backButton = screen.getByRole('button', { name: /← Voltar para Agendas/ })
    await user.click(backButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})