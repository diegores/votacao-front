export interface Member {
  id: string;
  cpf: string;
  name: string;
  createdAt: string;
}

export interface CreateMemberRequest {
  cpf: string;
  name: string;
}
