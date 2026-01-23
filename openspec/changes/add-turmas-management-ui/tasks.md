# Tasks: Implementar Interface de Gerenciamento de Turmas

## 1. Schema de Banco de Dados

### 1.1 Adicionar coluna usa_turmas
- [ ] 1.1.1 Criar migration para adicionar coluna `usa_turmas` (boolean, default false) na tabela `cursos`
- [ ] 1.1.2 Atualizar TypeScript types (`lib/database.types.ts`)

## 2. Backend - Service de Turmas

### 2.1 Criar Turma Service
- [ ] 2.1.1 Criar `backend/services/turma/turma.repository.ts`
- [ ] 2.1.2 Criar `backend/services/turma/turma.service.ts`
- [ ] 2.1.3 Criar `backend/services/turma/turma.types.ts`
- [ ] 2.1.4 Criar `backend/services/turma/index.ts` (barrel export)

### 2.2 Implementar metodos do repository
- [ ] 2.2.1 `listByEmpresa()` - Listar turmas da empresa do usuario
- [ ] 2.2.2 `listByCurso(cursoId)` - Listar turmas de um curso especifico
- [ ] 2.2.3 `getById(id)` - Buscar turma por ID
- [ ] 2.2.4 `create(data)` - Criar nova turma
- [ ] 2.2.5 `update(id, data)` - Atualizar turma
- [ ] 2.2.6 `delete(id)` - Deletar turma (soft delete via `ativo = false`)
- [ ] 2.2.7 `getAlunosDaTurma(turmaId)` - Listar alunos de uma turma
- [ ] 2.2.8 `vincularAluno(turmaId, alunoId)` - Vincular aluno a turma
- [ ] 2.2.9 `desvincularAluno(turmaId, alunoId)` - Desvincular aluno de turma

## 3. Backend - API Endpoints

### 3.1 CRUD de Turmas
- [ ] 3.1.1 Criar `app/api/turma/route.ts` - GET (listar), POST (criar)
- [ ] 3.1.2 Criar `app/api/turma/[id]/route.ts` - GET, PUT, DELETE
- [ ] 3.1.3 Criar `app/api/turma/[id]/alunos/route.ts` - GET (listar alunos), POST (vincular), DELETE (desvincular)

### 3.2 Atualizar Course API
- [ ] 3.2.1 Atualizar `app/api/course/route.ts` POST para aceitar `usaTurmas`
- [ ] 3.2.2 Atualizar `app/api/course/[id]/route.ts` PUT para aceitar `usaTurmas`
- [ ] 3.2.3 Verificar/atualizar `app/api/course/[id]/turmas/route.ts`

## 4. Frontend - Formulario de Curso

### 4.1 Adicionar campo usa_turmas
- [ ] 4.1.1 Atualizar tipo `Curso` em `components/curso/curso-table.tsx`
- [ ] 4.1.2 Adicionar `usaTurmas` ao schema Zod
- [ ] 4.1.3 Adicionar Switch "Habilitar Turmas" no formulario de criacao
- [ ] 4.1.4 Adicionar Switch "Habilitar Turmas" no formulario de edicao
- [ ] 4.1.5 Atualizar `handleCreate` e `handleUpdate` para enviar `usaTurmas`

## 5. Frontend - Pagina de Detalhes do Curso

### 5.1 Adicionar secao de turmas
- [ ] 5.1.1 Criar componente `TurmasList` para listar turmas do curso
- [ ] 5.1.2 Criar componente `TurmaDialog` para criar/editar turma
- [ ] 5.1.3 Adicionar condicional para mostrar secao apenas se `usaTurmas = true`
- [ ] 5.1.4 Adicionar contador de alunos por turma
- [ ] 5.1.5 Permitir criar turma diretamente da pagina do curso

### 5.2 Integrar com transferencia
- [ ] 5.2.1 Atualizar `TransferStudentsDialog` para mostrar opcao de turmas quando disponivel
- [ ] 5.2.2 Passar `currentTurmaId` quando visualizando alunos de uma turma

## 6. Frontend - Tela de Alunos

### 6.1 Corrigir filtro de turmas
- [ ] 6.1.1 Remover opcoes hardcoded ("Extensivo 2024", "Intensivo Med")
- [ ] 6.1.2 Criar hook `useTurmas()` para carregar turmas da empresa
- [ ] 6.1.3 Conectar select de turmas ao hook
- [ ] 6.1.4 Implementar filtragem por turma na API de alunos

### 6.2 Corrigir formulario de criacao de aluno
- [ ] 6.2.1 Ajustar label "Turma / Cohort" para "Curso"
- [ ] 6.2.2 Adicionar select de turma quando curso selecionado tem `usaTurmas = true`
- [ ] 6.2.3 Vincular aluno a turma na criacao (se aplicavel)

## 7. Frontend - Pagina de Turmas (Opcional)

### 7.1 Criar pagina dedicada
- [ ] 7.1.1 Criar `app/(dashboard)/admin/cursos/[id]/turmas/page.tsx`
- [ ] 7.1.2 Listar todas as turmas do curso com detalhes
- [ ] 7.1.3 Permitir gerenciar alunos por turma

## 8. Testes e Validacao

### 8.1 Testes manuais
- [ ] 8.1.1 Testar criacao de curso com turmas habilitadas
- [ ] 8.1.2 Testar criacao de turma dentro de um curso
- [ ] 8.1.3 Testar vinculacao de alunos a turmas
- [ ] 8.1.4 Testar filtro de alunos por turma
- [ ] 8.1.5 Testar transferencia entre turmas

### 8.2 Verificar isolamento multi-tenant
- [ ] 8.2.1 Verificar que turmas de outra empresa nao aparecem
- [ ] 8.2.2 Verificar RLS policies em todas as operacoes

## 9. Cleanup

### 9.1 Remover codigo legado
- [ ] 9.1.1 Remover qualquer referencia a dados hardcoded de turmas
- [ ] 9.1.2 Remover TODO comments relacionados a turmas
