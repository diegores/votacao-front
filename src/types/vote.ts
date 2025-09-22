export interface CreateVoteRequest {
  memberCpf: string;
  voteValue: "YES" | "NO";
}

export interface VotingResultResponse {
  total: number;
  yes: number;
  no: number;
}
