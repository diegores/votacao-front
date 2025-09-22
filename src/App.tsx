import { Routes, Route, Link } from "react-router-dom";
import { AgendaList } from "./components/AgendaList";
import CreateAgenda from "./components/CreateAgenda";
import VotingResult from "./components/VotingResult";
import VotingSession from "./components/VotingSession";
import CreateMember from "./components/CreateMember";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <nav className="w-64 bg-blue-800 text-white p-6 min-h-screen">
          <h1 className="text-xl font-bold mb-6">Sistema de Votação</h1>
          <ul className="space-y-3">
            <li>
              <Link 
                to="/" 
                className="block px-3 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                📋 Agendas
              </Link>
            </li>
            <li>
              <Link 
                to="/create" 
                className="block px-3 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                ➕ Criar Pauta
              </Link>
            </li>
            <li>
              <Link 
                to="/createMembers" 
                className="block px-3 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                👥 Cadastrar Membros
              </Link>
            </li>
          </ul>
        </nav>

        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<AgendaList />} />
            <Route path="/create" element={<CreateAgenda />} />
            <Route path="/vote/:id" element={<VotingSession />} />
            <Route path="/results/:id" element={<VotingResult />} />
            <Route path="/createMembers" element={<CreateMember />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
