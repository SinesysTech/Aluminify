# Área do Aluno

Sistema completo de gerenciamento educacional com arquitetura API-First, modularizada e baseada em princípios SOLID, KISS e YAGNI. Inclui plataforma web completa para alunos, professores e administradores.

## 🏗️ Arquitetura

### Estrutura do Projeto

```
backend/
├── services/          # Serviços modulares independentes
│   ├── discipline/   # Serviço de Disciplinas
│   ├── segment/       # Serviço de Segmentos
│   ├── course/        # Serviço de Cursos
│   ├── student/       # Serviço de Alunos
│   ├── teacher/       # Serviço de Professores
│   ├── enrollment/    # Serviço de Matrículas
│   ├── course-material/ # Serviço de Materiais
│   └── api-key/       # Serviço de API Keys
├── auth/              # Sistema de autenticação
├── clients/            # Clientes de banco de dados
└── swagger/            # Documentação Swagger

app/
├── api/                # Rotas Next.js API Routes
│   ├── auth/           # Autenticação
│   ├── api-key/        # Gerenciamento de API Keys
│   ├── chat/           # Chat com IA
│   ├── conversations/  # Gerenciamento de conversas
│   ├── cronograma/     # Cronogramas de estudo
│   ├── discipline/     # Disciplinas
│   ├── segment/        # Segmentos
│   ├── course/         # Cursos
│   ├── student/        # Alunos
│   ├── teacher/        # Professores
│   ├── enrollment/     # Matrículas
│   ├── course-material/ # Materiais
│   ├── frente/         # Frentes (módulos)
│   └── docs/           # Documentação OpenAPI
├── (dashboard)/        # Rotas protegidas do dashboard
│   ├── aluno/          # Dashboard do aluno
│   ├── professor/      # Dashboard do professor
│   ├── curso/          # Gerenciamento de cursos
│   ├── disciplina/     # Gerenciamento de disciplinas
│   └── ...
└── auth/               # Páginas de autenticação

components/             # Componentes React reutilizáveis
hooks/                  # React hooks customizados
lib/                    # Utilitários e clientes
backend/                # Lógica de negócio
├── services/           # Serviços modulares
├── auth/               # Sistema de autenticação
├── clients/            # Clientes de banco de dados
└── swagger/            # Documentação Swagger

supabase/
├── migrations/         # Migrations do banco de dados
└── functions/          # Edge Functions do Supabase
```

## 🚀 Tecnologias

### Core
- **Next.js 16.0.3** - Framework React com App Router
- **TypeScript 5** - Tipagem estática
- **React 19.2.0** - Biblioteca UI
- **Tailwind CSS 4** - Estilização

### Backend
- **Supabase** - Banco de dados PostgreSQL + Auth
- **Row Level Security (RLS)** - Segurança em nível de banco
- **Upstash Redis** - Cache distribuído (opcional)

### Integrações
- **N8N** - Workflow automation para chat com IA
- **Swagger/OpenAPI** - Documentação de API
- **Shadcn/ui** - Componentes UI

### Bibliotecas Principais
- **@tanstack/react-query** - Gerenciamento de estado servidor
- **@tanstack/react-table** - Tabelas de dados
- **react-hook-form + zod** - Validação de formulários
- **date-fns** - Manipulação de datas
- **papaparse/xlsx** - Importação de dados

## 📋 Pré-requisitos

- Node.js 18+
- Conta Supabase configurada
- Variáveis de ambiente configuradas

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-publishable-or-anon-key
SUPABASE_URL=your-project-url
SUPABASE_SECRET_KEY=sb_secret_...  # Recomendado para backend

# Upstash Redis (opcional, mas recomendado para produção)
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

Para mais detalhes sobre as variáveis de ambiente, consulte [ENV_VARIABLES.md](./ENV_VARIABLES.md).

### Instalação

```bash
npm install
```

### Executar em Desenvolvimento

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`

## 📚 Documentação

### Documentação Interativa

- **Swagger UI**: `http://localhost:3000/swagger` - Documentação interativa da API
- **OpenAPI JSON**: `http://localhost:3000/api/docs` - Especificação OpenAPI completa

### Guias e Documentação

📖 **[Ver Índice Completo de Documentação](./docs/README.md)** - Navegue por toda a documentação do projeto

#### Configuração e Setup
- [Variáveis de Ambiente](./ENV_VARIABLES.md) - Todas as variáveis necessárias
- [Guia de Deploy](./DEPLOY.md) - Como fazer deploy na Vercel
- [Guia de Instalação do Supabase CLI](./GUIA_INSTALACAO_SUPABASE_CLI.md)

#### API e Autenticação
- [Sistema de Autenticação](./docs/authentication.md) - JWT, API Keys, tipos de usuários
- [Documentação da API](./docs/API.md) - Todos os endpoints disponíveis
- [Schema do Banco de Dados](./docs/schema/schema.md) - Estrutura do banco

#### Funcionalidades Específicas
- [Fluxo de Geração de Cronograma](./FLUXO_GERACAO_CRONOGRAMA.md)
- [Fluxo de Calendário](./FLUXO_CALENDARIO.md)
- [Primeiro Professor Superadmin](./docs/first-professor-superadmin.md)

