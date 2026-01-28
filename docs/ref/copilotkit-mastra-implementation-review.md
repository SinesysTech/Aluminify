# Revisao de Implementacao - CopilotKit e Mastra AI

**Data:** 2026-01-28
**Versao:** 1.0
**Status:** Implementacao Fase 1 Completa + Extensoes

---

## 1. Resumo Executivo

Este documento descreve o que foi implementado na integracao do CopilotKit e Mastra AI ao Aluminify, comparando com o plano original e identificando evolucoes arquiteturais realizadas durante a implementacao.

### Escopo Original (Plano Fase 1)
- Integracao basica do CopilotKit
- 4 backend actions com contexto multi-tenant
- Chat UI usando CopilotChat

### Escopo Final Implementado
- Integracao completa do CopilotKit
- Integracao adicional do Mastra AI Framework
- Arquitetura multi-tenant de agentes IA (`ai_agents`)
- Sistema de integracao plugavel (copilotkit, mastra, n8n, custom)
- Renomeacao do modulo `/tobias` para `/agente` (generico)

---

## 2. Arquitetura Implementada

### 2.1 Visao Geral

```
                    +------------------+
                    |   Frontend UI    |
                    |  /[tenant]/agente|
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
    +---------v----+ +-------v------+ +----v--------+
    | CopilotChat  | | MastraChat   | | LegacyChat  |
    | (CopilotKit) | | (Streaming)  | | (n8n)       |
    +---------+----+ +-------+------+ +----+--------+
              |              |              |
              v              v              v
    +------------------+------------------+------------------+
    |           API Routes Layer                             |
    |  /api/copilotkit  |  /api/mastra/*  |  /api/tobias/*  |
    +------------------+------------------+------------------+
              |              |              |
              v              v              v
    +--------------------------------------------------+
    |              Backend Services                     |
    |  - AIAgentsService (config do agente)            |
    |  - CopilotKit Actions / Mastra Tools             |
    |  - Database (Supabase)                           |
    +--------------------------------------------------+
```

### 2.2 Camadas do Sistema

| Camada | Responsabilidade | Arquivos |
|--------|------------------|----------|
| **UI Components** | Renderizacao do chat | `copilot-chat-section.tsx`, `mastra-chat-section.tsx` |
| **Providers** | Contexto e configuracao | `copilotkit-provider.tsx` |
| **API Routes** | Endpoints HTTP | `/api/copilotkit`, `/api/mastra`, `/api/mastra/stream` |
| **Actions/Tools** | Logica de negocio IA | `copilotkit/actions.ts`, `mastra/tools/` |
| **Services** | Acesso a dados | `ai-agents/`, `conversation/`, `chat/` |
| **Database** | Persistencia | `ai_agents` table, Supabase |

---

## 3. Implementacao CopilotKit

### 3.1 O Que Foi Planejado vs Implementado

| Item do Plano | Status | Observacoes |
|---------------|--------|-------------|
| Instalar dependencias | OK | `@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/runtime` |
| `/app/api/copilotkit/route.ts` | OK | Autenticacao via Bearer token, OpenAIAdapter |
| `/app/shared/lib/copilotkit/actions.ts` | OK | 4 actions implementadas |
| `/app/shared/components/providers/copilotkit-provider.tsx` | OK | Auto-refresh de token |
| Modificar `dashboard-layout.tsx` | OK | Provider na hierarquia correta |
| Criar `copilot-chat-section.tsx` | OK | Localizado em `/agente/components/` (nao `/tobias/`) |
| Modificar `tobias/page.tsx` | ALTERADO | Renomeado para `/agente/page.tsx` |

### 3.2 Backend Actions Implementadas

```
ActionContext {
  userId: string      // ID do usuario autenticado
  empresaId: string   // Tenant do usuario (isolamento)
  userRole: 'aluno' | 'usuario' | 'superadmin'
}
```

| Action | Descricao | Permissao |
|--------|-----------|-----------|
| `getServerTime` | Retorna data/hora do servidor (pt-BR) | Todos |
| `searchCourses` | Busca cursos por nome | Todos (filtrado por empresa) |
| `getStudentProgress` | Estatisticas de atividades do aluno | Aluno (proprio) ou Admin |
| `searchStudents` | Busca alunos por nome/email | Apenas Admin |

### 3.3 Fluxo de Autenticacao

```
1. Usuario faz login -> Supabase retorna access_token
2. CopilotKitProvider escuta auth state changes
3. Cada request para /api/copilotkit inclui Bearer token
4. API extrai userId, empresaId, userRole do token
5. Actions recebem contexto para filtrar dados
```

### 3.4 Seguranca Multi-Tenant

- **Isolamento de dados:** Todas as queries filtram por `empresaId`
- **Verificacao de permissao:** Actions sensíveis checam `userRole`
- **Token obrigatorio:** Requests sem token retornam 401

---

## 4. Implementacao Mastra AI

### 4.1 Contexto

