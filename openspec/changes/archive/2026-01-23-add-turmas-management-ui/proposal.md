# Change: Implementar Interface de Gerenciamento de Turmas

## Why

A estrutura de dados para turmas foi implementada (proposta `add-turmas-professor-disciplinas`), mas a interface de gerenciamento ainda nao existe. Atualmente:

1. **Nao ha CRUD de turmas** - Administradores nao conseguem criar, editar ou deletar turmas
2. **Nao ha configuracao por curso** - Cursos nao podem optar por usar ou nao turmas
3. **Filtros hardcoded** - A tela de alunos mostra turmas ficticias ("Extensivo 2024", "Intensivo Med")
4. **Labels confusos** - O formulario de criacao de aluno diz "Turma/Cohort" mas seleciona cursos

Turmas sao **opcionais** por design - algumas empresas matriculam alunos diretamente no curso, outras dividem em turmas (manha, tarde, turno A/B).

## What Changes

### Backend (API)
- Criar endpoints CRUD para turmas (`/api/turma`)
- Criar endpoint para listar turmas por curso (`/api/course/[id]/turmas` - ja existe, revisar)
- Criar endpoint para listar turmas da empresa (`/api/turma`)

### Banco de Dados
- **Adicionar coluna `usa_turmas` na tabela `cursos`** - boolean, default false

### Frontend - Curso
- Adicionar switch "Habilitar Turmas" no formulario de curso
- Quando habilitado, mostrar secao de gerenciamento de turmas na pagina de detalhes do curso

### Frontend - Turmas
- Criar pagina de listagem de turmas do curso (`/curso/(gestao)/admin/[id]/turmas`)
- Criar dialog para criar/editar turma
- Permitir vincular alunos a turmas

### Frontend - Alunos
- Remover dados hardcoded do filtro de turmas
- Conectar filtro ao backend (carregar turmas reais)
- Ajustar label "Turma/Cohort" para clarificar contexto

### Frontend - Detalhes do Curso
- Exibir tab ou secao de turmas quando `usa_turmas = true`
- Permitir criar turmas a partir da pagina do curso

## Impact

- Affected specs: Nenhum spec existente (nova capability)
- Affected code:
  - `components/curso/curso-table.tsx` - Adicionar campo usa_turmas no form
  - `app/(modules)/curso/(gestao)/admin/[id]/page.tsx` - Adicionar secao de turmas
  - `app/(modules)/usuario/(gestao)/alunos/components/student-filters.tsx` - Conectar ao backend
  - `app/(modules)/usuario/(gestao)/alunos/components/student-sheet.tsx` - Ajustar labels
  - `app/api/turma/route.ts` - Novo endpoint CRUD
  - `backend/services/turma/` - Novo service
- **BREAKING**: Nenhuma mudanca breaking - todas alteracoes sao aditivas