#### Integrações
- [Configuração do N8N](./docs/N8N_SETUP.md) - Chat com IA
- [Acesso a Anexos no N8N](./docs/N8N_ATTACHMENT_ACCESS.md)
- [Configuração do Redis Upstash](./docs/UPSTASH_REDIS_SETUP.md)
- [Simplificação do Chat](./docs/SIMPLIFICACAO_CHAT.md)

## 🔐 Autenticação

O sistema suporta duas formas de autenticação:

1. **JWT** - Para interface de usuário (`Authorization: Bearer <token>`)
2. **API Key** - Para requisições diretas (`X-API-Key: <key>`)

Veja [docs/authentication.md](./docs/authentication.md) para mais detalhes.

## 👥 Tipos de Usuários

1. **Aluno** - Acesso limitado aos próprios dados
2. **Professor** - Pode criar e gerenciar recursos educacionais
3. **Superadmin** - Acesso total ao sistema

## 📦 Funcionalidades Implementadas

### Backend API
- ✅ Autenticação (JWT + API Keys)
- ✅ Disciplinas
- ✅ Segmentos
- ✅ Cursos
- ✅ Alunos
- ✅ Professores
- ✅ Matrículas
- ✅ Materiais de Curso
- ✅ API Keys
- ✅ Chat com IA (integrado com N8N)
- ✅ Conversas e histórico de chat
- ✅ Cronogramas de estudo
- ✅ Gerenciamento de frentes/módulos/aulas

### Frontend
- ✅ Interface web completa (Next.js 16)
- ✅ Autenticação e autorização
- ✅ Dashboard para alunos e professores
- ✅ Gerenciamento de cursos e conteúdo
- ✅ Sistema de chat com IA
- ✅ Geração e visualização de cronogramas
- ✅ Calendário de estudos
- ✅ Importação de alunos via CSV/Excel

## 🗄️ Banco de Dados

O banco de dados está configurado no Supabase com:
- Tabelas criadas via migrations
- Row Level Security (RLS) configurado
- Triggers para auditoria (`created_by`, `updated_at`)
- Políticas de acesso por tipo de usuário

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build e Produção
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção

# Qualidade de Código
npm run lint         # Executa linter ESLint
```

## 🔄 Rotas da API Principais

### Autenticação
- `POST /api/auth/signup` - Cadastro de usuário
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/me` - Obter usuário atual
- `POST /api/auth/refresh` - Atualizar token

### Chat e IA
- `POST /api/chat` - Enviar mensagem ao chat
- `GET /api/conversations` - Listar conversas
- `GET /api/conversations/[id]` - Obter conversa específica
- `PUT /api/conversations/[id]` - Atualizar conversa

### Cronogramas
- `POST /api/cronograma` - Criar cronograma
- `GET /api/cronograma/[id]` - Obter cronograma
- `PUT /api/cronograma/[id]/distribuicao-dias` - Atualizar distribuição

### Cursos e Conteúdo
- `GET /api/course` - Listar cursos
- `POST /api/course` - Criar curso
- `GET /api/discipline` - Listar disciplinas
- `GET /api/segment` - Listar segmentos
- `GET /api/course-material` - Listar materiais

### Usuários
- `GET /api/student` - Listar alunos
- `POST /api/student/import` - Importar alunos (CSV/Excel)
- `GET /api/teacher` - Listar professores

### API Keys
- `POST /api/api-key` - Criar API Key
- `GET /api/api-key` - Listar suas API Keys

Veja a [documentação completa da API](./docs/API.md) para detalhes de todos os endpoints.

## 🚀 Deploy

### Deploy na Vercel

O projeto está configurado para deploy na Vercel. Consulte o guia completo em [DEPLOY.md](./DEPLOY.md).

**Arquivos de configuração:**
- `vercel.json` - Configurações do Vercel
- `middleware.ts` - Middleware de autenticação Next.js
- `next.config.ts` - Configurações do Next.js

**Pré-requisitos:**
- Conta na Vercel
- Variáveis de ambiente configuradas (veja [ENV_VARIABLES.md](./ENV_VARIABLES.md))
- Projeto Supabase configurado
- Upstash Redis (opcional, mas recomendado)

## 📝 Estrutura de um Serviço

Cada serviço segue o mesmo padrão:

```
service-name/
├── service-name.types.ts      # Tipos e DTOs
├── service-name.service.ts     # Lógica de negócio
├── service-name.repository.ts  # Interface e implementação
├── errors.ts                   # Erros específicos
└── index.ts                   # Exportações
```

## 🔄 Princípios Aplicados

- **SOLID** - Separação de responsabilidades, inversão de dependências
- **KISS** - Simplicidade e clareza
- **YAGNI** - Apenas o necessário, sem over-engineering
- **API-First** - Backend independente do frontend
- **Modularização** - Serviços independentes e reutilizáveis

## 📝 Changelog e Atualizações

### Janeiro 2025

- ✅ Sistema completo de cronogramas de estudo
- ✅ Chat com IA integrado via N8N
- ✅ Importação de alunos via CSV/Excel
- ✅ Gerenciamento completo de cursos, disciplinas e materiais
- ✅ Sistema de autenticação robusto (JWT + API Keys)
- ✅ Interface web completa para alunos e professores
- ✅ Documentação completa atualizada

## 📄 Licença

Este projeto é privado e proprietário.

---

**Última atualização:** Janeiro 2025
