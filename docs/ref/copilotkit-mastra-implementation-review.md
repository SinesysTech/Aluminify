# Revisao de Implementacao - CopilotKit e Mastra AI

**Data:** 2026-01-28
**Versao:** 4.0
**Status:** Implementacao Completa com AG-UI | Documentacao Atualizada

---

## 1. Resumo Executivo

Este documento descreve a integracao do CopilotKit e Mastra AI ao Aluminify usando o protocolo AG-UI oficial, com comparacao completa a documentacao oficial.

### Relacao CopilotKit + Mastra

**CopilotKit NAO e uma alternativa ao Mastra** - eles trabalham juntos:

- **CopilotKit** = Agentic Application Platform (UI, providers, runtime)
- **Mastra** = Agent Framework (uma das opcoes dentro do CopilotKit)
- **AG-UI Protocol** = Protocolo universal que conecta frameworks de agentes ao CopilotKit
- **@ag-ui/mastra** = Pacote oficial para integrar Mastra com CopilotKit

### Frameworks Suportados via AG-UI

CopilotKit suporta multiplos frameworks via AG-UI Protocol:
- Mastra
- LangGraph
- CrewAI (Crews e Flows)
- AG2 (Microsoft AutoGen)
- Agno
- LlamaIndex
- Pydantic AI
- ADK (Google)
- A2A Protocol

---

## 2. Status da Implementacao

### 2.1 Implementado (Seguindo Documentacao Oficial)

