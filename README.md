# Aluminify

Plataforma educacional white-label open-source focada na experiência do aluno.

## Stack Tecnológica

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Estilização:** Tailwind CSS v4, shadcn/ui
- **Backend:** Supabase (Auth, Database, Storage, Realtime)
- **Estado:** TanStack Query
- **Animações:** Motion

## Estrutura do Projeto

A arquitetura segue o padrão de **Módulos Funcionais** dentro de Route Groups.

```
app/
├── [tenant]/               # Contexto do Cliente (Multi-tenant)
│   ├── (modules)/          # Módulos Funcionais (Layout Protegido)
│   │   ├── agendamentos/   # Mentorias e reuniões
│   │   ├── biblioteca/     # Materiais de apoio
│   │   ├── cronograma/     # Plano de estudos inteligente
│   │   ├── curso/          # Core acadêmico (Aulas, Módulos, Disciplinas)
│   │   ├── dashboard/      # Home e Analytics
│   │   ├── empresa/        # Configurações do Tenant
│   │   ├── financeiro/     # Vendas e Transações
│   │   ├── flashcards/     # Revisão espaçada
│   │   ├── foco/           # Ferramenta Pomodoro
│   │   ├── sala-de-estudos/# Player e execução de atividades
│   │   ├── superadmin/     # Gestão multi-tenant
│   │   └── usuario/        # Gestão de Pessoas (Alunos, Profs, Staff)
│   └── auth/               # Autenticação (Login, Recuperação)
```

## Padrões de Desenvolvimento

### Organização Interna de Módulos
Cada módulo em `(modules)` deve seguir rigorosamente esta estrutura:

- `(aluno)/`: Rotas e páginas visíveis para o aluno.
- `(gestao)/`: Rotas administrativas (Professores/Admins).
- `components/`: Componentes visuais isolados do módulo.
- `services/`: Lógica de negócio e acesso a dados.
- `types/`: Definições de tipos.
- `README.md`: Documentação conceitual do módulo.

### Regras Críticas
1. **Não criar pastas `admin`, `aluno` ou `professor` na raiz de `(modules)`.** Use subpastas `(gestao)` ou `(aluno)` dentro dos módulos específicos.
2. **Componentes:** Use `server components` por padrão. Adicione `'use client'` apenas quando interatividade for necessária.
3. **Estilos:** Use classes utilitárias do Tailwind. Evite CSS modules.

## Documentação

- **Arquitetura:** `docs/architecture/`
- **Guias:** `docs/guides/`
- **Módulos:** Consulte o `README.md` dentro da pasta de cada módulo.

## Instalação

1. Clone o repositório.
2. Instale dependências: `npm install`
3. Configure variáveis de ambiente (ver `docs/guides/configuration.md`).
4. Rode o servidor: `npm run dev`