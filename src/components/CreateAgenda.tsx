import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAgenda } from "../services/api";

export default function CreateAgenda() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setMessage("❌ Título e descrição são obrigatórios");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      await createAgenda({ title: title.trim(), description: description.trim() });
      setMessage("✅ Pauta criada com sucesso!");
      setTitle("");
      setDescription("");
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setMessage("❌ Erro ao criar pauta. Verifique se o backend está rodando.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Nova Pauta</h1>
        <p className="text-gray-600">
          Crie um novo item de agenda para votação na cooperativa
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título da Pauta *
            </label>
            <input
              id="title"
              type="text"
              placeholder="Ex: Aprovação do novo regimento interno"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field w-full"
              required
              maxLength={100}
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {title.length}/100 caracteres
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição da Pauta *
            </label>
            <textarea
              id="description"
              placeholder="Descreva detalhadamente o que será votado..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field w-full"
              rows={6}
              required
              maxLength={500}
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/500 caracteres
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
              {loading ? 'Criando...' : '➕ Criar Pauta'}
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
        <h3 className="font-medium mb-2">💡 Dicas para criar uma boa pauta:</h3>
        <ul className="space-y-1 ml-4">
          <li>• Use um título claro e objetivo</li>
          <li>• Explique o contexto e impacto da decisão</li>
          <li>• Inclua informações suficientes para tomada de decisão</li>
          <li>• Evite termos técnicos desnecessários</li>
        </ul>
      </div>
    </div>
  );
}
