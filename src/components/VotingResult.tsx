import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVotingResult, getAgenda } from '../services/api';
import type { Agenda } from '../types/agenda';

interface VotingResultData {
  yesVotes: number;
  noVotes: number;
  totalVotes: number;
  agenda: {
    id: string;
    title: string;
    description: string;
    status: string;
    votingOpen: boolean;
  };
}

interface VoteDetail {
  memberCpf: string;
  memberName: string;
  voteValue: 'SIM' | 'NAO';
  votedAt: string;
}

const VotingResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<VotingResultData | null>(null);
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [voteDetails, setVoteDetails] = useState<VoteDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [resultsRes, agendaRes, votesRes] = await Promise.all([
        getVotingResult(id!),
        getAgenda(id!),
        fetch(`http://localhost:8080/api/agendas/v1/${id}/votes`)
      ]);

      setResults(resultsRes.data);
      setAgenda(agendaRes.data);

      if (votesRes.ok) {
        const votesData = await votesRes.json();
        setVoteDetails(votesData || []);
      }
    } catch (err: unknown) {
      console.error('Erro ao buscar resultados:', err);
      setError('Erro ao carregar resultados. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getWinnerText = () => {
    if (!results || results.totalVotes === 0) return 'Nenhum voto registrado';
    
    if (results.yesVotes > results.noVotes) {
      return '✅ APROVADA';
    } else if (results.noVotes > results.yesVotes) {
      return '❌ REJEITADA';
    } else {
      return '⚖️ EMPATE';
    }
  };

  const getWinnerColor = () => {
    if (!results || results.totalVotes === 0) return 'text-gray-600';
    
    if (results.yesVotes > results.noVotes) {
      return 'text-green-600';
    } else if (results.noVotes > results.yesVotes) {
      return 'text-red-600';
    } else {
      return 'text-yellow-600';
    }
  };

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando resultados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center">
        <h2 className="text-xl font-semibold mb-4">Erro ao Carregar Resultados</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate("/")} className="btn-primary">
          ← Voltar para Agendas
        </button>
      </div>
    );
  }

  if (!results || !agenda) {
    return (
      <div className="card text-center">
        <h2 className="text-xl font-semibold mb-4">Resultados não encontrados</h2>
        <button onClick={() => navigate("/")} className="btn-primary">
          ← Voltar para Agendas
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate("/")} 
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Voltar para Agendas
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Resultados da Votação</h1>
        <h2 className="text-xl text-gray-700 mb-2">{agenda.title}</h2>
        <p className="text-gray-600">{agenda.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="card text-center">
          <h3 className="text-lg font-semibold mb-2">Status da Pauta</h3>
          <div className={`text-2xl font-bold ${getWinnerColor()}`}>
            {getWinnerText()}
          </div>
        </div>

        <div className="card text-center">
          <h3 className="text-lg font-semibold mb-2">Total de Votos</h3>
          <div className="text-3xl font-bold text-blue-600">
            {results.totalVotes}
          </div>
        </div>

        <div className="card text-center">
          <h3 className="text-lg font-semibold mb-2">Status da Sessão</h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              agenda.votingOpen
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {agenda.votingOpen ? '🟢 Aberta' : '🔴 Fechada'}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">📈 Resultados</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-green-700">✅ Votos SIM</span>
                <span className="font-bold text-green-700">
                  {results.yesVotes} ({calculatePercentage(results.yesVotes, results.totalVotes)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${calculatePercentage(results.yesVotes, results.totalVotes)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-red-700">❌ Votos NÃO</span>
                <span className="font-bold text-red-700">
                  {results.noVotes} ({calculatePercentage(results.noVotes, results.totalVotes)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${calculatePercentage(results.noVotes, results.totalVotes)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">🗳️ Detalhes dos Votos</h3>
          
          {voteDetails.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum voto registrado
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {voteDetails.map((vote) => (
                <div
                  key={vote.memberCpf}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{vote.memberName}</div>
                    <div className="text-sm text-gray-500">{vote.memberCpf}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vote.voteValue === 'SIM'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {vote.voteValue === 'SIM' ? '✅ SIM' : '❌ NÃO'}
                    </span>
                    <div className="text-xs text-gray-400">
                      {formatDate(vote.votedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate(`/vote/${id}`)}
          disabled={!agenda.votingOpen}
          className={`${
            agenda.votingOpen ? 'btn-success' : 'btn-secondary cursor-not-allowed'
          }`}
        >
          {agenda.votingOpen ? '🗳️ Continuar Votando' : '🗳️ Votação Encerrada'}
        </button>
        
        <button
          onClick={() => navigate("/")}
          className="btn-primary"
        >
          📋 Ver Todas as Agendas
        </button>
      </div>
    </div>
  );
};

export default VotingResult;