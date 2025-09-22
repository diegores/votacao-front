import type { Agenda } from '../types/agenda'
import type { Member } from '../types/member'

// Mock data for tests
export const mockAgenda: Agenda = {
  id: '1',
  title: 'Test Agenda',
  description: 'Test agenda description',
  createdAt: '2024-01-01T00:00:00Z',
  status: 'CLOSED',
  votingOpen: false,
}

export const mockOpenAgenda: Agenda = {
  ...mockAgenda,
  status: 'OPEN',
  votingOpen: true,
  sessionStartTime: '2024-01-01T10:00:00Z',
  sessionEndTime: '2024-01-01T10:05:00Z',
}

export const mockMember: Member = {
  id: '1',
  cpf: '12345678900',
  name: 'Test Member',
  createdAt: '2024-01-01T00:00:00Z',
}

export const mockVotingResult = {
  yesVotes: 3,
  noVotes: 2,
  totalVotes: 5,
}

export const mockVotes = [
  {
    memberCpf: '12345678900',
    memberName: 'Test Member 1',
    voteValue: 'SIM' as const,
    votedAt: '2024-01-01T10:01:00Z',
  },
  {
    memberCpf: '12345678901',
    memberName: 'Test Member 2',
    voteValue: 'NAO' as const,
    votedAt: '2024-01-01T10:02:00Z',
  },
]

// Mock axios responses
export const mockAxiosResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
})

// Mock fetch responses
export const mockFetchResponse = <T>(data: T): Response => {
  const response = new Response(JSON.stringify(data), {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'application/json' }
  })
  return response
}

// Mock error responses
export const mockErrorResponse = (message: string) => ({
  response: {
    data: { message },
    status: 400,
  },
})