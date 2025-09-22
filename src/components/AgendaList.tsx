import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAgendas, openVotingSession } from '../services/api';
import type { Agenda } from '../types/agenda';

export const AgendaList: React.FC = () => {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionDuration, setSessionDuration] = useState<number>(1);
  const navigate = useNavigate();

  const fetchAgendas = async () => {
    try {
      setLoading(true);
      const res = await getAgendas();
      setAgendas(res.data);
    } catch (err) {
      console.error('Erro ao buscar agendas:', err);
      alert('Erro ao carregar agendas. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendas();
  }, []);

  const handleOpenSession = async (agendaId: string) => {
    try {
      await openVotingSession(agendaId, sessionDuration);
      setAgendas((prev) =>
        prev.map((a) =>
          a.id === agendaId ? { ...a, votingOpen: true, status: 'OPEN' } : a
        )
      );
      alert(`Sessão de votação aberta por ${sessionDuration} minuto(s)!`);
    } catch (err) {
      console.error('Erro ao abrir sessão:', err);
      alert('Erro ao abrir sessão de votação.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando agendas...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sistema de Votação - Agendas
        </h1>
        <p className="text-gray-600">
          Gerencie as pautas e sessões de votação da cooperativa
        </p>
      </div>

      {agendas.length === 0 ? (
        <div className="card text-center">
          <h3 className="text-lg font-semibold mb-2">Nenhuma agenda encontrada</h3>
          <p className="text-gray-600 mb-4">
            Crie uma nova pauta para começar a gerenciar votações.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="btn-primary"
          >
            ➕ Criar Primeira Pauta
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agendas.map((agenda) => (
            <div key={agenda.id} className="card">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {agenda.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {agenda.description}
                </p>
                
                <div className="text-xs text-gray-500 mb-3">
                  Criada em: {formatDate(agenda.createdAt)}
                </div>

                <div className="flex items-center mb-4">
                  <span className="text-sm font-medium mr-2">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agenda.votingOpen
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {agenda.votingOpen ? '🟢 Votação Aberta' : '🔴 Votação Fechada'}
                  </span>
                </div>

                {agenda.votingOpen && agenda.sessionEndTime && (
                  <div className="text-xs text-orange-600 mb-3">
                    Sessão termina em: {formatDate(agenda.sessionEndTime)}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {!agenda.votingOpen && (
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="text-sm font-medium">Duração (min):</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(parseInt(e.target.value) || 1)}
                      className="input-field w-20 text-sm"
                    />
                  </div>
                )}

                <button
                  onClick={() => handleOpenSession(agenda.id)}
                  disabled={agenda.votingOpen}
                  className={`w-full ${
                    agenda.votingOpen ? 'btn-secondary cursor-not-allowed' : 'btn-primary'
                  }`}
                >
                  {agenda.votingOpen ? '✅ Sessão Ativa' : '🚀 Abrir Sessão'}
                </button>

                <button
                  onClick={() => navigate(`/vote/${agenda.id}`)}
                  disabled={!agenda.votingOpen}
                  className={`w-full ${
                    agenda.votingOpen ? 'btn-success' : 'btn-secondary cursor-not-allowed'
                  }`}
                >
                  {agenda.votingOpen ? '🗳️ Votar Agora' : '🗳️ Votação Fechada'}
                </button>

                <button
                  onClick={() => navigate(`/results/${agenda.id}`)}
                  className="w-full btn-warning"
                >
                  📊 Ver Resultados
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
