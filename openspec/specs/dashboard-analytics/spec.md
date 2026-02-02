# Dashboard Analytics Specification

### Requirement: Dominio estrategico separado por modalidade
O sistema SHALL retornar, no payload do dashboard do aluno, metricas de **Dominio Estrategico** separadas por modalidade:

- **Flashcards (memoria)**: derivado de `progresso_flashcards.ultimo_feedback`
- **Questoes (aplicacao)**: derivado de `progresso_atividades.questoes_acertos/questoes_totais`

As metricas SHALL ser expostas para os eixos:
- **Modulos de Base** (`modulos.importancia = 'Base'`)
- **Alta Recorrencia** (`modulos.importancia = 'Alta'`)

#### Scenario: Aluno com dados de flashcards e questoes
- **WHEN** o aluno possui registros em `progresso_flashcards` e `progresso_atividades` para modulos do eixo
- **THEN** o payload contem `flashcardsScore` e `questionsScore` como percentuais 0-100

#### Scenario: Aluno sem dados em uma das modalidades
- **WHEN** o aluno nao possui registros em uma modalidade para modulos do eixo
- **THEN** o score daquela modalidade e `null` (sem evidencia), e a outra modalidade permanece calculada

### Requirement: Recomendacoes acionaveis no dominio estrategico
O sistema SHALL retornar recomendacoes de estudo baseadas nos modulos com pior desempenho/recall dentro dos eixos estrategicos.

Cada recomendacao SHALL incluir:
- Identificacao do modulo (`moduloId`, `moduloNome`)
- Importancia do modulo (`importancia`)
- Scores por modalidade (`flashcardsScore`, `questionsScore`)
- Um motivo curto (`reason`)

#### Scenario: Recomendacoes priorizam piores modulos com evidencia
- **WHEN** existem modulos com evidencia (flashcards e/ou questoes)
- **THEN** o sistema retorna uma lista ordenada pelos piores modulos primeiro
