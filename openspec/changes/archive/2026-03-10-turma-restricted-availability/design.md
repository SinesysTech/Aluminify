## Context

Hoje, regras de recorrência (`agendamento_recorrencia`) são visíveis para todos os alunos do tenant. Um professor que atende múltiplas turmas não consegue direcionar plantões para turmas específicas. Caso real: Jana Rabelo (professora e dona do tenant) precisa oferecer plantões exclusivos para uma turma sem que as demais disputem os mesmos horários.

**Estado atual:**
- `agendamento_recorrencia` não possui vínculo com turmas
- `getProfessoresDisponiveis()` retorna todos os professores com disponibilidade para qualquer aluno do tenant
- `getAvailableSlots()` e `validateAgendamento()` não consideram turmas
- `RecorrenciaManager` não oferece seleção de turmas
- `TurmaService` já existe com métodos `list()`, `listByEmpresa()`, `listByCurso()`
- `alunos_turmas` já vincula alunos a turmas com status de matrícula

## Goals / Non-Goals

**Goals:**
- Permitir que professores restrinjam regras de recorrência a turmas específicas (uma ou mais)
- Filtrar slots disponíveis com base na matrícula do aluno nas turmas vinculadas
- Manter retrocompatibilidade total: regras sem turmas = visíveis para todos (comportamento atual)

**Non-Goals:**
- Restrição por aluno individual (fora do escopo — usar turmas como unidade de filtro)
- Restrição por curso (cursos são mais amplos; turmas são a granularidade correta)
- Notificações específicas de turma sobre novos horários disponíveis
- UI diferenciada para o aluno (o filtro é transparente — ele simplesmente não vê slots que não são para ele)

## Decisions

### 1. Tabela associativa many-to-many (vs. coluna `turma_ids` na recorrência)

**Decisão:** Criar tabela `agendamento_recorrencia_turmas` com `recorrencia_id` + `turma_id`.

**Alternativa descartada — array de IDs:** Coluna `turma_ids uuid[]` na `agendamento_recorrencia` seria mais simples, mas impede joins eficientes, RLS granular e integridade referencial via foreign keys.

**Rationale:** O modelo relacional permite:
- Foreign keys para integridade referencial (cascade on delete)
- Queries com JOIN eficientes para filtrar por turma
- RLS policy simples baseada em `empresa_id`
- Facilidade para adicionar metadados futuros na relação

### 2. Semântica: sem turmas = acesso universal

**Decisão:** Se uma regra de recorrência não tiver nenhuma entrada em `agendamento_recorrencia_turmas`, ela permanece visível para todos os alunos do tenant.

**Rationale:** Retrocompatibilidade zero-effort. Nenhuma migration de dados necessária para regras existentes. O professor opta pelo filtro quando desejar.

### 3. Filtro no lado do servidor (server actions), não no cliente

**Decisão:** A filtragem por turma acontece nas server actions `getAvailableSlots()`, `getProfessoresDisponiveis()` e `getAvailabilityForMonth()`, antes de retornar dados ao cliente.

**Alternativa descartada — filtro no cliente:** Exporia slots restritos na response e dependeria do frontend para ocultar. Inseguro e inconsistente.

**Rationale:** Segurança by design. O aluno nunca recebe dados de slots que não deveria ver.

### 4. Parâmetro `alunoId` nas funções de disponibilidade

**Decisão:** As funções `getAvailableSlots()`, `getProfessoresDisponiveis()` e `getAvailabilityForMonth()` passam a receber um parâmetro opcional `alunoId?: string`. Quando fornecido, filtra regras com restrição de turma.

**Fluxo de filtragem:**
1. Buscar todas as recorrências do professor (como hoje)
2. Para cada recorrência, verificar se tem turmas vinculadas em `agendamento_recorrencia_turmas`
3. Se não tem turmas → incluir (acesso universal)
4. Se tem turmas → verificar se o aluno está matriculado em pelo menos uma delas via `alunos_turmas`
5. Só gerar slots das regras que passarem no filtro

**Para professores/admins visualizando disponibilidade:** `alunoId` é omitido, mostrando todas as regras.

### 5. Validação no agendamento

**Decisão:** Adicionar verificação de turma em `validateAgendamento()`. Quando um aluno tenta agendar, o sistema verifica se o slot pertence a uma regra restrita e se o aluno tem acesso.

**Fluxo:**
1. Identificar qual `agendamento_recorrencia` gerou o slot (via dia_semana + horário)
2. Verificar se essa regra tem turmas vinculadas
3. Se sim, verificar matrícula do aluno
4. Rejeitar com mensagem genérica: "O professor não tem disponibilidade neste horário." (sem revelar que existe restrição de turma)

### 6. UI: Seletor de turmas no RecorrenciaManager

**Decisão:** Adicionar um multi-select opcional de turmas no formulário de criação/edição de recorrência.

**Componente:** Usar `MultiSelect` ou `Combobox` (shadcn/ui) com listagem de turmas ativas do tenant.

**Comportamento:**
- Campo opcional — se vazio, comportamento padrão (todos veem)
- Label: "Restringir para turmas (opcional)"
- Hint: "Se selecionado, apenas alunos dessas turmas poderão ver e agendar estes horários"
- Listar apenas turmas ativas (`ativo = true`) do tenant via `TurmaService.listByEmpresa()`

## Risks / Trade-offs

**[Performance] Queries adicionais para filtrar turmas** → Mitigação: Fazer um único JOIN com `agendamento_recorrencia_turmas` e `alunos_turmas` em vez de N+1 queries. Indexar `recorrencia_id` e `turma_id`.

**[UX] Professor pode esquecer de vincular turma e ninguém vê os slots** → Mitigação: O padrão é sem turma (todos veem). Exibir indicador visual nas regras que têm restrição de turma (badge "X turmas").

**[Complexidade] Aluno matriculado em múltiplas turmas pode ver slots de regras diferentes** → Isso é o comportamento esperado. A filtragem usa OR: basta estar em uma das turmas vinculadas.

**[Edge case] Turma desativada após vinculação** → Mitigação: Ao filtrar, considerar apenas turmas ativas E com matrícula ativa. Se todas as turmas vinculadas forem desativadas, a regra efetivamente fica sem público (mas não se torna universal).

## Migration Plan

1. **Migration SQL:** Criar tabela `agendamento_recorrencia_turmas` com foreign keys, RLS policies e índices
2. **Deploy backend:** Atualizar server actions para aceitar `alunoId` e filtrar por turma — retrocompatível pois parâmetro é opcional
3. **Deploy frontend:** Atualizar `RecorrenciaManager` com seletor de turmas
4. **Rollback:** Dropar tabela `agendamento_recorrencia_turmas` — sistema volta ao comportamento anterior automaticamente (nenhuma regra terá restrição)

## Open Questions

_Nenhuma — o escopo está bem definido e a implementação é incremental sobre a arquitetura existente._