O Mastra AI foi adicionado como uma **extensao ao plano original**, nao estava previsto inicialmente. Foi implementado para oferecer uma alternativa ao CopilotKit com:

- Melhor controle sobre o fluxo de agentes
- Suporte nativo a streaming
- Possibilidade de workflows complexos (futuro)

### 4.2 Estrutura de Arquivos

```
app/shared/lib/mastra/
  index.ts              # Exports e factory functions
  agents/
    study-assistant.ts  # Factory do agente de estudos
  tools/
    index.ts            # Tools (equivalente aos actions)

app/api/mastra/
  route.ts              # Endpoint nao-streaming
  stream/
    route.ts            # Endpoint com SSE streaming
```

### 4.3 Mastra Tools Implementados

Os tools Mastra sao **equivalentes funcionais** aos CopilotKit actions:

| Tool | Funcao | Input Schema (Zod) |
|------|--------|-------------------|
| `getServerTime` | Data/hora atual | `{}` |
| `searchCourses` | Buscar cursos | `{ searchTerm?: string, limit?: number }` |
| `getStudentProgress` | Progresso do aluno | `{ studentId?: string }` |
| `searchStudents` | Buscar alunos | `{ searchTerm: string, limit?: number }` |

### 4.4 Agente de Estudos

```typescript
createStudyAssistantAgent({
  context: ToolContext,      // userId, empresaId, userRole
  systemPrompt?: string,     // Instrucoes do sistema
  model?: string,            // Modelo OpenAI (default: gpt-4o-mini)
  temperature?: number,      // Criatividade (default: 0.7)
  agentName?: string,        // Nome do agente
  agentId?: string,          // ID estavel
})
```

### 4.5 Streaming vs Non-Streaming

| Endpoint | Metodo | Resposta |
|----------|--------|----------|
| `/api/mastra` | POST | JSON `{ message, toolCalls, toolResults }` |
| `/api/mastra/stream` | POST | SSE `data: { type: "text", content }` |

O streaming e controlado via `integration_config.streaming_enabled` no banco.

---

## 5. Arquitetura Multi-Tenant de Agentes

### 5.1 Motivacao

O plano original assumia que "TobIAs" era o agente global. Durante a implementacao, identificou-se que:

- TobIAs e especifico do tenant CDF
- Outros tenants terao seus proprios agentes
- Nomes, avatares, prompts sao configuráveis por tenant

### 5.2 Tabela `ai_agents`

```sql
ai_agents (
  id uuid PRIMARY KEY,
  empresa_id uuid NOT NULL,           -- Tenant owner

  -- Identificacao
  slug text NOT NULL,                 -- URL-safe: 'tobias', 'maria'
  name text NOT NULL,                 -- Display: 'TobIAs', 'Maria'

  -- Aparencia
  avatar_url text,
  greeting_message text,
  placeholder_text text,

  -- Comportamento
  system_prompt text,
  model text DEFAULT 'gpt-4o-mini',
  temperature numeric DEFAULT 0.7,

  -- Integracao
  integration_type text,              -- 'copilotkit' | 'mastra' | 'n8n' | 'custom'
  integration_config jsonb,           -- Config especifica do tipo

  -- Features
  supports_attachments boolean,
  supports_voice boolean,

  -- Status
  is_active boolean,
  is_default boolean,                 -- Agente padrao do tenant

  UNIQUE(empresa_id, slug)
)
```

### 5.3 Tipos de Integracao

| Tipo | Descricao | Config |
|------|-----------|--------|
| `copilotkit` | Usa CopilotKit Runtime | `{ actions_enabled?: boolean }` |
| `mastra` | Usa Mastra Agent | `{ streaming_enabled?: boolean, max_steps?: number }` |
| `n8n` | Legacy webhook n8n | `{ webhook_url: string }` |
| `custom` | Endpoint customizado | `{ endpoint_url, api_key?, headers? }` |

### 5.4 Service Layer

```
AIAgentsService
  - getById(id)
  - getBySlug(empresaId, slug)
  - getDefault(empresaId)
  - getAllForEmpresa(empresaId)
  - getActiveForEmpresa(empresaId)     # Para sidebar
  - getChatConfig(empresaId, slug?)    # Para chat UI
  - create(input, userId?)
  - update(id, input, userId?)
  - delete(id)
  - setDefault(agentId, userId?)
```

---

## 6. Mudanca de `/tobias` para `/agente`

### 6.1 Motivacao

- `/tobias` era um nome hardcoded especifico do CDF
- `/agente` e generico e funciona para qualquer tenant
- O nome do agente vem do banco de dados

### 6.2 Impacto

| Antes | Depois |
|-------|--------|
| `app/[tenant]/(modules)/tobias/` | `app/[tenant]/(modules)/agente/` |
| Import de `tobias/services/` | Import de `agente/services/` |
| Rota `/[tenant]/tobias` | Rota `/[tenant]/agente` |

### 6.3 Module Visibility

