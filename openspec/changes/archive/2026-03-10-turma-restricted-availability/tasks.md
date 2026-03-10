## 1. Database

- [x] 1.1 Criar migration com tabela `agendamento_recorrencia_turmas` (colunas: `id uuid PK`, `recorrencia_id uuid FK → agendamento_recorrencia(id) ON DELETE CASCADE`, `turma_id uuid FK → turmas(id) ON DELETE CASCADE`, `empresa_id uuid FK → empresas(id)`, `created_at timestamptz`; constraint UNIQUE(recorrencia_id, turma_id))
- [x] 1.2 Criar índices: `idx_recorrencia_turmas_recorrencia_id`, `idx_recorrencia_turmas_turma_id`, `idx_recorrencia_turmas_empresa_id`
- [x] 1.3 Criar RLS policies na `agendamento_recorrencia_turmas`: SELECT/INSERT/UPDATE/DELETE filtrado por `empresa_id` do usuário autenticado
- [x] 1.4 Regenerar tipos TypeScript (`supabase gen types typescript`) para incluir a nova tabela em `database.types.ts`

## 2. Backend — Server Actions de Disponibilidade

- [x] 2.1 Criar função helper `getRecorrenciaTurmas(recorrenciaIds: string[])` que retorna mapa `Record<string, string[]>` de recorrencia_id → turma_ids vinculadas
- [x] 2.2 Criar função helper `getAlunoTurmaIds(alunoId: string, empresaId: string)` que retorna `string[]` de turma_ids onde o aluno está matriculado (status ativo, turma ativa)
- [x] 2.3 Criar função helper `filterRecorrenciasByTurma(recorrencias, recorrenciaTurmasMap, alunoTurmaIds)` que filtra regras: sem turmas → inclui; com turmas → inclui se intersecção com alunoTurmaIds
- [x] 2.4 Atualizar `getAvailableSlots()` em `availability-actions.ts`: adicionar parâmetro opcional `alunoId?: string`; quando fornecido, aplicar filtro de turma nas recorrências antes de gerar slots
- [x] 2.5 Atualizar `getProfessoresDisponiveis()` em `professor-selection-actions.ts`: receber `alunoId?: string`; filtrar recorrências de cada professor por turma do aluno
- [x] 2.6 Atualizar `getAvailabilityForMonth()` em `availability-actions.ts`: receber `alunoId?: string`; considerar filtro de turma nos indicadores de disponibilidade do calendário

## 3. Backend — Validação de Agendamento

- [x] 3.1 Atualizar `validateAgendamento()` em `validation-actions.ts`: após encontrar a regra de recorrência que cobre o horário, verificar se tem turmas vinculadas; se sim, verificar matrícula do aluno; rejeitar com "O professor não tem disponibilidade neste horário." se não tiver acesso

## 4. Backend — CRUD de Recorrência

- [x] 4.1 Atualizar `createRecorrencia()` em `recurrence-actions.ts`: aceitar parâmetro opcional `turmaIds?: string[]`; após criar a recorrência, inserir registros em `agendamento_recorrencia_turmas`
- [x] 4.2 Atualizar `updateRecorrencia()` em `recurrence-actions.ts`: aceitar parâmetro opcional `turmaIds?: string[]`; fazer upsert (deletar existentes + inserir novos) em `agendamento_recorrencia_turmas`
- [x] 4.3 Atualizar `getRecorrencias()` em `recurrence-actions.ts`: retornar turmas vinculadas a cada recorrência no response (join com `agendamento_recorrencia_turmas` + `turmas.nome`)

## 5. Frontend — RecorrenciaManager

- [x] 5.1 Adicionar fetch de turmas ativas do tenant via `TurmaService.listByEmpresa()` no `RecorrenciaManager`
- [x] 5.2 Adicionar campo multi-select "Restringir para turmas (opcional)" no formulário de criação/edição de recorrência
- [x] 5.3 Exibir badge com quantidade de turmas vinculadas nas regras listadas (ex: "2 turmas")
- [x] 5.4 Passar `turmaIds` selecionadas para `createRecorrencia()` e `updateRecorrencia()`

## 6. Frontend — Páginas do Aluno

- [x] 6.1 Atualizar page `/[tenant]/agendamentos/page.tsx`: obter `alunoId` do usuário autenticado e passar para `getProfessoresDisponiveis()`
- [x] 6.2 Atualizar page `/[tenant]/agendamentos/[professorId]/page.tsx`: passar `alunoId` para `getAvailableSlots()` e `getAvailabilityForMonth()`

## 7. Testes

- [x] 7.1 Teste unitário: `filterRecorrenciasByTurma` — regra sem turma retorna para todos; regra com turma retorna apenas para aluno matriculado; regra com múltiplas turmas usa OR
- [x] 7.2 Teste de integração: fluxo completo — professor cria recorrência com turma, aluno da turma vê slot, aluno de outra turma não vê
- [x] 7.3 Teste de validação: aluno tenta agendar slot de regra restrita sem estar na turma → rejeição
