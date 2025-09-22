import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAgenda, submitVote, getMembers, getVotes } from "../services/api";
import type { Agenda } from "../types/agenda";

type MemberType = {
  id: string;
  cpf: string;
  name: string;
};

type VoteType = {
  memberCpf: string;
  memberName: string;
  voteValue: "SIM" | "NAO";
  votedAt: string;
};

export default function VotingSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [votes, setVotes] = useState<VoteType[]>([]);
  const [members, setMembers] = useState<MemberType[]>([]);
  const [memberCpf, setMemberCpf] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [agendaRes, membersRes] = await Promise.all([
        getAgenda(id!),
        getMembers()
      ]);

      setAgenda(agendaRes.data);
      setMembers(membersRes.data || []);

      // Try to fetch votes separately with error handling
      try {
        const votesRes = await getVotes(id!);
        setVotes(votesRes.data || []);
      } catch (votesErr) {
        console.warn("Failed to load votes, starting with empty list:", votesErr);
        setVotes([]);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setMessage("Erro ao carregar dados. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  const handleVote = async (voteValue: "YES" | "NO") => {
    if (!memberCpf) {
      setMessage("❌ Selecione um membro antes de votar!");
      return;
    }

    if (votes.some(v => v.memberCpf === memberCpf)) {
      setMessage("❌ Este membro já votou nesta pauta!");
      return;
    }

    try {
      setVoting(true);
      setMessage("");
      
      const voteData = {
        memberId: memberCpf,
        voteType: voteValue
      };

      await submitVote(id!, voteData);
      setMessage(`✅ Voto "${voteValue}" registrado com sucesso!`);
      setMemberCpf("");
      
      // Atualizar votos
      await fetchData();
    } catch (err: unknown) {
      console.error("Erro ao votar:", err);
      let errorMessage = "Erro ao registrar voto";
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as {response?: {data?: {message?: string}}}).response;
        errorMessage = response?.data?.message || errorMessage;
      }
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setVoting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const selectedMember = members.find(m => m.cpf === memberCpf);
  const hasVoted = selectedMember && votes.some(v => v.memberCpf === selectedMember.cpf);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando sessão de votação...</div>
      </div>
    );
  }

  if (!agenda) {
    return (
      <div className="card text-center">
        <h2 className="text-xl font-semibold mb-4">Pauta não encontrada</h2>
        <button onClick={() => navigate("/")} className="btn-primary">
          ← Voltar para Agendas
        </button>
      </div>
    );
  }

  if (!agenda.votingOpen) {
    return (
      <div className="card text-center">
        <h2 className="text-xl font-semibold mb-4">Sessão de Votação Fechada</h2>
        <p className="text-gray-600 mb-4">Esta pauta não está mais disponível para votação.</p>
        <div className="space-x-4">
          <button onClick={() => navigate("/")} className="btn-secondary">
            ← Voltar para Agendas
          </button>
          <button onClick={() => navigate(`/results/${id}`)} className="btn-warning">
            📊 Ver Resultados
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate("/")} 
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Voltar para Agendas
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{agenda.title}</h1>
        <p className="text-gray-600">{agenda.description}</p>
        
        {agenda.sessionEndTime && (
          <div className="mt-2 text-sm text-orange-600">
            ⏰ Sessão termina em: {formatDate(agenda.sessionEndTime)}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">🗳️ Registrar Voto</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="member" className="block text-sm font-medium text-gray-700 mb-2">
                Selecione o Membro:
              </label>
              <select
                id="member"
                value={memberCpf}
                onChange={(e) => {
                  setMemberCpf(e.target.value);
                  setMessage("");
                }}
                className="input-field w-full"
                disabled={voting}
              >
                <option value="">-- Selecione um membro --</option>
                {members.map((member) => (
                  <option key={member.cpf} value={member.cpf}>
                    {member.name} ({member.cpf})
                  </option>
                ))}
              </select>
              
              {selectedMember && hasVoted && (
                <div className="text-sm text-red-600 mt-1">
                  ⚠️ Este membro já votou nesta pauta
                </div>
              )}
            </div>

            {message && (
              <div className={`p-3 rounded-lg ${
                message.includes('✅') 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleVote("YES")}
                disabled={!memberCpf || voting || hasVoted}
                className={`btn-success ${(!memberCpf || voting || hasVoted) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {voting ? 'Votando...' : '✅ Votar SIM'}
              </button>
              
              <button
                onClick={() => handleVote("NO")}
                disabled={!memberCpf || voting || hasVoted}
                className={`btn-danger ${(!memberCpf || voting || hasVoted) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {voting ? 'Votando...' : '❌ Votar NÃO'}
              </button>
            </div>

            <div className="text-sm text-gray-600">
              💡 Cada membro pode votar apenas uma vez por pauta
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">📊 Votos Registrados ({votes.length})</h2>
          
          {votes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum voto registrado ainda
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {votes.map((vote) => (
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
                    {vote.votedAt && (
                      <div className="text-xs text-gray-400">
                        {formatDate(vote.votedAt)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => navigate(`/results/${id}`)}
              className="w-full btn-warning"
            >
              📊 Ver Resultados Consolidados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
