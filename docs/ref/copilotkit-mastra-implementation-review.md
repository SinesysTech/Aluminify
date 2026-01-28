# Revisao de Implementacao - CopilotKit e Mastra AI

**Data:** 2026-01-28
**Versao:** 2.0
**Status:** Implementacao Corrigida - Integracao via AG-UI

---

## 1. Resumo Executivo

Este documento descreve a integracao do CopilotKit e Mastra AI ao Aluminify, com foco na arquitetura correta que foi implementada apos revisao da documentacao oficial.

### IMPORTANTE: Relacao CopilotKit + Mastra

**CopilotKit NAO e uma alternativa ao Mastra** - eles trabalham juntos:

- **CopilotKit** = Agentic Application Platform (UI, providers, runtime, streaming)
- **Mastra** = Agent Framework (uma das muitas opcoes dentro do CopilotKit)
- **AG-UI Protocol** = Protocolo que conecta frameworks de agentes ao CopilotKit

Outros frameworks de agentes suportados pelo CopilotKit:
- LangGraph
- CrewAI (Crews e Flows)
- Agno
- LlamaIndex
- Pydantic AI
- Microsoft Agent Framework
- E outros...

### Escopo Implementado

1. **CopilotKit** como plataforma de UI e runtime
2. **Dois modos de operacao:**
   - `copilotkit`: Direct-to-LLM com backend actions
   - `mastra`: Mastra agent framework via AG-UI protocol
3. **Arquitetura multi-tenant** com tabela `ai_agents`
4. **Sistema de integracao configuravel** por tenant

---

## 2. Arquitetura Implementada

### 2.1 Diagrama de Integracao

```
+------------------+
|   Frontend UI    |
|  CopilotChat     |
+--------+---------+
         |
         | (HTTP + WebSocket)
         v
+------------------+
|  CopilotKit      |
|  Provider        |
|  (headers:       |
|   X-CopilotKit-  |
|   Agent=mastra)  |
+--------+---------+
         |
         v
+------------------------+
|   /api/copilotkit      |
|                        |
|  if X-CopilotKit-Agent |
|     == 'mastra':       |
|    +----------------+  |
|    | MastraAgent    |  |
|    | .getLocalAgents|  |
|    | (via AG-UI)    |  |
|    +----------------+  |
|  else:                 |
|    +----------------+  |
|    | CopilotKit     |  |
|    | Actions        |  |
|    | (direct-LLM)   |  |
|    +----------------+  |
+------------------------+
```

### 2.2 Modos de Operacao

| Modo | Adapter | Quando Usar |
|------|---------|-------------|
| `copilotkit` | OpenAIAdapter | Backend actions simples, sem orquestracao complexa |
| `mastra` | ExperimentalEmptyAdapter | Agentes com estado, memoria, workflows |

### 2.3 Fluxo de Decisao

```
Request chegando em /api/copilotkit
         |
         v
+-------------------+
| Header ou Query   |
| agent=mastra?     |
+--------+----------+
         |
    +----+----+
    |         |
   SIM       NAO
    |         |
    v         v
+-------+  +--------+
| Mastra|  |CopilotKit|
| Agent |  | Actions |
| (AG-UI)|  |(Direct) |
+-------+  +--------+
```

---

## 3. Implementacao CopilotKit (Modo Direct-to-LLM)

### 3.1 Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `/app/api/copilotkit/route.ts` | Endpoint unificado |
| `/app/shared/lib/copilotkit/actions.ts` | Backend actions |
| `/app/shared/components/providers/copilotkit-provider.tsx` | Provider com suporte a agentMode |

### 3.2 Backend Actions

| Action | Descricao | Permissao |
|--------|-----------|-----------|
| `getServerTime` | Data/hora do servidor | Todos |
| `searchCourses` | Busca cursos | Todos (filtrado por empresa) |
| `getStudentProgress` | Progresso do aluno | Aluno (proprio) ou Admin |
| `searchStudents` | Busca alunos | Apenas Admin |

### 3.3 Contexto de Seguranca

```typescript
interface ActionContext {
  userId: string;
  empresaId: string | null;
  userRole: 'aluno' | 'usuario' | 'superadmin';
}
```

---

## 4. Implementacao Mastra (Via AG-UI Protocol)

### 4.1 Integracao Oficial

A integracao segue o padrao oficial do CopilotKit:

```typescript
// /api/copilotkit/route.ts
import { MastraAgent } from "@ag-ui/mastra";
import { CopilotRuntime, ExperimentalEmptyAdapter } from "@copilotkit/runtime";

// Criar Mastra instance com contexto do usuario
const mastra = createMastraWithContext(userContext, agentConfig);

// Registrar agentes via AG-UI protocol
const runtime = new CopilotRuntime({
  agents: MastraAgent.getLocalAgents({ mastra }),
});

// Usar EmptyAdapter pois o agente Mastra faz as chamadas LLM
const serviceAdapter = new ExperimentalEmptyAdapter();
```

### 4.2 Arquivos Mastra

