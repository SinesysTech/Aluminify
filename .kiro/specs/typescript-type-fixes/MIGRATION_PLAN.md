# Plano de Migration - Campos Necessários

## Resumo Executivo

O código desenvolvido requer campos que **não existem no banco de dados**. Criei 2 migrations para adicionar esses campos e normalizar os tipos.

## ✅ O Que Precisa Ser Feito

### 1. Adicionar Campos Faltando (CRÍTICO)

Estes campos são **usados ativamente no código** e precisam existir no banco:

| Tabela | Campo | Tipo | Usado Em | Propósito |
|--------|-------|------|----------|-----------|
| `cronogramas` | `velocidade_reproducao` | DECIMAL(3,2) | cronograma.service.ts, export/xlsx | Velocidade de reprodução de vídeo (1.0x, 1.25x, 1.5x, 2.0x) |
| `sessoes_estudo` | `modulo_id` | UUID (FK) | activity.ts, dashboard-analytics | Rastrear qual módulo está sendo estudado |
| `progresso_flashcards` | `ultima_revisao` | TIMESTAMPTZ | dashboard-analytics | Data da última revisão do flashcard |
| `progresso_flashcards` | `ultimo_feedback` | ENUM | dashboard-analytics | Último feedback dado (fácil, médio, difícil) |

**Impacto se não adicionar:** 
- ❌ Cronogramas não podem calcular tempo ajustado por velocidade
- ❌ Dashboard não consegue mostrar estatísticas de estudo por módulo
- ❌ Sistema de flashcards não consegue filtrar revisões por período

### 2. Normalizar Campos Nullable (IMPORTANTE)

Estes campos são **nullable no banco mas o código espera NOT NULL**:

| Tabela | Campos | Motivo |
|--------|--------|--------|
| `sessoes_estudo` | `aluno_id`, `inicio`, `status`, `created_at` | Campos obrigatórios para funcionamento |
| `progresso_atividades` | `aluno_id`, `atividade_id`, `status`, `questoes_totais`, `questoes_acertos`, timestamps | Campos obrigatórios para tracking |
| `matriculas` | `aluno_id`, `curso_id` | Foreign keys obrigatórias |
| `professores` | `empresa_id` | Todo professor pertence a uma empresa |
| `cronogramas` | `nome`, timestamps | Campos obrigatórios para identificação |

**Impacto se não normalizar:**
- ⚠️ 135 erros TypeScript permanecem
- ⚠️ Código precisa de null checks desnecessários em todo lugar
- ⚠️ Possibilidade de bugs em runtime com valores NULL inesperados

## 📋 Migrations Criadas

### Migration 1: `20260115000001_add_missing_fields.sql`

**O que faz:**
- ✅ Adiciona `velocidade_reproducao` em `cronogramas` (default 1.00)
- ✅ Adiciona `modulo_id` em `sessoes_estudo` (com FK e index)
- ✅ Adiciona `ultima_revisao` em `progresso_flashcards` (com index)
- ✅ Adiciona `ultimo_feedback` em `progresso_flashcards` (com enum)
- ✅ Atualiza registros existentes com valores default
- ✅ Adiciona comentários explicativos

**Segurança:** ✅ Totalmente seguro - apenas adiciona campos novos

### Migration 2: `20260115000002_normalize_nullable_fields.sql`

**O que faz:**
- ✅ Torna campos críticos NOT NULL
- ✅ Define valores default para registros existentes com NULL
- ✅ Adiciona constraints de validação (ex: questoes_acertos <= questoes_totais)
- ✅ Adiciona checks de range (ex: velocidade entre 0.5 e 3.0)

**Segurança:** ⚠️ Requer validação - pode falhar se houver NULLs em dados existentes

## 🚀 Como Executar

### Opção 1: Supabase CLI (Recomendado)

```bash
# 1. Aplicar migrations localmente primeiro (teste)
npx supabase db reset

# 2. Se tudo OK, aplicar no remoto
npx supabase db push

# 3. Regenerar tipos
npx supabase gen types typescript --project-id wtqgfmtucqmpheghcvxo --schema public > lib/database.types.ts

# 4. Verificar erros
npx tsc --noEmit
```

### Opção 2: Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/wtqgfmtucqmpheghcvxo/editor
2. Vá em "SQL Editor"
3. Cole o conteúdo de `20260115000001_add_missing_fields.sql`
4. Execute
5. Repita para `20260115000002_normalize_nullable_fields.sql`
6. Regenere os tipos (comando acima)

### Opção 3: Validar Antes de Aplicar

```bash
# Verificar se há NULLs que causariam problemas
npx supabase db execute --file supabase/migrations/validation_queries.sql
```

## ⚠️ IMPORTANTE: Validação Antes da Migration 2

Antes de executar a migration 2, **verifique se há valores NULL**:

```sql
-- Verificar sessoes_estudo
SELECT COUNT(*) FROM sessoes_estudo 
WHERE aluno_id IS NULL OR inicio IS NULL OR status IS NULL OR created_at IS NULL;

-- Verificar progresso_atividades
SELECT COUNT(*) FROM progresso_atividades 
WHERE aluno_id IS NULL OR atividade_id IS NULL OR status IS NULL;

-- Verificar matriculas
SELECT COUNT(*) FROM matriculas 
WHERE aluno_id IS NULL OR curso_id IS NULL;

-- Verificar professores
SELECT COUNT(*) FROM professores 
WHERE empresa_id IS NULL;

-- Verificar cronogramas
SELECT COUNT(*) FROM cronogramas 
WHERE nome IS NULL OR created_at IS NULL;
```

**Se alguma query retornar > 0:**
- Ajuste os UPDATEs na migration 2 com valores apropriados
- Ou corrija os dados manualmente antes de executar

## 📊 Resultado Esperado

Após executar as migrations e regenerar os tipos:

- ✅ **135 erros → ~0-10 erros** (redução de 93-100%)
- ✅ Código TypeScript totalmente type-safe
- ✅ Banco de dados alinhado com o código
- ✅ Sem necessidade de type assertions desnecessários
- ✅ Melhor integridade de dados com constraints

## 🔄 Próximos Passos

1. **Executar Migration 1** (segura, sem riscos)
2. **Validar dados** para Migration 2
3. **Executar Migration 2** (após validação)
4. **Regenerar tipos** do Supabase
5. **Verificar compilação** (`npx tsc --noEmit`)
6. **Resolver erros restantes** (se houver)

## 💡 Filosofia

> "O banco deve servir ao código, não o contrário."

Desenvolvemos funcionalidades que precisam de campos específicos. As migrations garantem que o banco suporte essas funcionalidades corretamente.

## 📝 Notas Técnicas

### Por que `velocidade_reproducao` é DECIMAL(3,2)?
- Permite valores como 0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00, 2.50, 3.00
- Precisão de 2 casas decimais é suficiente
- Range de 0.5x a 3.0x cobre todos os casos de uso

### Por que `modulo_id` é nullable em `sessoes_estudo`?
- Nem toda sessão está vinculada a um módulo específico
- Pode ser estudo livre ou revisão geral
- O código já trata NULL corretamente

### Por que adicionar `ultimo_feedback`?
- Dashboard precisa saber qual foi o último feedback
- Usado para estatísticas de dificuldade percebida
- Enum garante valores válidos (facil, medio, dificil, esqueci)
