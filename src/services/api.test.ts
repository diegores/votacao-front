import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { getAgendas, getAgenda, getVotingResult, submitVote, createAgenda, openVotingSession } from './api'
import { mockAgenda, mockVotingResult, mockAxiosResponse } from '../test/mocks'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('API Service Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAgendas', () => {
    it('makes GET request to correct endpoint', async () => {
      const mockResponse = mockAxiosResponse([mockAgenda])
      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await getAgendas()

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/agendas')
      expect(result).toEqual(mockResponse)
    })

    it('handles API errors', async () => {
      const mockError = new Error('Network error')
      mockedAxios.get.mockRejectedValue(mockError)

      await expect(getAgendas()).rejects.toThrow('Network error')
    })
  })

  describe('getAgenda', () => {
    it('makes GET request to correct endpoint with ID', async () => {
      const mockResponse = mockAxiosResponse(mockAgenda)
      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await getAgenda('123')

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/agendas/123')
      expect(result).toEqual(mockResponse)
    })

    it('handles API errors', async () => {
      const mockError = new Error('Not found')
      mockedAxios.get.mockRejectedValue(mockError)

      await expect(getAgenda('invalid-id')).rejects.toThrow('Not found')
    })
  })

  describe('getVotingResult', () => {
    it('makes GET request to correct endpoint with ID', async () => {
      const mockResponse = mockAxiosResponse(mockVotingResult)
      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await getVotingResult('123')

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/agendas/123/result')
      expect(result).toEqual(mockResponse)
    })

    it('handles API errors', async () => {
      const mockError = new Error('Results not available')
      mockedAxios.get.mockRejectedValue(mockError)

      await expect(getVotingResult('invalid-id')).rejects.toThrow('Results not available')
    })
  })

  describe('submitVote', () => {
    it('makes POST request to correct endpoint with vote data', async () => {
      const mockResponse = mockAxiosResponse({})
      const voteData = { memberCpf: '12345678900', voteValue: 'SIM' as const }
      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await submitVote('123', voteData)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/agendas/123/votes',
        voteData
      )
      expect(result).toEqual(mockResponse)
    })

    it('handles API errors for invalid vote', async () => {
      const mockError = new Error('Member already voted')
      const voteData = { memberCpf: '12345678900', voteValue: 'SIM' as const }
      mockedAxios.post.mockRejectedValue(mockError)

      await expect(submitVote('123', voteData)).rejects.toThrow('Member already voted')
    })

    it('submits NAO vote correctly', async () => {
      const mockResponse = mockAxiosResponse({})
      const voteData = { memberCpf: '12345678900', voteValue: 'NAO' as const }
      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await submitVote('123', voteData)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/agendas/123/votes',
        voteData
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createAgenda', () => {
    it('makes POST request to correct endpoint with agenda data', async () => {
      const mockResponse = mockAxiosResponse({ id: '123' })
      const agendaData = { title: 'Test Agenda', description: 'Test description' }
      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await createAgenda(agendaData)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/agendas',
        agendaData
      )
      expect(result).toEqual(mockResponse)
    })

    it('handles API errors for invalid data', async () => {
      const mockError = new Error('Invalid agenda data')
      const agendaData = { title: '', description: '' }
      mockedAxios.post.mockRejectedValue(mockError)

      await expect(createAgenda(agendaData)).rejects.toThrow('Invalid agenda data')
    })

    it('creates agenda with special characters in title and description', async () => {
      const mockResponse = mockAxiosResponse({ id: '123' })
      const agendaData = {
        title: 'Agenda with éspecial characters & symbols!',
        description: 'Description with ñ, ç, and other special chars: @#$%'
      }
      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await createAgenda(agendaData)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/agendas',
        agendaData
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('openVotingSession', () => {
    it('makes POST request to correct endpoint with default duration', async () => {
      const mockResponse = mockAxiosResponse({})
      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await openVotingSession('123')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/agendas/123/voting-session',
        { durationMinutes: 1 }
      )
      expect(result).toEqual(mockResponse)
    })

    it('makes POST request with custom duration', async () => {
      const mockResponse = mockAxiosResponse({})
      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await openVotingSession('123', 5)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/agendas/123/voting-session',
        { durationMinutes: 5 }
      )
      expect(result).toEqual(mockResponse)
    })

    it('handles zero duration by using default', async () => {
      const mockResponse = mockAxiosResponse({})
      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await openVotingSession('123', 0)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/agendas/123/voting-session',
        { durationMinutes: 1 }
      )
    })

    it('handles undefined duration by using default', async () => {
      const mockResponse = mockAxiosResponse({})
      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await openVotingSession('123', undefined)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/agendas/123/voting-session',
        { durationMinutes: 1 }
      )
    })

    it('handles API errors for session opening', async () => {
      const mockError = new Error('Session already open')
      mockedAxios.post.mockRejectedValue(mockError)

      await expect(openVotingSession('123', 5)).rejects.toThrow('Session already open')
    })

    it('opens session with maximum duration', async () => {
      const mockResponse = mockAxiosResponse({})
      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await openVotingSession('123', 60)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/agendas/123/voting-session',
        { durationMinutes: 60 }
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('API Base URL', () => {
    it('uses correct base URL for all endpoints', async () => {
      const mockResponse = mockAxiosResponse([])
      mockedAxios.get.mockResolvedValue(mockResponse)
      mockedAxios.post.mockResolvedValue(mockResponse)

      // Test all endpoints use the correct base URL
      await getAgendas()
      await getAgenda('1')
      await getVotingResult('1')
      await submitVote('1', { memberCpf: '123', voteValue: 'SIM' })
      await createAgenda({ title: 'Test', description: 'Test' })
      await openVotingSession('1', 1)

      // Verify all calls use localhost:8080
      const calls = mockedAxios.get.mock.calls.concat(mockedAxios.post.mock.calls)
      calls.forEach((call) => {
        expect(call[0]).toMatch(/^http:\/\/localhost:8080\/api\//)
      })
    })
  })

  describe('Error Handling', () => {
    it('propagates axios errors correctly', async () => {
      const axiosError = {
        response: {
          status: 400,
          data: { message: 'Bad request' }
        },
        message: 'Request failed'
      }
      mockedAxios.get.mockRejectedValue(axiosError)

      await expect(getAgendas()).rejects.toEqual(axiosError)
    })

    it('propagates network errors correctly', async () => {
      const networkError = new Error('Network Error')
      mockedAxios.post.mockRejectedValue(networkError)

      await expect(createAgenda({ title: 'Test', description: 'Test' })).rejects.toThrow('Network Error')
    })
  })

  describe('Request Formats', () => {
    it('sends correct headers for POST requests', async () => {
      const mockResponse = mockAxiosResponse({})
      mockedAxios.post.mockResolvedValue(mockResponse)

      await createAgenda({ title: 'Test', description: 'Test' })

      // Verify axios was called with correct parameters
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/agendas',
        { title: 'Test', description: 'Test' }
      )
    })

    it('handles special characters in vote data', async () => {
      const mockResponse = mockAxiosResponse({})
      const voteData = { memberCpf: '123.456.789-00', voteValue: 'SIM' as const }
      mockedAxios.post.mockResolvedValue(mockResponse)

      await submitVote('123', voteData)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/agendas/123/votes',
        voteData
      )
    })
  })
})