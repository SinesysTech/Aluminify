# Capability: Turmas Management

Gerenciamento de turmas dentro de cursos, permitindo organizar alunos em grupos distintos.

## ADDED Requirements

### Requirement: Course Turmas Configuration
O sistema DEVE permitir que administradores configurem se um curso utiliza turmas.

#### Scenario: Habilitar turmas em curso novo
- **GIVEN** administrador esta criando um novo curso
- **WHEN** marca a opcao "Habilitar Turmas"
- **THEN** o curso e criado com `usa_turmas = true`
- **AND** a secao de gerenciamento de turmas fica disponivel

#### Scenario: Habilitar turmas em curso existente
- **GIVEN** curso existente com `usa_turmas = false`
- **WHEN** administrador edita o curso e habilita turmas
- **THEN** o curso e atualizado com `usa_turmas = true`
- **AND** alunos existentes permanecem matriculados no curso sem turma atribuida

#### Scenario: Desabilitar turmas em curso
- **GIVEN** curso com `usa_turmas = true` e turmas cadastradas
- **WHEN** administrador tenta desabilitar turmas
- **THEN** sistema exibe aviso sobre turmas existentes
- **AND** permite desabilitar mantendo dados historicos

### Requirement: Turma CRUD Operations
O sistema DEVE permitir operacoes CRUD completas para turmas.

#### Scenario: Criar turma
- **GIVEN** administrador na pagina de detalhes de um curso com turmas habilitadas
- **WHEN** clica em "Nova Turma" e preenche nome e datas
- **THEN** turma e criada vinculada ao curso
- **AND** aparece na lista de turmas do curso

#### Scenario: Editar turma
- **GIVEN** turma existente
- **WHEN** administrador edita nome ou datas
- **THEN** turma e atualizada
- **AND** vinculos com alunos sao mantidos

#### Scenario: Desativar turma
- **GIVEN** turma ativa com ou sem alunos
- **WHEN** administrador clica em desativar
- **THEN** turma e marcada como `ativo = false`
- **AND** turma nao aparece mais para novas matriculas
- **AND** dados historicos sao preservados

#### Scenario: Listar turmas do curso
- **GIVEN** curso com turmas habilitadas
- **WHEN** administrador acessa detalhes do curso
- **THEN** lista de turmas e exibida
- **AND** mostra nome, datas, quantidade de alunos e status de cada turma

### Requirement: Student-Turma Association
O sistema DEVE permitir vincular e desvincular alunos de turmas.

#### Scenario: Vincular aluno a turma
- **GIVEN** aluno matriculado em curso com turmas
- **WHEN** administrador seleciona turma para o aluno
- **THEN** registro em `alunos_turmas` e criado com status "ativo"
- **AND** aluno aparece na lista de alunos da turma

#### Scenario: Desvincular aluno de turma
- **GIVEN** aluno vinculado a uma turma
- **WHEN** administrador remove aluno da turma
- **THEN** status do vinculo e atualizado (concluido/cancelado/trancado)
- **AND** aluno permanece matriculado no curso

#### Scenario: Transferir aluno entre turmas
- **GIVEN** aluno vinculado a turma A do curso X
- **WHEN** administrador transfere para turma B do mesmo curso
- **THEN** vinculo com turma A e encerrado (status definido pelo admin)
- **AND** novo vinculo com turma B e criado com status "ativo"

### Requirement: Student Filter by Turma
O sistema DEVE permitir filtrar alunos por turma na listagem geral.

#### Scenario: Filtrar por turma especifica
- **GIVEN** administrador na tela de listagem de alunos
- **WHEN** seleciona uma turma no filtro
- **THEN** apenas alunos daquela turma sao exibidos

#### Scenario: Filtrar alunos sem turma
- **GIVEN** curso com turmas habilitadas
- **WHEN** administrador filtra por "Sem turma atribuida"
- **THEN** exibe alunos matriculados no curso mas nao vinculados a nenhuma turma

#### Scenario: Carregar opcoes de turma dinamicamente
- **GIVEN** administrador na tela de alunos
- **WHEN** abre o filtro de turmas
- **THEN** opcoes sao carregadas da API (nao hardcoded)
- **AND** apenas turmas da empresa do usuario sao exibidas

### Requirement: Multi-tenant Turma Isolation
O sistema DEVE garantir isolamento de dados de turmas entre tenants.

#### Scenario: Turmas isoladas por empresa
- **GIVEN** empresa A com turma "Manha"
- **AND** empresa B com turma "Manha"
- **WHEN** admin da empresa A lista turmas
- **THEN** ve apenas turma "Manha" da empresa A
- **AND** nao ve turma da empresa B

#### Scenario: API rejeita acesso cross-tenant
- **GIVEN** usuario da empresa A
- **WHEN** tenta acessar turma da empresa B via API
- **THEN** RLS bloqueia acesso
- **AND** retorna lista vazia ou erro 404

### Requirement: Turma Access Configuration
O sistema DEVE permitir configurar acesso de alunos apos termino da turma.

#### Scenario: Configurar acesso apos termino
- **GIVEN** administrador criando/editando turma
- **WHEN** define "Permitir acesso apos termino" como true
- **AND** define "Dias de acesso extra" como 30
- **THEN** turma e salva com essas configuracoes
- **AND** alunos mantem acesso por 30 dias apos data_fim

#### Scenario: Acesso padrao sem configuracao
- **GIVEN** turma sem configuracao explicita de acesso extra
- **WHEN** data_fim da turma e atingida
- **THEN** acesso do aluno segue regra padrao do curso/empresa
