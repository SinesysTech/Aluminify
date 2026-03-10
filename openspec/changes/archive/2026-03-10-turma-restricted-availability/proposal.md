## Why

Professores que atuam em múltiplas turmas precisam restringir a visibilidade de suas disponibilidades de plantão para turmas específicas. Sem esse filtro, todas as turmas do tenant veem todos os horários do professor, gerando demanda excessiva e impossibilitando o direcionamento de atendimento. Caso real: a professora Jana Rabelo (dona do tenant) atende várias turmas, mas quer oferecer plantões exclusivos para determinada turma sem que as demais vejam e disputem os mesmos horários.

## What Changes

- Adicionar relação many-to-many entre `agendamento_recorrencia` e `turmas` via tabela associativa `agendamento_recorrencia_turmas`
- Quando uma regra de recorrência tiver turmas vinculadas, apenas alunos matriculados nessas turmas poderão ver e agendar os slots gerados por essa regra
- Quando nenhuma turma for vinculada (campo vazio), o comportamento atual é mantido: todos os alunos do tenant veem a disponibilidade (retrocompatível)
- Atualizar a UI de configuração de disponibilidade (`RecorrenciaManager`) para permitir seleção opcional de turmas
- Atualizar a geração de slots disponíveis para filtrar regras com restrição de turma com base na matrícula do aluno
- Atualizar a listagem de professores disponíveis (`ProfessorSelector`) para considerar o filtro de turma ao calcular próximos slots

## Capabilities

### New Capabilities

_Nenhuma — a funcionalidade é uma extensão do sistema de agendamento existente._

### Modified Capabilities

- `scheduling`: Adicionar suporte a restrição de visibilidade de regras de recorrência por turma, afetando geração de slots, listagem de professores e validação de agendamentos

## Impact

- **Database**: Nova tabela `agendamento_recorrencia_turmas` (migration) + RLS policies para isolamento por tenant
- **API/Server Actions**: `getAvailableSlots`, `getProfessoresDisponiveis`, `getAvailabilityForMonth` precisam receber contexto do aluno e filtrar por turma
- **Validação**: `validateAgendamento` deve verificar se o aluno tem acesso à regra de recorrência (turma vinculada)
- **UI**: `RecorrenciaManager` ganha seletor de turmas; nenhuma mudança na UI do aluno (filtro é transparente)
- **Retrocompatibilidade**: Regras sem turmas vinculadas continuam funcionando exatamente como hoje — zero breaking changes
