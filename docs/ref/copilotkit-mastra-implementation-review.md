# Revisao de Implementacao - CopilotKit e Mastra AI

**Data:** 2026-01-28
**Versao:** 2.1
**Status:** Implementacao Funcional

---

## 1. Resumo Executivo

Este documento descreve a integracao do CopilotKit e Mastra AI ao Aluminify.

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

### Estado Atual da Implementacao

1. **CopilotKit** funcionando com backend actions (direct-to-LLM)
2. **Mastra** implementado como endpoints separados (`/api/mastra/*`)
3. **Integracao AG-UI** pendente (problema com pacote `@ag-ui/mastra`)

---

## 2. Arquitetura Atual

### 2.1 CopilotKit (Direct-to-LLM)

```
Frontend                    Backend
+---------------+          +-------------------+
| CopilotChat   |   --->   | /api/copilotkit   |
| (CopilotKit   |          |   - OpenAIAdapter |
|  React UI)    |          |   - Actions       |
+---------------+          +-------------------+
```

### 2.2 Mastra (Endpoints Separados)

```
Frontend                    Backend
+---------------+          +-------------------+
| MastraChatUI  |   --->   | /api/mastra       |
| (Custom)      |          | /api/mastra/stream|
+---------------+          +-------------------+
```

---

## 3. Implementacao CopilotKit

### 3.1 Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `/app/api/copilotkit/route.ts` | Endpoint CopilotKit |
| `/app/shared/lib/copilotkit/actions.ts` | Backend actions |
| `/app/shared/components/providers/copilotkit-provider.tsx` | Provider React |

### 3.2 Backend Actions

| Action | Descricao | Permissao |
|--------|-----------|-----------|
| `getServerTime` | Data/hora do servidor | Todos |
| `searchCourses` | Busca cursos | Todos (filtrado por empresa) |
| `getStudentProgress` | Progresso do aluno | Aluno (proprio) ou Admin |
| `searchStudents` | Busca alunos | Apenas Admin |

### 3.3 Fluxo de Autenticacao

```
1. Usuario faz login -> Supabase retorna access_token
2. CopilotKitProvider escuta auth state changes
3. Cada request para /api/copilotkit inclui Bearer token
4. API extrai userId, empresaId, userRole do token
5. Actions recebem contexto para filtrar dados
```

---

## 4. Implementacao Mastra

### 4.1 Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `/app/shared/lib/mastra/index.ts` | Factory functions |
| `/app/shared/lib/mastra/agents/study-assistant.ts` | Agente de estudos |
| `/app/shared/lib/mastra/tools/index.ts` | Tools do agente |
| `/app/api/mastra/route.ts` | Endpoint sync |
| `/app/api/mastra/stream/route.ts` | Endpoint streaming |

### 4.2 Tools Mastra

| Tool | Funcao |
|------|--------|
| `getServerTime` | Data/hora atual |
| `searchCourses` | Buscar cursos |
| `getStudentProgress` | Progresso do aluno |
| `searchStudents` | Buscar alunos |

---

## 5. Tabela ai_agents

### 5.1 Estrutura

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

### 5.2 integration_type Options

| Tipo | Descricao | Endpoint |
|------|-----------|----------|
| `copilotkit` | Backend actions | `/api/copilotkit` |
| `mastra` | Mastra agent | `/api/mastra/*` |
| `n8n` | Legacy webhook | Webhook externo |
| `custom` | Endpoint customizado | API externa |

---

## 6. Dependencias

```json
{
  "@copilotkit/react-core": "^1.51.2",
  "@copilotkit/react-ui": "^1.51.2",
  "@copilotkit/runtime": "^1.51.2",
  "@mastra/core": "^1.0.4",
  "@ai-sdk/openai": "^3.0.21"
}
```

---

## 7. Integracao AG-UI (Pendente)

### 7.1 Situacao

O pacote `@ag-ui/mastra` existe no npm mas teve problemas de instalacao. A integracao oficial seguiria este padrao:

```typescript
import { MastraAgent } from "@ag-ui/mastra";
import { CopilotRuntime, ExperimentalEmptyAdapter } from "@copilotkit/runtime";

const runtime = new CopilotRuntime({
  agents: MastraAgent.getLocalAgents({ mastra }),
});
```

### 7.2 Alternativa Atual

Mantivemos os endpoints Mastra separados (`/api/mastra/*`) que funcionam corretamente. O CopilotKit continua usando direct-to-LLM com actions.

### 7.3 Proximo Passo

Quando o pacote `@ag-ui/mastra` estiver estavel:
1. Instalar `@ag-ui/mastra@latest`
2. Atualizar `/api/copilotkit/route.ts` para usar `MastraAgent.getLocalAgents()`
3. Remover endpoints `/api/mastra/*`

---

## 8. Proximos Passos

### 8.1 Imediato
- [x] CopilotKit funcionando com actions
- [x] Mastra funcionando com endpoints separados
- [x] Documentacao corrigida

### 8.2 Curto Prazo
- [ ] Testar fluxo completo com tenant CDF
- [ ] Atualizar pagina do agente para usar integration_type
- [ ] Criar interface admin para gerenciar ai_agents

### 8.3 Medio Prazo
- [ ] Revisitar integracao AG-UI quando pacote estiver estavel
- [ ] Implementar Human-in-the-Loop
- [ ] Adicionar Generative UI

---

## 9. Referencias

### Documentacao Oficial
- [CopilotKit Docs](https://docs.copilotkit.ai)
- [CopilotKit + Mastra](https://docs.copilotkit.ai/integrations/mastra/quickstart)
- [AG-UI Protocol](https://docs.copilotkit.ai/ag-ui-protocol)

### Repositorio de Referencia
- [CopilotKit/with-mastra](https://github.com/CopilotKit/with-mastra)

---

## 10. Conclusao

A implementacao esta funcional com:

1. **CopilotKit** usando direct-to-LLM com backend actions
2. **Mastra** como endpoints separados para quando precisar de agent framework
3. **Arquitetura multi-tenant** com tabela `ai_agents`

A integracao oficial via AG-UI protocol fica como item futuro quando o pacote `@ag-ui/mastra` estiver mais estavel.
