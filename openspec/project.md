# Project Context

## Purpose
**Aluminify** é uma plataforma open-source e white-label de área do aluno para instituições educacionais. Oferece funcionalidades como gestão de alunos, professores, turmas, agendamentos, flashcards com IA contextual, e analytics de desempenho.

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Runtime:** React 19.2.0
- **Linguagem:** TypeScript 5
- **Styling:** Tailwind CSS v4 (PostCSS @tailwindcss/postcss)
- **Componentes UI:** shadcn/ui (Radix UI primitives)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Temas:** next-themes (dark/light mode)
- **Animações:** Motion (framer-motion successor)
- **Gráficos:** Recharts

## Project Conventions

### Code Style
- ESLint para linting
- Preferência por componentes funcionais com hooks
- Nomes de arquivos em kebab-case
- Componentes em PascalCase
- CSS via Tailwind utility classes (não CSS modules)

### Architecture Patterns
- **App Router:** Rotas em `app/` com layouts aninhados
- **Server Components:** Preferidos quando possível
- **Route Groups:** `(modules)`, `(landing)`, `[tenant]`
- **Componentes:** `components/ui/` para primitivos, `components/{feature}/` para features
- **Hooks customizados:** `hooks/` para lógica reutilizável
- **Ações do servidor:** `app/actions/` para mutations

### Testing Strategy
- Jest para unit tests
- Fast-check para property-based testing
- Testes em `__tests__/` ou `.test.ts` co-locados

### Git Workflow
- Branch principal: `main`
- Feature branches para desenvolvimento
- Commits com Co-Authored-By para contribuições de IA

## Domain Context
- **Tenants:** Suporte multi-tenant (escolas diferentes)
- **Roles:** admin, professor, aluno
- **Turmas:** Classes/grupos de alunos
- **Cursos:** Programas educacionais
- **Agendamentos:** Sistema de horários e aulas

## Important Constraints
- Node.js >=20 <25
- Supabase como único backend (sem APIs externas custom)
- Mobile-first design approach (em implementação)

## External Dependencies
- **Supabase:** Auth, Database, Storage, Realtime
- **Upstash Redis:** Caching e rate limiting
- **AWS S3:** Storage alternativo
- **Vercel AI SDK:** Integração com LLMs
