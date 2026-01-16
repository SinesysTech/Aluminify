# Fix Nullable Constraints - Requirements

## 1. Problem Statement

O schema do banco de dados permite valores `NULL` em campos que deveriam ser obrigatórios, causando:
- Type errors no TypeScript (null não é assignable a string/number/boolean)
- Necessidade de workarounds com null coalescing (`??`) no código
- Dados inconsistentes no banco
- Lógica de negócio frágil

## 2. Current State

### Tabela `atividades`
```sql
modulo_id UUID REFERENCES modulos(id) -- Pode ser NULL
obrigatorio BOOLEAN DEFAULT TRUE      -- Pode ser NULL
ordem_exibicao INTEGER DEFAULT 0      -- Pode ser NULL
created_at TIMESTAMP DEFAULT NOW()    -- Pode ser NULL
updated_at TIMESTAMP DEFAULT NOW()    -- Pode ser NULL
```

### Tabela `flashcards`
```sql
modulo_id UUID REFERENCES modulos(id) -- Pode ser NULL
created_at TIMESTAMP DEFAULT NOW()    -- Pode ser NULL
```

### Tabela `cronogramas`
```sql
nome TEXT                             -- Pode ser NULL
```

### Tabela `professores`
```sql
empresa_id UUID REFERENCES empresas(id) -- Pode ser NULL
```

## 3. Business Rules

### 3.1 Atividades
- **AC 3.1.1**: Toda atividade DEVE pertencer a um módulo
- **AC 3.1.2**: Campo `obrigatorio` DEVE ser TRUE ou FALSE (nunca NULL)
- **AC 3.1.3**: Campo `ordem_exibicao` DEVE ter valor numérico (para ordenação)
- **AC 3.1.4**: Campos de auditoria (`created_at`, `updated_at`) DEVEM sempre ter timestamp

### 3.2 Flashcards
- **AC 3.2.1**: Todo flashcard DEVE pertencer a um módulo
- **AC 3.2.2**: Campo `created_at` DEVE sempre ter timestamp

### 3.3 Cronogramas
- **AC 3.3.1**: Todo cronograma DEVE ter um nome (pode ser default "Meu Cronograma")

### 3.4 Professores
- **AC 3.4.1**: Professor pode não ter empresa (caso de superadmin) - NULL é válido aqui

## 4. Acceptance Criteria

### 4.1 Data Migration
- **AC 4.1.1**: Todos os registros com `modulo_id` NULL devem ser identificados e corrigidos ou removidos
- **AC 4.1.2**: Todos os registros com `obrigatorio` NULL devem receber valor TRUE
- **AC 4.1.3**: Todos os registros com `ordem_exibicao` NULL devem receber valor sequencial
- **AC 4.1.4**: Todos os registros com `created_at` NULL devem receber timestamp atual
- **AC 4.1.5**: Todos os registros com `nome` NULL em cronogramas devem receber "Meu Cronograma"

### 4.2 Schema Changes
- **AC 4.2.1**: Adicionar `NOT NULL` constraint em `atividades.modulo_id`
- **AC 4.2.2**: Adicionar `NOT NULL` constraint em `atividades.obrigatorio`
- **AC 4.2.3**: Adicionar `NOT NULL` constraint em `atividades.ordem_exibicao`
- **AC 4.2.4**: Adicionar `NOT NULL` constraint em `atividades.created_at`
- **AC 4.2.5**: Adicionar `NOT NULL` constraint em `atividades.updated_at`
- **AC 4.2.6**: Adicionar `NOT NULL` constraint em `flashcards.modulo_id`
- **AC 4.2.7**: Adicionar `NOT NULL` constraint em `flashcards.created_at`
- **AC 4.2.8**: Adicionar `NOT NULL` constraint em `cronogramas.nome`
- **AC 4.2.9**: Manter `professores.empresa_id` como nullable (regra de negócio válida)

### 4.3 Code Cleanup
- **AC 4.3.1**: Remover null coalescing operators (`??`) de `activity-cache.service.ts`
- **AC 4.3.2**: Remover type guards desnecessários de `flashcards.service.ts`
- **AC 4.3.3**: Atualizar interfaces TypeScript para refletir campos NOT NULL
- **AC 4.3.4**: Remover type assertions que tratam null em campos obrigatórios

### 4.4 Validation
- **AC 4.4.1**: TypeScript deve compilar sem erros após mudanças
- **AC 4.4.2**: Testes devem passar após mudanças
- **AC 4.4.3**: Inserções no banco devem falhar se campos obrigatórios forem null

## 5. Out of Scope

- Mudanças em outras tabelas não mencionadas
- Refatoração de lógica de negócio
- Mudanças em RLS policies

## 6. Risks

- **Risco 6.1**: Dados existentes podem ter nulls que impedem a migration
  - **Mitigação**: Script de análise antes da migration
- **Risco 6.2**: Código pode depender de comportamento null
  - **Mitigação**: Testes abrangentes antes do deploy
