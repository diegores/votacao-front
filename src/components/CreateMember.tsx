import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMember } from "../services/api";

export default function CreateMember() {
  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const formatCpf = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const validateCpf = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    return cleanCpf.length === 11;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value);
    setCpf(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setMessage("❌ Nome é obrigatório");
      return;
    }

    if (!validateCpf(cpf)) {
      setMessage("❌ CPF deve ter 11 dígitos");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      
      const cleanCpf = cpf.replace(/\D/g, '');
      
      await createMember({ 
        cpf: cleanCpf, 
        name: name.trim() 
      });
      
      setMessage("✅ Membro cadastrado com sucesso!");
      setCpf("");
      setName("");
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      let errorMessage = "Erro ao salvar membro";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastrar Membro</h1>
        <p className="text-gray-600">
          Cadastre novos membros da cooperativa para participar das votações
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              id="name"
              type="text"
              placeholder="Ex: João Silva Santos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full"
              required
              maxLength={100}
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {name.length}/100 caracteres
            </div>
          </div>

          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
              CPF *
            </label>
            <input
              id="cpf"
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleCpfChange}
              className="input-field w-full"
              required
              maxLength={14}
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1">
              Apenas números são aceitos (11 dígitos)
            </div>
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

          <div className="flex space-x-4">
            <button 
              type="submit" 
              className={`btn-primary flex-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : '👥 Cadastrar Membro'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              ← Voltar
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-medium mb-2">💡 Informações importantes:</h3>
        <ul className="space-y-1 ml-4">
          <li>• Cada CPF pode ser cadastrado apenas uma vez</li>
          <li>• O CPF será usado para identificar o membro nas votações</li>
          <li>• Nome deve ser o nome completo do membro</li>
          <li>• Todos os campos são obrigatórios</li>
        </ul>
      </div>
    </div>
  );
}