| Arquivo | Descricao |
|---------|-----------|
| `/app/shared/lib/mastra/index.ts` | Factory functions e exports |
| `/app/shared/lib/mastra/agents/study-assistant.ts` | Agente de estudos |
| `/app/shared/lib/mastra/tools/index.ts` | Tools do agente |

### 4.3 Mastra Tools

Os tools sao equivalentes funcionais aos CopilotKit actions:

| Tool | Funcao |
|------|--------|
| `getServerTime` | Data/hora atual |
| `searchCourses` | Buscar cursos |
| `getStudentProgress` | Progresso do aluno |
| `searchStudents` | Buscar alunos |

### 4.4 Contexto Multi-Tenant

```typescript
// Tools recebem contexto na criacao
const tools = createMastraTools({
  userId: string,
  empresaId: string | null,
  userRole: 'aluno' | 'usuario' | 'superadmin',
});

// Todas as queries filtram por empresaId
query = query.eq("empresa_id", empresaId);
```

---

## 5. Provider Configuration

### 5.1 CopilotKitProvider

```typescript
interface CopilotKitProviderProps {
  user: AppUser;
  children: React.ReactNode;
  agentMode?: 'copilotkit' | 'mastra';
}
```

### 5.2 Uso no Frontend

```tsx
// Modo CopilotKit (default)
<CopilotKitProvider user={user}>
  <CopilotChat />
</CopilotKitProvider>

// Modo Mastra
<CopilotKitProvider user={user} agentMode="mastra">
  <CopilotChat />
</CopilotKitProvider>
```

---

## 6. Tabela ai_agents

### 6.1 Estrutura

```sql
ai_agents (
  id uuid PRIMARY KEY,
  empresa_id uuid NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  integration_type text,  -- 'copilotkit' | 'mastra' | 'n8n' | 'custom'
  integration_config jsonb,
  system_prompt text,
  model text DEFAULT 'gpt-4o-mini',
  temperature numeric DEFAULT 0.7,
  -- ... outros campos
)
```

### 6.2 integration_type Options

| Tipo | Descricao | Tecnologia |
|------|-----------|------------|
| `copilotkit` | Backend actions diretas | CopilotKit + OpenAIAdapter |
| `mastra` | Mastra agent framework | CopilotKit + MastraAgent (AG-UI) |
| `n8n` | Legacy webhook | n8n workflows |
| `custom` | Endpoint customizado | API externa |

---

## 7. Dependencias

```json
{
  "@copilotkit/react-core": "^1.51.2",
  "@copilotkit/react-ui": "^1.51.2",
  "@copilotkit/runtime": "^1.51.2",
  "@ag-ui/mastra": "latest",
  "@mastra/core": "latest",
  "@ai-sdk/openai": "latest"
}
```

---

## 8. Endpoints Antigos (Deprecados)

Os seguintes endpoints foram criados anteriormente mas **nao seguem o padrao oficial**:

| Endpoint | Status | Recomendacao |
|----------|--------|--------------|
| `/api/mastra` | Deprecado | Usar `/api/copilotkit?agent=mastra` |
| `/api/mastra/stream` | Deprecado | Usar `/api/copilotkit` com agentMode='mastra' |

O CopilotKit ja fornece streaming nativo, entao endpoints separados nao sao necessarios.

---

## 9. Proximos Passos

### 9.1 Imediato
- [x] Instalar @ag-ui/mastra
- [x] Atualizar /api/copilotkit para suportar Mastra via AG-UI
- [x] Atualizar CopilotKitProvider com agentMode
- [x] Corrigir documentacao

### 9.2 Curto Prazo
- [ ] Remover endpoints /api/mastra/* (ou marcar como deprecated)
- [ ] Atualizar pagina do agente para usar agentMode da config
- [ ] Testar integracao completa

### 9.3 Medio Prazo
- [ ] Implementar Human-in-the-Loop com Mastra
- [ ] Adicionar Generative UI para mostrar progresso
- [ ] Implementar Shared State entre frontend e agente

---

## 10. Referencias

### Documentacao Oficial
- [CopilotKit Docs](https://docs.copilotkit.ai)
- [CopilotKit + Mastra Quickstart](https://docs.copilotkit.ai/integrations/mastra/quickstart)
- [AG-UI Protocol](https://docs.copilotkit.ai/ag-ui-protocol)
- [MastraAgent.getLocalAgents](https://docs.copilotkit.ai/mastra)

### Repositorio de Referencia
- [CopilotKit/with-mastra](https://github.com/CopilotKit/with-mastra)

---

## 11. Conclusao

A implementacao foi corrigida para seguir o padrao oficial do CopilotKit:

1. **CopilotKit e a plataforma** - fornece UI, providers, runtime
2. **Mastra e um framework de agentes** - uma das opcoes dentro do CopilotKit
3. **AG-UI Protocol** - conecta frameworks de agentes ao CopilotKit
4. **Um unico endpoint** - `/api/copilotkit` suporta ambos os modos
5. **MastraAgent.getLocalAgents()** - forma correta de registrar agentes Mastra

A arquitetura agora esta alinhada com a documentacao oficial e permite escolher entre direct-to-LLM (actions) ou agent framework (Mastra) atraves de configuracao simples.
