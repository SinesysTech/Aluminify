# Capability: Courses (Delta)

Alteracoes na capability de cursos para suportar configuracao de turmas.

## ADDED Requirements

### Requirement: Course Turmas Toggle
O sistema DEVE permitir configurar se um curso utiliza o sistema de turmas.

#### Scenario: Criar curso com turmas desabilitadas (padrao)
- **GIVEN** administrador criando novo curso
- **WHEN** nao altera a opcao "Habilitar Turmas"
- **THEN** curso e criado com `usa_turmas = false`
- **AND** alunos sao matriculados diretamente no curso

#### Scenario: Criar curso com turmas habilitadas
- **GIVEN** administrador criando novo curso
- **WHEN** marca "Habilitar Turmas" como ativo
- **THEN** curso e criado com `usa_turmas = true`
- **AND** secao de turmas fica disponivel na pagina do curso

#### Scenario: Exibir secao de turmas condicionalmente
- **GIVEN** curso com `usa_turmas = true`
- **WHEN** administrador acessa pagina de detalhes do curso
- **THEN** secao "Turmas" e exibida
- **AND** permite criar e gerenciar turmas

#### Scenario: Ocultar secao de turmas quando desabilitado
- **GIVEN** curso com `usa_turmas = false`
- **WHEN** administrador acessa pagina de detalhes do curso
- **THEN** secao "Turmas" NAO e exibida
- **AND** alunos sao listados diretamente sem agrupamento por turma