| Feature | Status | Referencia Oficial |
|---------|--------|-------------------|
| CopilotKit Runtime | ✅ | [Quickstart](https://docs.copilotkit.ai/direct-to-llm/guides/quickstart) |
| CopilotKitProvider | ✅ | Frontend integration |
| CopilotChat | ✅ | [Agentic Chat UI](https://docs.copilotkit.ai/agentic-chat-ui) |
| Backend Actions | ✅ | [Backend Actions](https://docs.copilotkit.ai/backend-actions) |
| Mastra AG-UI Integration | ✅ | [Mastra Quickstart](https://docs.copilotkit.ai/mastra/quickstart) |
| MastraAgent.getLocalAgents() | ✅ | Official pattern |
| ExperimentalEmptyAdapter | ✅ | For agent frameworks |
| Multi-tenant Context | ✅ | Custom implementation |
| Dual Mode (copilotkit/mastra) | ✅ | Custom architecture |

### 2.2 NAO Implementado

| Feature | Status | Referencia Oficial | Prioridade |
|---------|--------|-------------------|------------|
| Mastra Studio | ❌ | [Studio Docs](https://mastra.ai/docs/getting-started/studio) | Media |
| CopilotSidebar | ❌ | @copilotkit/react-ui | Baixa |
| CopilotPopup | ❌ | @copilotkit/react-ui | Baixa |
| Human-in-the-Loop | ❌ | [HITL Docs](https://docs.copilotkit.ai/mastra/human-in-the-loop) | Alta |
| Generative UI | ❌ | [Generative UI](https://docs.copilotkit.ai/mastra/generative-ui) | Media |
| Shared State | ❌ | [Shared State](https://docs.copilotkit.ai/shared-state) | Media |
| Agent Memory | ❌ | @mastra/memory | Media |
| Threads/Persistence | ❌ | [Persistence](https://docs.copilotkit.ai/langgraph/persistence/message-persistence) | Baixa |
| Frontend Actions/Tools | ❌ | [Frontend Actions](https://docs.copilotkit.ai/mastra/frontend-actions) | Media |

---

## 3. Versoes dos Pacotes

### 3.1 Instalados (package.json)

```json
{
  "@copilotkit/react-core": "^1.51.2",
  "@copilotkit/react-ui": "^1.51.2",
  "@copilotkit/runtime": "^1.51.2",
  "@ag-ui/mastra": "^0.2.0",
  "@ag-ui/client": "^0.0.43",
  "@ag-ui/core": "^0.0.43",
  "@mastra/core": "^1.0.4",
  "@ai-sdk/openai": "^3.0.21"
}
```

### 3.2 Verificacao de Versoes (2026-01-28)

| Pacote | Instalado | Ultima Disponivel | Status |
|--------|-----------|-------------------|--------|
| @copilotkit/runtime | ^1.51.2 | ~1.51.x | ✅ Atualizado |
| @copilotkit/react-core | ^1.51.2 | 1.51.2 | ✅ Atualizado |
| @copilotkit/react-ui | ^1.51.2 | 1.51.2 | ✅ Atualizado |
| @mastra/core | ^1.0.4 | 1.0.x (v1 stable) | ✅ Atualizado |
| @ag-ui/mastra | ^0.2.0 | 0.2.0 | ✅ Atualizado |
| @ag-ui/client | ^0.0.43 | 0.0.43 | ✅ Atualizado |
| @ag-ui/core | ^0.0.43 | 0.0.43 | ✅ Atualizado |

---

## 4. Arquitetura Implementada

### 4.1 Diagrama de Fluxo

```
+------------------+
|   Frontend UI    |
|  CopilotChat     |
+--------+---------+
         |
         | Header: X-CopilotKit-Agent
         v
+------------------------+
|   /api/copilotkit      |
|                        |
|  if agent == 'mastra': |
|    +----------------+  |
|    | MastraAgent    |  |
|    | .getLocalAgents|  |
|    | (AG-UI)        |  |
|    | EmptyAdapter   |  |
|    +----------------+  |
|  else:                 |
|    +----------------+  |
|    | CopilotKit     |  |
|    | Actions        |  |
|    | OpenAIAdapter  |  |
|    +----------------+  |
+------------------------+
```

### 4.2 Modos de Operacao

| Modo | Adapter | Header | Uso |
|------|---------|--------|-----|
| `copilotkit` | OpenAIAdapter | (nenhum) | Actions simples, direct-to-LLM |
| `mastra` | ExperimentalEmptyAdapter | `X-CopilotKit-Agent: mastra` | Agentes com estado/memoria |

---

## 5. Comparacao com Documentacao Oficial

### 5.1 API Route - Nossa Implementacao vs Oficial

**Oficial (CopilotKit + Mastra):**
```typescript
import { CopilotRuntime, ExperimentalEmptyAdapter } from "@copilotkit/runtime";
import { MastraAgent } from "@ag-ui/mastra";
import { mastra } from "@/mastra";

const runtime = new CopilotRuntime({
  agents: MastraAgent.getLocalAgents({ mastra }),
});
const serviceAdapter = new ExperimentalEmptyAdapter();
```

**Nossa Implementacao (`/api/copilotkit/route.ts`):**
```typescript
// Mastra mode - IGUAL ao oficial
const mastra = createMastraWithContext(userContext, agentConfig);
copilotRuntime = new CopilotRuntime({
  // @ts-expect-error - AG-UI integration type compatibility
  agents: MastraAgent.getLocalAgents({ mastra }),
});
serviceAdapter = emptyAdapter;

// CopilotKit mode - adicional (direct-to-LLM)
copilotRuntime = new CopilotRuntime({ actions });
serviceAdapter = openAIAdapter;
```

**Diferenca:** Nossa implementacao adiciona suporte dual-mode com header para escolher entre CopilotKit actions e Mastra agents.

### 5.2 Mastra Agent - Nossa Implementacao vs Oficial

**Oficial (CopilotKit/with-mastra):**
```typescript
export const weatherAgent = new Agent({
  id: "weather-agent",
  name: "Weather Agent",
  tools: { weatherTool },
  model: openai("gpt-4o"),
  instructions: "You are a helpful assistant.",
});
```

**Nossa Implementacao (`study-assistant.ts`):**
```typescript
const agent = new Agent({
  id: agentId,           // Configuravel
  name: agentName,       // Configuravel
  instructions: systemPrompt, // Configuravel
  model: openai(model),  // Configuravel (default: gpt-4o-mini)
  tools,                 // Tools com contexto multi-tenant
});
```

**Diferenca:** Nossa implementacao e mais flexivel com configuracao dinamica e injecao de contexto multi-tenant.

### 5.3 Provider - Nossa Implementacao vs Oficial

**Oficial:**
```tsx
<CopilotKit runtimeUrl="/api/copilotkit">
  <CopilotSidebar>
    <YourApp />
  </CopilotSidebar>
</CopilotKit>
```

**Nossa Implementacao:**
```tsx
<CopilotKit
  runtimeUrl="/api/copilotkit"
  headers={{
    Authorization: `Bearer ${accessToken}`,
    ...(agentMode === 'mastra' && { 'X-CopilotKit-Agent': 'mastra' }),
  }}
  properties={{
    userId, empresaId, userRole, userName, agentMode,
  }}
>
  {children}
</CopilotKit>
```

**Diferenca:** Nossa implementacao adiciona autenticacao via Bearer token e propriedades de contexto multi-tenant.

---

## 6. Arquivos Principais

| Arquivo | Descricao | Conformidade |
|---------|-----------|--------------|
| `/app/api/copilotkit/route.ts` | Endpoint unificado (ambos os modos) | ✅ Segue padrao oficial |
| `/app/shared/components/providers/copilotkit-provider.tsx` | Provider com agentMode | ✅ Extende padrao oficial |
| `/app/shared/lib/copilotkit/actions.ts` | Backend actions | ✅ Segue padrao oficial |
| `/app/shared/lib/mastra/index.ts` | Factory functions Mastra | ✅ Segue padrao oficial |
| `/app/shared/lib/mastra/agents/study-assistant.ts` | Agente de estudos | ✅ Segue padrao oficial |
| `/app/shared/lib/mastra/tools/index.ts` | Tools do agente | ✅ Segue padrao oficial |

---

## 7. Backend Actions / Tools

### 7.1 CopilotKit Actions (modo `copilotkit`)

| Action | Descricao | Permissao |
|--------|-----------|-----------|
| `getServerTime` | Data/hora do servidor | Todos |
| `searchCourses` | Busca cursos | Todos (filtrado por empresa) |
| `getStudentProgress` | Progresso do aluno | Aluno (proprio) ou Admin |
| `searchStudents` | Busca alunos | Apenas Admin |

### 7.2 Mastra Tools (modo `mastra`)

| Tool | Descricao | Permissao |
|------|-----------|-----------|
| `getServerTime` | Data/hora do servidor | Todos |
| `searchCourses` | Busca cursos | Todos (filtrado por empresa) |
| `getStudentProgress` | Progresso do aluno | Aluno (proprio) ou Admin |
| `searchStudents` | Busca alunos | Apenas Admin |

**Nota:** Ambos os modos compartilham a mesma logica de negocio.

---

## 8. Tabela ai_agents (Multi-tenant)

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
  is_default boolean,
  is_active boolean,
  -- ... outros campos
)
```

O `integration_type` determina qual modo usar no frontend.

---

## 9. Mastra Studio

### 9.1 O que e Mastra Studio?

Mastra Studio e uma interface visual de desenvolvimento que permite:
- Testar agentes interativamente
- Visualizar ferramentas e configuracoes
- Acessar API REST via Swagger UI
- Depurar workflows

### 9.2 Como Executar

```bash
# Requer o pacote 'mastra' CLI
npx mastra dev

# Ou adicionar ao package.json
{
  "scripts": {
    "mastra:dev": "mastra dev"
  }
}
```

**URLs disponveis:**
- Studio UI: http://localhost:4111/
- Swagger API: http://localhost:4111/swagger-ui

### 9.3 Status no Aluminify

**NAO IMPLEMENTADO** - Mastra Studio nao esta configurado porque:
1. O pacote `mastra` CLI nao esta instalado
2. Nao existe `mastra.config.ts`
3. A estrutura atual usa Mastra como biblioteca, nao como servidor standalone

**Para implementar**, seria necessario:
1. `npm install mastra` (CLI)
2. Criar arquivo de configuracao ou usar a estrutura existente
3. Adicionar script ao package.json

---

## 10. Proximos Passos

### 10.1 Concluido
- [x] Instalar @ag-ui/mastra
- [x] Implementar integracao AG-UI oficial
- [x] Atualizar /api/copilotkit para suportar ambos os modos
- [x] Atualizar CopilotKitProvider com agentMode
- [x] Documentar arquitetura
- [x] Verificar versoes dos pacotes
- [x] Comparar com documentacao oficial

### 10.2 Curto Prazo
- [ ] Atualizar pagina do agente para ler integration_type da config
- [ ] Testar fluxo completo com tenant CDF
- [ ] Criar interface admin para gerenciar ai_agents

### 10.3 Medio Prazo
- [ ] Implementar Human-in-the-Loop com useHumanInTheLoop
- [ ] Adicionar Generative UI para mostrar progresso
- [ ] Implementar Shared State entre frontend e agente
- [ ] Implementar Frontend Actions/Tools

### 10.4 Baixa Prioridade
- [ ] Implementar Mastra Studio para desenvolvimento local
- [ ] Adicionar CopilotSidebar como alternativa ao CopilotChat
- [ ] Implementar persistencia de threads/conversas
- [ ] Implementar @mastra/memory para memoria de agente

---

## 11. Referencias

### Documentacao Oficial CopilotKit
- [CopilotKit Docs](https://docs.copilotkit.ai)
- [CopilotKit + Mastra Quickstart](https://docs.copilotkit.ai/mastra/quickstart)
- [AG-UI Protocol](https://docs.copilotkit.ai/ag-ui-protocol)
- [Human-in-the-Loop](https://docs.copilotkit.ai/mastra/human-in-the-loop)
- [Generative UI](https://docs.copilotkit.ai/mastra/generative-ui)
- [Frontend Actions](https://docs.copilotkit.ai/mastra/frontend-actions)
- [Shared State](https://docs.copilotkit.ai/shared-state)

### Documentacao Oficial Mastra
- [Mastra Docs](https://mastra.ai/docs)
- [Mastra Studio](https://mastra.ai/docs/getting-started/studio)
- [Mastra Installation](https://mastra.ai/docs/getting-started/installation)

### Repositorios de Referencia
- [CopilotKit/with-mastra](https://github.com/CopilotKit/with-mastra)
- [CopilotKit/CopilotKit](https://github.com/CopilotKit/CopilotKit)
- [mastra-ai/mastra](https://github.com/mastra-ai/mastra)

---

## 12. Conclusao

A implementacao esta completa e segue o padrao oficial do CopilotKit:

1. **CopilotKit e a plataforma** - fornece UI, providers, runtime
2. **Mastra e o framework de agentes** - uma das opcoes dentro do CopilotKit
3. **AG-UI Protocol** - conecta Mastra ao CopilotKit via `@ag-ui/mastra`
4. **Um unico endpoint** - `/api/copilotkit` suporta ambos os modos
5. **`MastraAgent.getLocalAgents()`** - forma oficial de registrar agentes

### Diferenciais da Nossa Implementacao

| Aspecto | Padrao Oficial | Nossa Implementacao |
|---------|---------------|---------------------|
| Modos | Apenas um (agent ou actions) | Dual-mode via header |
| Autenticacao | Nao especificado | Bearer token obrigatorio |
| Multi-tenant | Nao especificado | Context injection |
| Configuracao | Estatica | Dinamica via ai_agents table |
| Agent selection | Fixo | Por empresa/config |

A arquitetura permite escolher entre direct-to-LLM (actions) ou agent framework (Mastra) atraves do `agentMode` prop no Provider, mantendo compatibilidade total com os padroes oficiais.
