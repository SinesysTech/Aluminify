# Design: Interface de Gerenciamento de Turmas

## Context

### Background
A proposta `add-turmas-professor-disciplinas` implementou a estrutura de dados:
- Tabela `turmas` com RLS
- Tabela `alunos_turmas` com enum de status
- Helper functions para RLS

Falta a interface para administradores gerenciarem turmas e a configuracao para decidir se um curso usa turmas ou nao.

### Stakeholders
- **Administradores de empresa**: Criam cursos e decidem se usam turmas
- **Secretaria/Coordenacao**: Gerenciam matriculas e movimentam alunos entre turmas
- **Alunos**: Podem estar vinculados a uma turma especifica

### Constraints
- Turmas sao **opcionais** - nem toda empresa usa
- Um aluno pode estar em **multiplas turmas** (diferentes cursos)
- Um aluno pode estar em **apenas uma turma por curso** (constraint de negocio)
- Turmas pertencem a um **curso especifico**

## Goals / Non-Goals

### Goals
- Permitir que administradores configurem se um curso usa turmas
- Criar interface CRUD para gerenciar turmas
- Permitir vincular/desvincular alunos de turmas
- Filtrar alunos por turma na listagem geral
- Transferir alunos entre turmas do mesmo curso

### Non-Goals
- Matricula automatica em turma na compra (fase futura)
- Integracao com sistema de horarios/agenda
- Limite de vagas por turma (fase futura)
- Turmas sem vinculo a curso (turmas "avulsas")

## Decisions

### Decision 1: Coluna `usa_turmas` no curso
**O que**: Adicionar boolean `usa_turmas` na tabela `cursos`, default `false`.

**Por que**:
- Permite que cada curso decida independentemente
- Nao quebra cursos existentes (default false)
- Simples de implementar e entender

**Alternativas consideradas**:
- Flag na empresa: Rejeitado - algumas empresas podem ter cursos com e sem turmas
- Inferir pela existencia de turmas: Rejeitado - confuso para UX

### Decision 2: Turmas dentro da pagina do curso
**O que**: Gerenciar turmas na pagina de detalhes do curso (`/admin/cursos/[id]`), nao em pagina separada.

**Por que**:
- Turmas sao subordinadas ao curso
- Contexto mais claro para o usuario
- Menos navegacao

**Alternativas consideradas**:
- Pagina separada `/admin/turmas`: Rejeitado - turmas sem contexto de curso sao confusas
- Menu lateral com turmas: Rejeitado - adiciona complexidade de navegacao

### Decision 3: Service pattern para turmas
**O que**: Criar `backend/services/turma/` seguindo o padrao existente (repository + service + types).

**Por que**:
- Consistencia com outros services do projeto
- Separacao de responsabilidades
- Facilita testes e manutencao

### Decision 4: Soft delete de turmas
**O que**: Usar `ativo = false` ao invés de deletar registro.

**Por que**:
- Preserva historico de alunos que estiveram na turma
- Permite reativar turma se necessario
- Consistente com outras entidades do sistema

### Decision 5: Filtro de turmas carrega dinamicamente
**O que**: O select de turmas na tela de alunos carrega turmas via API, nao hardcoded.

**Por que**:
- Dados reais do tenant
- Atualiza automaticamente quando turmas sao criadas/removidas
- Isolamento multi-tenant garantido pela API

## Risks / Trade-offs

### Risk 1: Performance do filtro de turmas
**Risco**: Carregar turmas de todos os cursos pode ser lento para empresas com muitos cursos.
**Mitigacao**:
- Limitar turmas ativas apenas
- Considerar filtro em cascata (selecionar curso primeiro)
- Cache no frontend

### Risk 2: UX de configuracao de turmas
**Risco**: Usuario pode habilitar turmas sem entender as implicacoes.
**Mitigacao**:
- Tooltip explicativo no switch
- Confirmacao ao habilitar em curso com alunos matriculados
- Documentacao clara

### Risk 3: Aluno em curso com turmas mas sem turma atribuida
**Risco**: Aluno matriculado no curso mas nao vinculado a nenhuma turma.
**Mitigacao**:
- Mostrar alunos "sem turma" na interface
- Permitir filtrar por "sem turma atribuida"
- Nao bloquear - turma e opcional mesmo quando habilitada

## Data Model

### Coluna nova em `cursos`
```sql
ALTER TABLE cursos ADD COLUMN usa_turmas boolean NOT NULL DEFAULT false;
```

### Estrutura existente (referencia)
```
cursos (id, nome, ..., usa_turmas)
   |
   +-- turmas (id, curso_id, nome, data_inicio, data_fim, ativo)
          |
          +-- alunos_turmas (aluno_id, turma_id, status, data_entrada, data_saida)
```

## API Design

### Turmas CRUD
```
GET    /api/turma                    -> Lista turmas da empresa
GET    /api/turma?cursoId=xxx        -> Lista turmas de um curso
POST   /api/turma                    -> Cria turma
GET    /api/turma/[id]               -> Detalhes da turma
PUT    /api/turma/[id]               -> Atualiza turma
DELETE /api/turma/[id]               -> Desativa turma (soft delete)
```

### Alunos da Turma
```
GET    /api/turma/[id]/alunos        -> Lista alunos da turma
POST   /api/turma/[id]/alunos        -> Vincula aluno(s) a turma
DELETE /api/turma/[id]/alunos/[alunoId] -> Desvincula aluno
```

### Filtro de Alunos (atualizar existente)
```
GET /api/student?turmaId=xxx         -> Filtra alunos por turma
```

## UI Components

### TurmasList
- Lista turmas do curso em cards ou tabela
- Mostra nome, datas, quantidade de alunos, status
- Acoes: editar, desativar, ver alunos

### TurmaDialog
- Form para criar/editar turma
- Campos: nome, data inicio, data fim, acesso apos termino, dias extras
- Validacao de datas

### TurmaAlunosDialog
- Lista alunos da turma
- Permite adicionar/remover alunos
- Mostra status (ativo, concluido, cancelado, trancado)

## Migration Plan

1. Deploy migration de banco (adicionar `usa_turmas`)
2. Deploy backend (APIs de turma)
3. Deploy frontend (interface)
4. Cursos existentes mantem `usa_turmas = false` (sem impacto)
5. Novos cursos podem optar por habilitar

## Rollback
- Remover flag do frontend (feature toggle)
- APIs continuam funcionando mas nao sao chamadas
- Dados em `usa_turmas` podem ficar no banco sem impacto

## Open Questions

1. **Limite de vagas por turma?** - Decidido: Nao nesta fase, pode ser adicionado depois
2. **Turma padrao automatica?** - Decidido: Nao, admin escolhe manualmente
3. **Notificacao ao aluno sobre turma?** - Decidido: Fora do escopo desta proposta
