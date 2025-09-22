import axios from 'axios';
import type { Agenda } from '../types/agenda';

const API_BASE_URL = '/api';

export const getAgendas = () => axios.get<Agenda[]>(`${API_BASE_URL}/agendas/v1`);
export const getAgenda = (id: string) => axios.get<Agenda>(`${API_BASE_URL}/agendas/v1/${id}`);
export const getVotingResult = (id: string) => axios.get(`${API_BASE_URL}/agendas/v1/${id}/result`);

// Submeter voto
export const submitVote = (agendaId: string, vote: { memberId: string; voteType: 'YES' | 'NO' }) =>
  axios.post(`${API_BASE_URL}/agendas/v1/${agendaId}/votes`, vote);

// Criar nova pauta
export const createAgenda = (data: { title: string; description: string }) =>
  axios.post(`${API_BASE_URL}/agendas/v1`, data);

// Abrir sessão de votação
export const openVotingSession = (agendaId: string, durationMinutes?: number) =>
  axios.post(`${API_BASE_URL}/agendas/v1/${agendaId}/voting-session`, {
    durationMinutes: durationMinutes || 1,
  });

// Buscar membros
export const getMembers = () => axios.get(`${API_BASE_URL}/members/v1`);

// Buscar votos de uma agenda
export const getVotes = (agendaId: string) => axios.get(`${API_BASE_URL}/agendas/v1/${agendaId}/votes`);

// Criar novo membro
export const createMember = (data: { cpf: string; name: string }) =>
  axios.post(`${API_BASE_URL}/members/v1`, data);
