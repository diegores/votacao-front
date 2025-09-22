export interface Agenda {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: 'OPEN' | 'CLOSED';
  sessionStartTime?: string;
  sessionEndTime?: string;
  votingOpen: boolean;
}

export interface VoteRequest {
  memberId: string;
  voteType: 'SIM' | 'NAO';
}

export interface VotingResult {
  yesVotes: number;
  noVotes: number;
}
