# Sistema de Votação - Frontend

Frontend em React + TypeScript para o sistema de votação de cooperativas.

## 🚀 Funcionalidades

Este sistema implementa todas as funcionalidades requeridas pelo desafio:

1. **📋 Gestão de Agendas**
   - Registrar novos itens de agenda
   - Visualizar todas as pautas criadas
   - Acompanhar status das sessões de votação

2. **⏰ Gestão de Sessões de Votação**
   - Abrir sessões de votação com duração configurável (padrão: 1 minuto)
   - Controle automático de abertura/fechamento baseado no tempo
   - Visualização em tempo real do status das sessões

3. **🗳️ Sistema de Votação**
   - Votação simples: "SIM" ou "NÃO"
   - Identificação única por CPF
   - Prevenção de voto duplicado por membro/agenda
   - Interface intuitiva para registro de votos

4. **📊 Contagem e Resultados**
   - Contagem automática de votos
   - Exibição de resultados em tempo real
   - Gráficos visuais de percentuais
   - Histórico detalhado de todos os votos

5. **👥 Gestão de Membros**
   - Cadastro de membros da cooperativa
   - Validação e formatação de CPF
   - Interface para seleção de membros na votação

## 🛠️ Tecnologias Utilizadas

- **React 18** - Interface do usuário
- **TypeScript** - Tipagem estática
- **React Router** - Navegação entre páginas
- **Tailwind CSS** - Estilização e design responsivo
- **Axios** - Cliente HTTP para comunicação com backend
- **Vite** - Build tool e servidor de desenvolvimento

## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn
- Backend em Java Spring Boot rodando na porta 8080

## 🚀 Como Executar

### 1. Clone e instale dependências
```bash
cd votacao-front
npm install
```

### 2. Execute o projeto
```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

### 3. Scripts disponíveis
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build de produção
npm run lint     # Verificação de código
```

## 🏗️ Arquitetura do Projeto

```
src/
├── components/          # Componentes React
│   ├── AgendaList.tsx   # Lista e gestão de agendas
│   ├── CreateAgenda.tsx # Criação de novas pautas
│   ├── VotingSession.tsx # Interface de votação
│   ├── VotingResult.tsx # Exibição de resultados
│   └── CreateMember.tsx # Cadastro de membros
├── services/
│   └── api.ts          # Cliente HTTP e endpoints
├── types/
│   ├── agenda.ts       # Tipos TypeScript para agendas
│   ├── member.ts       # Tipos TypeScript para membros
│   └── vote.ts         # Tipos TypeScript para votos
├── App.tsx             # Componente principal
├── main.tsx            # Ponto de entrada
└── index.css           # Estilos globais
```

## 🔄 Fluxo da Aplicação

1. **Cadastro de Membros**: Admin cadastra membros da cooperativa
2. **Criação de Agenda**: Admin cria nova pauta para votação
3. **Abertura de Sessão**: Admin abre sessão de votação (duração configurável)
4. **Votação**: Membros votam "SIM" ou "NÃO" 
5. **Resultados**: Visualização de resultados em tempo real
6. **Encerramento**: Sessão encerra automaticamente após tempo definido

## 🎨 Design e UX

- **Design Responsivo**: Funciona em desktop, tablet e mobile
- **Interface Intuitiva**: Navegação clara e simples
- **Feedback Visual**: Estados de loading, sucesso e erro
- **Acessibilidade**: Labels, cores contrastantes e navegação por teclado

## 🔗 Integração com Backend

O frontend espera que o backend esteja rodando em `http://localhost:8080` com os seguintes endpoints:

### Agendas
- `GET /api/agendas` - Listar agendas
- `POST /api/agendas` - Criar agenda
- `GET /api/agendas/{id}` - Obter agenda específica
- `POST /api/agendas/{id}/voting-session` - Abrir sessão de votação
- `GET /api/agendas/{id}/result` - Obter resultado da votação

### Votos
- `POST /api/agendas/{id}/votes` - Registrar voto
- `GET /api/agendas/{id}/votes` - Listar votos da agenda

### Membros
- `POST /api/members` - Cadastrar membro
- `GET /api/members` - Listar membros

## 🚨 Tratamento de Erros

- Validação de formulários no frontend
- Tratamento de erros de rede
- Mensagens de erro amigáveis ao usuário
- Estados de loading para melhor UX

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🔒 Considerações de Segurança

Conforme especificado no desafio:
- Segurança de interface abstraída
- Todas as chamadas consideradas autorizadas
- Foco na funcionalidade de votação

## 📝 Notas de Desenvolvimento

- Código TypeScript com tipagem completa
- Componentes funcionais com hooks
- Estado local gerenciado com useState
- Comunicação HTTP via Axios
- Estilização com Tailwind CSS
- Código limpo e bem documentado

## 🤝 Como Contribuir

1. Clone o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Execute os testes
5. Faça commit das mudanças
6. Abra um Pull Request

---

**Desenvolvido para o desafio de Sistema de Votação de Cooperativas**
