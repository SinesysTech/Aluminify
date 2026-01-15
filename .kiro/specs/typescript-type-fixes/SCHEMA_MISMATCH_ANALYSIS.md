# Análise de Incompatibilidade entre Código e Schema

## Resumo

Após gerar os tipos do Supabase remoto, identificamos **135 erros TypeScript** (redução de 76% dos 577 originais). Os erros restantes indicam incompatibilidades entre o código e o schema real do banco de dados.

## Problemas Principais

### 1. Tabela `cronogramas` - Campos Faltando/Diferentes

**Campos no código mas NÃO no schema:**
- `velocidade_reproducao` (usado em 5+ lugares)
- `acumulativo_desde_inicio`

**Campos no schema mas NÃO usados no código:**
- `modulos_selecionados` (Json)
- `excluir_aulas_concluidas` (boolean)

**Impacto:** 
- `backend/services/cronograma/cronograma.service.ts` - 55 erros
- `backend/services/cronograma/cronograma.types.ts` - Tipo `CronogramaDetalhado` incompatível

### 2. Tabela `sessoes_estudo` - Campos Faltando

**Campos no código mas NÃO no schema:**
- `modulo_id` (referenciado em repository)
- `aula_id` (referenciado em repository)
- `tempo_estudado` (campo antigo)
- `data_sessao` (campo antigo)

**Campos no schema:**
- Todos os campos são nullable
- Não tem foreign keys para `modulos` ou `aulas`

**Impacto:**
- `backend/services/sessao-estudo/sessao-estudo.repository.ts` - 12 erros
- `types/shared/entities/activity.ts` - Tipo `SessaoEstudo` incompatível

### 3. Tipos Nullable vs Non-Nullable

**Problema:** O schema tem muitos campos como `string | null` mas o código espera `string` ou `string | undefined`.

**Exemplos:**
- `alunos.aluno_id` - schema: `string | null`, código espera: `string`
- `progresso_atividades.atividade_id` - schema: `string | null`, código espera: `string`
- `professores.empresa_id` - schema: `string | null`, código espera: `string`
- `cronogramas.nome` - schema: `string | null`, código espera: `string`
- `cronogramas.created_at` - schema: `string | null`, código espera: `string`

**Impacto:**
- `backend/services/enrollment/enrollment.repository.ts` - 2 erros
- `backend/services/progresso-atividade/progresso-atividade.repository.ts` - 7 erros
- `backend/services/teacher/teacher.repository.ts` - 2 erros

### 4. Tipos Customizados Incompatíveis

**Problema:** Tipos definidos manualmente no código não correspondem aos tipos do schema.

**Exemplos:**
- `FrenteQueryResult` - espera `disciplina_id: string | undefined`, schema tem `string | null`
- `CronogramaDetalhado` - espera `velocidade_reproducao: number`, campo não existe
- `ModuloData` - espera `frente_id: string`, schema tem `string | null`
- `FrenteData` - espera `disciplina_id: string`, schema tem `string | null`

**Impacto:**
- `backend/services/cronograma/cronograma.service.ts` - Múltiplos erros de tipo
- `lib/cronograma-export-utils.ts` - 4 erros

### 5. Enums e Union Types

**Problema:** Campos enum no schema não correspondem aos tipos esperados.

**Exemplos:**
- `progresso_atividades.status` - schema: `string | null`, código espera: `StatusAtividade` enum
- `sessoes_estudo.status` - schema: `string | null`, código espera: `SessaoStatus` enum
- `sessoes_estudo.metodo_estudo` - schema: `string | null`, código espera: `MetodoEstudo` enum

## Soluções Recomendadas

### Opção 1: Atualizar o Schema do Banco (Recomendado)

Adicionar os campos faltando via migrations:

```sql
-- Adicionar velocidade_reproducao em cronogramas
ALTER TABLE cronogramas ADD COLUMN velocidade_reproducao DECIMAL DEFAULT 1.0;

-- Adicionar modulo_id e aula_id em sessoes_estudo
ALTER TABLE sessoes_estudo ADD COLUMN modulo_id UUID REFERENCES modulos(id);
ALTER TABLE sessoes_estudo ADD COLUMN aula_id UUID REFERENCES aulas(id);

-- Tornar campos NOT NULL onde apropriado
ALTER TABLE alunos ALTER COLUMN aluno_id SET NOT NULL;
ALTER TABLE progresso_atividades ALTER COLUMN atividade_id SET NOT NULL;
-- etc...
```

### Opção 2: Atualizar o Código para Corresponder ao Schema

Modificar os tipos customizados e adicionar null checks:

1. Atualizar `CronogramaDetalhado` para remover `velocidade_reproducao`
2. Atualizar `SessaoEstudo` para remover `modulo_id` e `aula_id`
3. Adicionar null checks em todos os lugares que usam campos nullable
4. Atualizar tipos customizados para usar `| null` em vez de `| undefined`

### Opção 3: Híbrida (Mais Prática)

1. Adicionar campos críticos faltando no banco (velocidade_reproducao, modulo_id, aula_id)
2. Atualizar código para lidar com nullability corretamente
3. Usar type assertions onde necessário com comentários explicativos

## Próximos Passos

1. **Decisão:** Escolher qual abordagem seguir (recomendo Opção 3)
2. **Migration:** Se necessário, criar migration para adicionar campos
3. **Regenerar tipos:** Após migration, regenerar `database.types.ts`
4. **Atualizar código:** Corrigir os 135 erros restantes
5. **Verificar:** Rodar `tsc --noEmit` até zero erros

## Estatísticas

- **Erros iniciais:** 577
- **Erros após regeneração:** 135
- **Redução:** 76%
- **Arquivos com erros:** 15
- **Principais arquivos afetados:**
  - `cronograma.service.ts` (55 erros)
  - `flashcards.service.ts` (16 erros)
  - `sessao-estudo.repository.ts` (12 erros)
  - `materiais-client.tsx` (10 erros)
  - `empresa-client.tsx` (10 erros)