O modulo `agente` foi configurado com `default_visible = false` na tabela `module_definitions`. Isso significa:

- Por padrao, o modulo NAO aparece na sidebar
- Tenants que querem usar precisam habilitar em `tenant_module_visibility`
- CDF tem `is_visible = true` com `custom_name = 'TobIAs'`

---

## 7. Desvios e Evolucoes Identificados

### 7.1 Evolucoes Positivas (nao eram desvios, foram melhorias)

| Item | Plano Original | Implementacao Final | Justificativa |
|------|----------------|---------------------|---------------|
| Arquitetura de agentes | TobIAs hardcoded | `ai_agents` multi-tenant | Escalabilidade para multiplos tenants |
| Framework IA | Apenas CopilotKit | CopilotKit + Mastra | Flexibilidade e opcoes de integracao |
| Streaming | Nao previsto | Implementado via Mastra | UX melhorada com respostas em tempo real |
| Tipos de integracao | Apenas copilotkit | copilotkit, mastra, n8n, custom | Compatibilidade com sistema legado |

### 7.2 Pontos de Atencao

| Item | Status | Acao Necessaria |
|------|--------|-----------------|
| **Estilos CopilotKit** | Parcial | Verificar se `@copilotkit/react-ui/styles.css` esta importado corretamente |
| **API routes `/api/tobias/*`** | Mantidas | Considerar deprecar ou manter para compatibilidade |
| **Testes** | Nao executados | Criar testes E2E para fluxo de chat |
| **Variavel COPILOTKIT_MODEL** | Opcional | Documentar no `.env.example` |

### 7.3 Itens NAO Implementados do Plano

| Item | Razao |
|------|-------|
| Tabs "Classico" vs "CopilotKit" na UI | Substituido por sistema de `integration_type` |
| Import em `globals.css` | Estilos importados diretamente no componente |

---

## 8. Diagrama de Decisao - Qual Integracao Usar

```
Requisicao para /[tenant]/agente
         |
         v
+-------------------+
| Carregar config   |
| do ai_agents DB   |
+--------+----------+
         |
         v
+-------------------+
| integration_type? |
+--------+----------+
         |
    +----+----+----+----+
    |    |    |    |    |
    v    v    v    v    v
copilotkit mastra n8n custom
    |    |    |    |
    v    v    v    v
CopilotChat  MastraChat  LegacyChat  CustomChat
Section      Section     (n8n)       (futuro)
```

---

## 9. Proximos Passos Sugeridos

### 9.1 Curto Prazo
- [ ] Verificar importacao de estilos CopilotKit
- [ ] Testar fluxo completo com tenant CDF
- [ ] Adicionar variavel `COPILOTKIT_MODEL` ao `.env.example`

### 9.2 Medio Prazo
- [ ] Criar interface admin para gerenciar `ai_agents`
- [ ] Implementar mais tools/actions especificos do dominio
- [ ] Adicionar suporte a RAG (Retrieval Augmented Generation)
- [ ] Implementar workflows Mastra para processos complexos

### 9.3 Longo Prazo
- [ ] Deprecar `/api/tobias/*` em favor de `/api/agente/*`
- [ ] Adicionar metricas e observabilidade (LangSmith, etc.)
- [ ] Implementar `integration_type = 'custom'` para webhooks externos

---

## 10. Referencias

### Arquivos Principais

| Caminho | Descricao |
|---------|-----------|
| `app/api/copilotkit/route.ts` | Endpoint CopilotKit |
| `app/api/mastra/route.ts` | Endpoint Mastra (sync) |
| `app/api/mastra/stream/route.ts` | Endpoint Mastra (streaming) |
| `app/shared/lib/copilotkit/actions.ts` | Actions CopilotKit |
| `app/shared/lib/mastra/` | Modulo Mastra completo |
| `app/shared/services/ai-agents/` | Service layer de agentes |
| `app/shared/components/providers/copilotkit-provider.tsx` | Provider React |
| `app/[tenant]/(modules)/agente/` | Modulo de chat UI |
| `supabase/migrations/20260127_create_ai_agents.sql` | Migration da tabela |

### Dependencias Instaladas

```json
{
  "@copilotkit/react-core": "^1.51.2",
  "@copilotkit/react-ui": "^1.51.2",
  "@copilotkit/runtime": "^1.51.2",
  "@mastra/core": "latest",
  "@ai-sdk/openai": "latest"
}
```

---

## 11. Conclusao

A implementacao foi **bem-sucedida** e **superou o escopo original** do plano. As principais evolucoes foram:

1. **Arquitetura multi-tenant de agentes** - Permite que cada tenant tenha agentes personalizados
2. **Sistema de integracao plugavel** - Suporta CopilotKit, Mastra, n8n e custom
3. **Streaming nativo** - Melhor UX com respostas em tempo real

Nao foram identificados **desvios negativos** - todas as mudancas foram evolucoes arquiteturais que agregam valor ao sistema.
