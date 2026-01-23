# Capability: Students (Delta)

Alteracoes na capability de alunos para suportar filtragem por turmas.

## ADDED Requirements

### Requirement: Student Turma Filter
O sistema DEVE permitir filtrar alunos por turma na listagem geral.

#### Scenario: Exibir filtro de turmas dinamico
- **GIVEN** administrador na tela de listagem de alunos
- **WHEN** clica no dropdown de filtro "Turma"
- **THEN** opcoes sao carregadas via API
- **AND** exibe apenas turmas da empresa do usuario
- **AND** NAO exibe dados hardcoded

#### Scenario: Aplicar filtro de turma
- **GIVEN** filtro de turma selecionado
- **WHEN** administrador seleciona turma especifica
- **THEN** lista de alunos e filtrada para mostrar apenas alunos daquela turma
- **AND** paginacao e atualizada

#### Scenario: Limpar filtro de turma
- **GIVEN** filtro de turma aplicado
- **WHEN** administrador seleciona "Todas as turmas"
- **THEN** lista de alunos volta a mostrar todos os alunos

## MODIFIED Requirements

### Requirement: Student Creation Form
O formulario de criacao de aluno DEVE usar labels claros e permitir selecao de turma.

#### Scenario: Label de curso corrigido
- **GIVEN** administrador no formulario de criacao de aluno
- **WHEN** ve o campo de selecao de curso
- **THEN** label exibe "Curso" (NAO "Turma / Cohort")

#### Scenario: Selecao de turma condicional
- **GIVEN** administrador selecionou curso com `usa_turmas = true`
- **WHEN** curso e selecionado
- **THEN** campo adicional "Turma" aparece
- **AND** permite selecionar turma do curso

#### Scenario: Sem selecao de turma para curso sem turmas
- **GIVEN** administrador selecionou curso com `usa_turmas = false`
- **WHEN** curso e selecionado
- **THEN** campo "Turma" NAO aparece
- **AND** aluno sera matriculado diretamente no curso

## REMOVED Requirements

### Requirement: Hardcoded Turma Options
**Reason**: Opcoes de turma hardcoded ("Extensivo 2024", "Intensivo Med") devem ser removidas pois nao representam dados reais.
**Migration**: Substituir por carregamento dinamico via API.
