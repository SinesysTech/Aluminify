# Guia de Implementação do CopilotKit (Self-Hosting)

Este guia documenta o passo a passo para implementar o CopilotKit em uma aplicação Next.js existente usando **Self-Hosting** com o `CopilotRuntime` e `OpenAIAdapter`.

## Visão Geral

O CopilotKit é uma plataforma open-source para criar aplicações AI-powered com interfaces de chat e agentes inteligentes. Ele oferece:

- **Componentes de UI prontos**: CopilotChat, CopilotSidebar, CopilotPopup
- **Hooks React**: para integrar estado da aplicação com o copilot
- **Backend Runtime**: para comunicação com LLMs (self-hosted)
- **Suporte a MCP (Model Context Protocol)**: para conectar com servidores MCP

## Pré-requisitos

- Next.js 14+ com App Router
- Node.js 18+
- Uma chave de API do OpenAI (ou outro LLM provider compatível)

---

## Passo 1: Instalação das Dependências

Instale os pacotes necessários:

```bash
# Pacotes do frontend (UI e hooks)
pnpm add @copilotkit/react-core @copilotkit/react-ui

# Pacotes do backend (runtime para self-hosting)
pnpm add @copilotkit/runtime
```

**Pacotes instalados:**

| Pacote | Descrição |
|--------|-----------|
| `@copilotkit/react-core` | Hooks e provider React (useCopilotReadable, useFrontendTool, etc.) |
| `@copilotkit/react-ui` | Componentes de UI (CopilotChat, CopilotSidebar, CopilotPopup) |
| `@copilotkit/runtime` | Backend runtime com adapters para LLMs (OpenAIAdapter, etc.) |

---

## Passo 2: Configurar Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
# Chave da API do OpenAI (obrigatório para Self-Hosting)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Modelo padrão (opcional, padrão: gpt-4o)
OPENAI_MODEL=gpt-4o

# Chave do Copilot Cloud para Observabilidade (opcional, mas recomendado)
# Obtida gratuitamente em https://cloud.copilotkit.ai
# Use publicLicenseKey para Self-Hosting com observabilidade
NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY=ck_pub_your_key_here
```

> **Nota**: O `OpenAIAdapter` usa automaticamente a variável `OPENAI_API_KEY` do ambiente.

> **Observabilidade**: Mesmo usando Self-Hosting, você pode obter gratuitamente uma `publicLicenseKey` no [Copilot Cloud](https://cloud.copilotkit.ai) para habilitar os hooks de observabilidade (analytics, tracking de eventos e erros).

---

## Passo 3: Criar o Backend Runtime (API Route)

Este é o componente central do Self-Hosting. Crie o endpoint que processará as requisições do CopilotKit.

### 3.1 Criar o Arquivo da Route API

Crie o arquivo `app/api/copilotkit/route.ts`:

```tsx
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

// ============================================
// 1. CONFIGURAR O ADAPTER DO LLM
// ============================================
// O OpenAIAdapter usa automaticamente process.env.OPENAI_API_KEY
const serviceAdapter = new OpenAIAdapter({
  // Configurações opcionais:
  // model: "gpt-4o",           // Modelo a ser usado (padrão: gpt-4o)
  // temperature: 0.7,          // Temperatura para respostas
});

// ============================================
// 2. CRIAR O COPILOT RUNTIME
// ============================================
const runtime = new CopilotRuntime({
  // Backend actions (ferramentas que rodam no servidor)
  actions: ({ properties, url }) => {
    // `properties` - propriedades customizadas enviadas do frontend
    // `url` - URL atual do frontend

    return [
      // Exemplo de backend action
      {
        name: "getServerTime",
        description: "Retorna a hora atual do servidor",
        parameters: [],
        handler: async () => {
          return { time: new Date().toISOString() };
        },
      },
    ];
  },
});

// ============================================
// 3. EXPORTAR O HANDLER POST
// ============================================
export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
```

### 3.2 Entendendo os Componentes

#### OpenAIAdapter

O `OpenAIAdapter` é responsável pela comunicação com a API do OpenAI:

```tsx
import { OpenAIAdapter } from "@copilotkit/runtime";

const serviceAdapter = new OpenAIAdapter({
  // Todas as opções são opcionais
  model: "gpt-4o",              // Modelo (padrão: gpt-4o)
  temperature: 0.7,             // Criatividade (0-2)
  // apiKey: "sk-...",          // Usa OPENAI_API_KEY por padrão
});
```

#### CopilotRuntime

O `CopilotRuntime` gerencia o estado, histórico de mensagens e actions:

```tsx
import { CopilotRuntime } from "@copilotkit/runtime";

const runtime = new CopilotRuntime({
  // Backend actions disponíveis para o Copilot
  actions: ({ properties, url }) => [...],

  // Para integração com MCP (opcional)
  createMCPClient: async (config) => {...},
});
```

#### copilotRuntimeNextJSAppRouterEndpoint

Helper para criar o endpoint compatível com Next.js App Router:

```tsx
const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,           // Instância do CopilotRuntime
  serviceAdapter,    // Adapter do LLM
  endpoint: "/api/copilotkit",  // Caminho do endpoint
});
```

---

## Passo 4: Configurar o CopilotKit Provider

### 4.1 Importar os Estilos

No seu `app/layout.tsx`, importe os estilos CSS do CopilotKit:

```tsx
import "@copilotkit/react-ui/styles.css";
```

### 4.2 Criar o Provider Component

Crie o arquivo `components/providers/copilotkit-provider.tsx`:

```tsx
"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { ReactNode } from "react";

interface CopilotKitProviderProps {
  children: ReactNode;
}

export function CopilotKitProvider({ children }: CopilotKitProviderProps) {
  return (
    <CopilotKit
      // URL do endpoint self-hosted (obrigatório)
      runtimeUrl="/api/copilotkit"

      // Chave para observabilidade (opcional, mas recomendado)
      // Use publicLicenseKey para Self-Hosting com observabilidade
      publicLicenseKey={process.env.NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY}

      // Mostrar console de debug em desenvolvimento
      showDevConsole={process.env.NODE_ENV === "development"}

      // Handler global de erros para observabilidade (opcional)
      onError={(errorEvent) => {
        if (process.env.NODE_ENV === "development") {
          console.error("[CopilotKit Error]", errorEvent);
        }
        // Em produção, envie para seu serviço de monitoramento:
        // Sentry.captureException(errorEvent.error, { extra: errorEvent.context });
      }}

      // Propriedades customizadas enviadas ao backend (opcional)
      // properties={{
      //   userId: "123",
      //   tenantId: "abc",
      // }}
    >
      {children}
    </CopilotKit>
  );
}
```

### 4.3 Adicionar o Provider ao Layout

No `app/layout.tsx`, envolva sua aplicação com o provider:

```tsx
import "@copilotkit/react-ui/styles.css";
import { CopilotKitProvider } from "@/components/providers/copilotkit-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <CopilotKitProvider>
          {children}
        </CopilotKitProvider>
      </body>
    </html>
  );
}
```

---

## Passo 5: Adicionar Componentes de Chat UI

O CopilotKit oferece três componentes de UI prontos. Todos compartilham a mesma base funcional, mas têm layouts diferentes.

### 5.1 CopilotChat (Flexível)

Componente flexível que pode ser colocado em qualquer lugar da página e redimensionado conforme necessário. Ideal para páginas dedicadas ao assistente.

```tsx
"use client";

import { CopilotChat } from "@copilotkit/react-ui";

export function ChatComponent() {
  return (
    <CopilotChat
      // Instruções de comportamento para a IA
      instructions="Você é o TobIAs, o assistente inteligente do sistema Aluminify.
        Ajude os usuários com dúvidas sobre pedidos, clientes, produtos e relatórios."

      // Labels customizados
      labels={{
        title: "TobIAs - Assistente Aluminify",
        initial: "Olá! Sou o TobIAs, seu assistente. Como posso ajudar você hoje?",
        placeholder: "Digite sua mensagem...",
        stopGenerating: "Parar",
        regenerateResponse: "Regenerar resposta",
      }}

      // Ícones customizados (opcional)
      icons={{
        sendIcon: <SendIcon />,
        stopIcon: <StopIcon />,
        regenerateIcon: <RefreshIcon />,
      }}

      // Classes CSS
      className="h-full w-full"

      // Hooks de observabilidade (requer publicLicenseKey)
      observabilityHooks={{
        onMessageSent: (message) => console.log("Mensagem:", message),
        onChatExpanded: () => console.log("Chat aberto"),
      }}
    />
  );
}
```

#### Props do CopilotChat

| Prop | Tipo | Descrição |
|------|------|-----------|
| `instructions` | `string` | Instruções de comportamento para a IA |
| `labels` | `object` | Customização de textos da interface |
| `icons` | `object` | Customização de ícones |
| `className` | `string` | Classes CSS adicionais |
| `makeSystemMessage` | `function` | Função para customizar a mensagem de sistema (avançado) |
| `observabilityHooks` | `object` | Hooks para tracking e analytics |

### 5.2 CopilotSidebar (Sidebar Colapsável)

Sidebar colapsável que envolve o conteúdo principal da aplicação. Ideal para uso em todo o app.

```tsx
"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";

export function AppWithSidebar({ children }: { children: React.ReactNode }) {
  return (
    <CopilotSidebar
      // Estado inicial da sidebar
      defaultOpen={false}

      // Instruções de comportamento
      instructions="Você é o assistente do sistema Aluminify.
        Ajude os usuários a navegar pelo sistema e responda dúvidas."

      // Labels customizados
      labels={{
        title: "Assistente",
        initial: "Como posso ajudar?",
        placeholder: "Pergunte algo...",
      }}

      // Fechar ao clicar fora (padrão: true)
      clickOutsideToClose={true}

      // Callback quando o estado muda
      onSetOpen={(open) => console.log("Sidebar:", open ? "aberta" : "fechada")}

      // Atalho de teclado para abrir/fechar (padrão: Cmd+Shift+C / Ctrl+Shift+C)
      shortcut="mod+shift+a"

      // Ícones customizados
      icons={{
        openIcon: <ChatIcon />,
        closeIcon: <CloseIcon />,
        headerCloseIcon: <XIcon />,
      }}

      // Classes CSS
      className="border-l"
    >
      {children}
    </CopilotSidebar>
  );
}
```

#### Props Específicas do CopilotSidebar

| Prop | Tipo | Descrição |
|------|------|-----------|
| `defaultOpen` | `boolean` | Se a sidebar inicia aberta (padrão: `false`) |
| `clickOutsideToClose` | `boolean` | Fecha ao clicar fora (padrão: `true`) |
| `onSetOpen` | `(open: boolean) => void` | Callback quando o estado muda |
| `shortcut` | `string` | Atalho de teclado (padrão: `mod+shift+c`) |
| `children` | `ReactNode` | Conteúdo principal envolvido pela sidebar |

### 5.3 CopilotPopup (Flutuante)

Botão flutuante no canto da tela que abre um popup de chat. Ideal para assistência contextual não intrusiva.

```tsx
"use client";

import { CopilotPopup } from "@copilotkit/react-ui";

export function AppWithPopup() {
  return (
    <>
      <YourMainContent />
      <CopilotPopup
        instructions="Você é um assistente útil. Responda de forma concisa."
        labels={{
          title: "Assistente",
          initial: "Precisa de ajuda?",
        }}

        // Estado inicial
        defaultOpen={false}

        // Fechar ao clicar fora
        clickOutsideToClose={true}

        // Atalho de teclado
        shortcut="mod+/"

        // Ícones do botão flutuante
        icons={{
          openIcon: <MessageCircleIcon />,
          closeIcon: <XIcon />,
        }}
      />
    </>
  );
}
```

### 5.4 Customização de Labels

Todos os componentes aceitam o objeto `labels` para customização:

```tsx
labels={{
  // Mensagem inicial exibida ao abrir o chat
  initial: "Olá! Como posso ajudar?",

  // Título do chat
  title: "Assistente Aluminify",

  // Placeholder do campo de input
  placeholder: "Digite sua mensagem...",

  // Texto do botão de parar geração
  stopGenerating: "Parar",

  // Texto do botão de regenerar
  regenerateResponse: "Regenerar",
}}
```

### 5.5 Customização de Ícones

Todos os componentes aceitam o objeto `icons` para customização:

```tsx
icons={{
  openIcon: <YourOpenIcon />,         // Ícone do botão abrir chat
  closeIcon: <YourCloseIcon />,       // Ícone do botão fechar chat
  headerCloseIcon: <YourXIcon />,     // Ícone de fechar no header
  sendIcon: <YourSendIcon />,         // Ícone do botão enviar
  activityIcon: <YourLoadingIcon />,  // Ícone de atividade/loading
  spinnerIcon: <YourSpinnerIcon />,   // Ícone de spinner
  stopIcon: <YourStopIcon />,         // Ícone do botão parar
  regenerateIcon: <YourRefreshIcon />,// Ícone do botão regenerar
  pushToTalkIcon: <YourMicIcon />,    // Ícone push-to-talk (voice)
}}
```

### 5.6 Customização via CSS Variables

A forma mais simples de personalizar cores é usando CSS variables:

```tsx
import { CopilotKitCSSProperties } from "@copilotkit/react-ui";

<div
  style={{
    "--copilot-kit-primary-color": "#3B82F6",
    "--copilot-kit-contrast-color": "#FFFFFF",
    "--copilot-kit-background-color": "#F8FAFC",
    "--copilot-kit-secondary-color": "#FFFFFF",
    "--copilot-kit-secondary-contrast-color": "#1E293B",
    "--copilot-kit-separator-color": "#E2E8F0",
    "--copilot-kit-muted-color": "#94A3B8",
  } as CopilotKitCSSProperties}
>
  <CopilotChat {...props} />
</div>
```

| CSS Variable | Descrição |
|--------------|-----------|
| `--copilot-kit-primary-color` | Cor principal (botões, elementos interativos) |
| `--copilot-kit-contrast-color` | Cor de contraste (texto sobre primary) |
| `--copilot-kit-background-color` | Cor de fundo principal |
| `--copilot-kit-secondary-color` | Cor secundária (cards, painéis) |
| `--copilot-kit-secondary-contrast-color` | Cor do texto principal |
| `--copilot-kit-separator-color` | Cor de bordas e divisores |
| `--copilot-kit-muted-color` | Cor de elementos inativos/desabilitados |

### 5.7 Customização via CSS Classes

Para customização mais avançada, use as classes CSS do CopilotKit:

```css
/* globals.css */

/* Container de mensagens */
.copilotKitMessages {
  padding: 1rem;
  font-family: "Inter", sans-serif;
}

/* Mensagens do usuário */
.copilotKitUserMessage {
  background: #3B82F6;
  color: white;
  border-radius: 1rem;
}

/* Mensagens do assistente */
.copilotKitAssistantMessage {
  background: #F1F5F9;
  border-radius: 1rem;
}

/* Campo de input */
.copilotKitInput {
  border-radius: 0.5rem;
  border: 1px solid #E2E8F0;
}

/* Header do chat */
.copilotKitHeader {
  background: #1E293B;
  color: white;
}

/* Botão flutuante (Popup/Sidebar) */
.copilotKitButton {
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### 5.8 Headless UI (Totalmente Customizado)

Para controle total sobre a UI, use o hook `useCopilotChat`:

```tsx
"use client";

import { useCopilotChat } from "@copilotkit/react-core";

export function CustomChatInterface() {
  const {
    visibleMessages,  // Array de mensagens visíveis
    appendMessage,    // Função para enviar mensagem
    setMessages,      // Função para definir mensagens
    deleteMessage,    // Função para deletar mensagem
    reloadMessages,   // Função para recarregar mensagens
    stopGeneration,   // Função para parar geração
    isLoading,        // Boolean indicando se está carregando
  } = useCopilotChat();

  const handleSend = (content: string) => {
    appendMessage({
      role: "user",
      content,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Lista de mensagens */}
      <div className="flex-1 overflow-y-auto p-4">
        {visibleMessages.map((message) => (
          <div
            key={message.id}
            className={message.role === "user" ? "text-right" : "text-left"}
          >
            <div className={`inline-block p-3 rounded-lg ${
              message.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-100"
            }`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("message") as HTMLInputElement;
          handleSend(input.value);
          input.value = "";
        }}
        className="p-4 border-t"
      >
        <input
          name="message"
          placeholder="Digite sua mensagem..."
          className="w-full p-2 border rounded"
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
```

### 5.9 Sub-Componentes Customizados

Você pode substituir sub-componentes individuais mantendo a estrutura base:

```tsx
import { CopilotChat } from "@copilotkit/react-ui";

// Componente customizado para mensagem do usuário
function CustomUserMessage({ message }) {
  return (
    <div className="flex items-start gap-2 justify-end">
      <div className="bg-blue-500 text-white p-3 rounded-lg max-w-[80%]">
        {message.content}
      </div>
      <Avatar src="/user-avatar.png" />
    </div>
  );
}

// Componente customizado para mensagem do assistente
function CustomAssistantMessage({ message }) {
  return (
    <div className="flex items-start gap-2">
      <Avatar src="/bot-avatar.png" />
      <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
        {message.content || message.generativeUI}
      </div>
    </div>
  );
}

// Uso
<CopilotChat
  instructions="..."
  UserMessage={CustomUserMessage}
  AssistantMessage={CustomAssistantMessage}
/>
```

| Sub-Componente | Descrição |
|----------------|-----------|
| `UserMessage` | Renderiza mensagens do usuário |
| `AssistantMessage` | Renderiza mensagens da IA |
| `Window` | Container principal do chat |
| `Button` | Botão que abre/fecha o chat |
| `Header` | Cabeçalho do chat |
| `Messages` | Container da lista de mensagens |
| `Input` | Campo de entrada de texto |
| `Suggestions` | Sugestões de mensagens |

---

## Passo 6: Integrar Estado da Aplicação

### 6.1 useCopilotReadable

Permite que o Copilot tenha conhecimento do estado atual da aplicação:

```tsx
"use client";

import { useCopilotReadable } from "@copilotkit/react-core";
import { useState } from "react";

export function OrdersList() {
  const [orders, setOrders] = useState([
    { id: 1, client: "Cliente A", status: "pendente" },
    { id: 2, client: "Cliente B", status: "aprovado" },
  ]);

  // Disponibilizar estado para o Copilot
  useCopilotReadable({
    description: "Lista de pedidos ativos no sistema",
    value: orders,
  });

  return (
    <ul>
      {orders.map((order) => (
        <li key={order.id}>
          {order.client} - {order.status}
        </li>
      ))}
    </ul>
  );
}
```

### 6.2 useCopilotReadable com Hierarquia

Para dados aninhados:

```tsx
"use client";

import { useCopilotReadable } from "@copilotkit/react-core";

function OrderItem({ order }) {
  // Contexto pai
  const orderContextId = useCopilotReadable({
    description: `Pedido #${order.id}`,
    value: order.client,
  });

  // Contextos filhos vinculados ao pai
  useCopilotReadable({
    description: "Status do pedido",
    value: order.status,
    parentId: orderContextId,
  });

  useCopilotReadable({
    description: "Itens do pedido",
    value: order.items,
    parentId: orderContextId,
  });

  return <div>{/* render */}</div>;
}
```

### 6.3 useCopilotAdditionalInstructions

Adiciona instruções contextuais baseadas na página atual:

```tsx
"use client";

import { useCopilotAdditionalInstructions } from "@copilotkit/react-core";

export function SettingsPage() {
  useCopilotAdditionalInstructions({
    instructions: `
      O usuário está na página de configurações.
      Foque em ajudá-lo com:
      - Configurações de perfil
      - Preferências de notificação
      - Configurações de segurança
    `,
    available: "enabled",
  });

  return <div>Configurações</div>;
}
```

---

## Passo 7: Criar Frontend Tools

### 7.1 useFrontendTool

Permite que o Copilot execute ações no frontend:

```tsx
"use client";

import { useFrontendTool } from "@copilotkit/react-core";
import { useState } from "react";

export function OrderManager() {
  const [orders, setOrders] = useState([]);

  // Tool para criar novo pedido
  useFrontendTool({
    name: "createOrder",
    description: "Cria um novo pedido no sistema",
    parameters: [
      {
        name: "clientName",
        type: "string",
        description: "Nome do cliente",
        required: true,
      },
      {
        name: "items",
        type: "string[]",
        description: "Lista de itens do pedido",
        required: true,
      },
    ],
    handler: async ({ clientName, items }) => {
      const newOrder = {
        id: Date.now(),
        client: clientName,
        items,
        status: "pendente",
      };
      setOrders((prev) => [...prev, newOrder]);
      return `Pedido criado para ${clientName} com ${items.length} itens.`;
    },
  });

  // Tool para atualizar status
  useFrontendTool({
    name: "updateOrderStatus",
    description: "Atualiza o status de um pedido",
    parameters: [
      {
        name: "orderId",
        type: "number",
        description: "ID do pedido",
        required: true,
      },
      {
        name: "newStatus",
        type: "string",
        description: "Novo status (pendente, aprovado, finalizado)",
        required: true,
      },
    ],
    handler: async ({ orderId, newStatus }) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      return `Status do pedido #${orderId} atualizado para ${newStatus}.`;
    },
  });

  return (
    <ul>
      {orders.map((order) => (
        <li key={order.id}>
          #{order.id} - {order.client} - {order.status}
        </li>
      ))}
    </ul>
  );
}
```

---

## Passo 8: Criar Backend Actions

Backend actions rodam no servidor e têm acesso a recursos seguros (banco de dados, APIs externas, etc.).

### 8.1 Definir Actions no Runtime

No arquivo `app/api/copilotkit/route.ts`:

```tsx
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

const serviceAdapter = new OpenAIAdapter();

const runtime = new CopilotRuntime({
  actions: ({ properties, url }) => {
    return [
      // Action para buscar dados do banco
      {
        name: "fetchClientOrders",
        description: "Busca todos os pedidos de um cliente específico",
        parameters: [
          {
            name: "clientId",
            type: "string",
            description: "ID do cliente",
            required: true,
          },
        ],
        handler: async ({ clientId }: { clientId: string }) => {
          // Aqui você conecta ao seu banco de dados
          // const orders = await prisma.order.findMany({
          //   where: { clientId },
          // });

          // Exemplo mockado:
          const orders = [
            { id: 1, product: "Produto A", quantity: 10 },
            { id: 2, product: "Produto B", quantity: 5 },
          ];

          return {
            clientId,
            orders,
            total: orders.length,
          };
        },
      },

      // Action para gerar relatório
      {
        name: "generateSalesReport",
        description: "Gera um relatório de vendas para um período",
        parameters: [
          {
            name: "startDate",
            type: "string",
            description: "Data inicial (YYYY-MM-DD)",
            required: true,
          },
          {
            name: "endDate",
            type: "string",
            description: "Data final (YYYY-MM-DD)",
            required: true,
          },
        ],
        handler: async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
          // Implementar lógica de relatório
          return {
            period: `${startDate} a ${endDate}`,
            totalSales: 150000,
            orderCount: 45,
            topProducts: ["Produto A", "Produto B", "Produto C"],
          };
        },
      },
    ];
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
```

### 8.2 Actions Dinâmicas Baseadas em URL/Properties

```tsx
const runtime = new CopilotRuntime({
  actions: ({ properties, url }) => {
    const actions = [];

    // Actions específicas para a página de pedidos
    if (url.includes("/orders")) {
      actions.push({
        name: "searchOrders",
        description: "Busca pedidos com filtros",
        parameters: [...],
        handler: async (params) => {...},
      });
    }

    // Actions específicas para admin
    if (properties?.role === "admin") {
      actions.push({
        name: "deleteUser",
        description: "Remove um usuário do sistema",
        parameters: [...],
        handler: async (params) => {...},
      });
    }

    return actions;
  },
});
```

---

## Passo 9: Generative UI (Opcional)

Renderiza componentes React customizados dentro do chat.

### 9.1 useRenderToolCall

```tsx
"use client";

import { useRenderToolCall } from "@copilotkit/react-core";

export function ToolRenderer() {
  useRenderToolCall({
    name: "showOrderCard",
    description: "Mostra um card com informações do pedido",
    parameters: [
      { name: "orderId", type: "number", required: true },
      { name: "client", type: "string", required: true },
      { name: "status", type: "string", required: true },
      { name: "total", type: "number", required: true },
    ],
    render: ({ status, args }) => {
      // status pode ser: "inProgress", "executing", "complete"
      if (status === "inProgress") {
        return (
          <div className="animate-pulse bg-gray-200 p-4 rounded">
            Carregando pedido...
          </div>
        );
      }

      return (
        <div className="p-4 border rounded shadow">
          <h3 className="font-bold">Pedido #{args.orderId}</h3>
          <p>Cliente: {args.client}</p>
          <p>Status: {args.status}</p>
          <p className="font-bold">Total: R$ {args.total.toFixed(2)}</p>
        </div>
      );
    },
  });

  return null;
}
```

---

## Passo 10: Human in the Loop (HITL)

Para interações que precisam de confirmação do usuário antes de executar.

### useHumanInTheLoop

```tsx
"use client";

import { useHumanInTheLoop } from "@copilotkit/react-core";

export function DeleteConfirmation() {
  useHumanInTheLoop({
    name: "confirmDeletion",
    description: "Pede confirmação antes de deletar um item",
    parameters: [
      {
        name: "itemType",
        type: "string",
        description: "Tipo do item (pedido, cliente, produto)",
        required: true,
      },
      {
        name: "itemId",
        type: "string",
        description: "ID do item",
        required: true,
      },
      {
        name: "itemName",
        type: "string",
        description: "Nome do item para exibição",
        required: true,
      },
    ],
    render: ({ args, status, respond }) => {
      if (status === "executing" && respond) {
        return (
          <div className="p-4 border border-red-300 rounded bg-red-50">
            <p className="text-red-800 font-medium">
              Tem certeza que deseja deletar o {args.itemType} "{args.itemName}" (ID: {args.itemId})?
            </p>
            <p className="text-red-600 text-sm mt-1">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => respond({ confirmed: true, itemId: args.itemId })}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Sim, Deletar
              </button>
              <button
                onClick={() => respond({ confirmed: false })}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        );
      }

      if (status === "complete") {
        return (
          <div className="text-sm text-gray-500">
            Ação processada.
          </div>
        );
      }

      return null;
    },
  });

  return null;
}
```

---

## Passo 11: Observabilidade (Opcional, mas Recomendado)

O CopilotKit oferece recursos de observabilidade para monitorar interações do usuário, eventos do chat e erros do sistema. **Mesmo usando Self-Hosting**, você pode habilitar observabilidade através de uma chave gratuita do Copilot Cloud.

### 11.1 Obter a Chave de Observabilidade

1. Acesse [https://cloud.copilotkit.ai](https://cloud.copilotkit.ai) (gratuito)
2. Crie uma conta ou faça login
3. Obtenha sua `publicLicenseKey` (formato: `ck_pub_...`)
4. Adicione ao `.env.local`: `NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY=ck_pub_your_key`

> **Importante**: Os hooks de observabilidade **não funcionam** sem uma chave válida. Esta é uma medida de segurança para garantir que os hooks só funcionem em aplicações autorizadas.

### 11.2 Observability Hooks no CopilotChat

Os componentes de UI (`CopilotChat`, `CopilotSidebar`, `CopilotPopup`) aceitam um objeto `observabilityHooks`:

```tsx
"use client";

import { CopilotChat } from "@copilotkit/react-ui";

export function ChatWithObservability() {
  return (
    <CopilotChat
      instructions="Você é o assistente Aluminify"
      observabilityHooks={{
        // Quando o usuário envia uma mensagem
        onMessageSent: (message) => {
          console.log("Mensagem enviada:", message);
          // analytics.track("chat_message_sent", { message });
        },

        // Quando o chat é expandido/aberto
        onChatExpanded: () => {
          console.log("Chat expandido");
          // analytics.track("chat_expanded");
        },

        // Quando o chat é minimizado/fechado
        onChatMinimized: () => {
          console.log("Chat minimizado");
          // analytics.track("chat_minimized");
        },

        // Quando o usuário regenera uma resposta
        onMessageRegenerated: (messageId) => {
          console.log("Mensagem regenerada:", messageId);
          // analytics.track("message_regenerated", { messageId });
        },

        // Quando o usuário copia uma mensagem
        onMessageCopied: (content) => {
          console.log("Mensagem copiada, tamanho:", content.length);
          // analytics.track("message_copied", { contentLength: content.length });
        },

        // Quando o usuário dá feedback (thumbs up/down)
        onFeedbackGiven: (messageId, type) => {
          console.log("Feedback:", type, "para mensagem:", messageId);
          // analytics.track("feedback_given", { messageId, type });
        },

        // Quando a geração de resposta começa
        onChatStarted: () => {
          console.log("IA começou a responder");
          // analytics.track("generation_started");
        },

        // Quando a geração de resposta termina
        onChatStopped: () => {
          console.log("IA terminou de responder");
          // analytics.track("generation_stopped");
        },

        // Quando ocorre um erro no chat
        onError: (errorEvent) => {
          console.error("Erro no chat:", errorEvent);
          // Sentry.captureException(errorEvent);
        },
      }}
    />
  );
}
```

### 11.3 Error Observability no Provider

Além dos hooks do chat, você pode capturar erros globais no `CopilotKit` provider:

```tsx
"use client";

import { CopilotKit } from "@copilotkit/react-core";

export function CopilotKitProviderWithErrorTracking({ children }) {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      publicLicenseKey={process.env.NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY}
      showDevConsole={process.env.NODE_ENV === "development"}
      onError={(errorEvent) => {
        // Estrutura do errorEvent:
        // {
        //   type: "error" | "request" | "response" | "agent_state" | "action" | "message" | "performance",
        //   timestamp: number,
        //   context: {
        //     source: "ui" | "runtime" | "agent",
        //     request?: { operation, method, url, startTime },
        //     response?: { endTime, latency },
        //     agent?: { name, nodeName },
        //     messages?: { input, messageCount },
        //     technical?: { environment, stackTrace },
        //   },
        //   error?: any,
        // }

        if (errorEvent.type === "error") {
          console.error("[CopilotKit Error]", {
            type: errorEvent.type,
            timestamp: new Date(errorEvent.timestamp).toISOString(),
            source: errorEvent.context.source,
            error: errorEvent.error,
          });

          // Integração com Sentry (exemplo)
          // Sentry.captureException(errorEvent.error, {
          //   tags: { source: errorEvent.context.source },
          //   extra: { context: errorEvent.context },
          // });

          // Integração com analytics
          // analytics.track("copilotkit_error", {
          //   type: errorEvent.type,
          //   source: errorEvent.context.source,
          //   latency: errorEvent.context.response?.latency,
          // });
        }
      }}
    >
      {children}
    </CopilotKit>
  );
}
```

### 11.4 Hooks de Observabilidade Disponíveis

| Hook | Descrição | Parâmetros |
|------|-----------|------------|
| `onMessageSent` | Usuário envia mensagem | `message: string` |
| `onChatExpanded` | Chat é aberto/expandido | - |
| `onChatMinimized` | Chat é fechado/minimizado | - |
| `onMessageRegenerated` | Mensagem é regenerada | `messageId: string` |
| `onMessageCopied` | Mensagem é copiada | `content: string` |
| `onFeedbackGiven` | Feedback (thumbs up/down) | `messageId: string, type: "up" \| "down"` |
| `onChatStarted` | IA começa a gerar resposta | - |
| `onChatStopped` | IA termina de gerar resposta | - |
| `onError` | Erro ocorre no chat | `errorEvent: CopilotErrorEvent` |

### 11.5 Configuração para Produção

```tsx
// Configuração completa para ambiente de produção
<CopilotKit
  runtimeUrl="/api/copilotkit"
  publicLicenseKey={process.env.NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY}
  showDevConsole={false} // Esconder em produção
  onError={(errorEvent) => {
    // Log para sistema de monitoramento
    if (errorEvent.type === "error") {
      logger.error("CopilotKit Error", {
        error: errorEvent.error,
        context: errorEvent.context,
        timestamp: errorEvent.timestamp,
      });

      // Enviar para serviço de monitoramento
      monitoring.captureError(errorEvent.error, {
        extra: errorEvent.context,
      });
    }
  }}
>
  <CopilotChat
    observabilityHooks={{
      onMessageSent: (message) => {
        analytics.track("chat_message_sent", {
          messageLength: message.length,
          userId: getCurrentUserId(),
        });
      },
      onFeedbackGiven: (messageId, type) => {
        analytics.track("chat_feedback", { messageId, type });
      },
    }}
  />
</CopilotKit>
```

---

## Estrutura de Arquivos Recomendada

```
src/
├── app/
│   ├── api/
│   │   └── copilotkit/
│   │       └── route.ts              # Backend runtime (OBRIGATÓRIO)
│   ├── layout.tsx                    # Provider + styles import
│   └── (pages)/
│       └── chat/
│           └── page.tsx              # Página com chat
├── components/
│   ├── providers/
│   │   └── copilotkit-provider.tsx   # CopilotKit provider
│   ├── copilot/
│   │   ├── chat-interface.tsx        # Componente de chat
│   │   ├── tool-renderer.tsx         # Generative UI components
│   │   └── context-providers.tsx     # useCopilotReadable hooks
│   └── ui/
│       └── ...
└── lib/
    └── copilot/
        └── actions.ts                # Helpers para actions
```

---

## Troubleshooting

### Erro: "CopilotKit's Remote Endpoint not found"

- Verifique se o arquivo `app/api/copilotkit/route.ts` existe
- Confirme que o endpoint está acessível: `curl -X POST http://localhost:3000/api/copilotkit`
- Verifique que `runtimeUrl="/api/copilotkit"` está correto no provider

### Erro: "OPENAI_API_KEY not configured"

- Confirme que `OPENAI_API_KEY` está no `.env.local`
- Reinicie o servidor de desenvolvimento após adicionar a variável

### Dev Console não aparece

- Confirme `showDevConsole={true}` no provider
- Verifique se não há erros no console do navegador

### Hooks não funcionam

- Certifique-se de usar `"use client"` no topo do arquivo
- Confirme que o componente está dentro do `CopilotKitProvider`

### Backend actions não são chamadas

- Verifique se a action está retornada no array de `actions`
- Confirme que a descrição da action está clara para o LLM entender quando usá-la

### Observability hooks não disparam

- Confirme que você tem uma `publicLicenseKey` válida configurada
- Obtenha sua chave gratuita em [https://cloud.copilotkit.ai](https://cloud.copilotkit.ai)
- Verifique se a variável `NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY` está no `.env.local`
- Os hooks **não funcionam** sem uma chave válida (medida de segurança)

---

## Recursos Adicionais

- [Documentação Oficial](https://docs.copilotkit.ai)
- [GitHub CopilotKit](https://github.com/CopilotKit/CopilotKit)
- [Self-Hosting Guide](https://docs.copilotkit.ai/guides/self-hosting)
- [Observability Guide](https://docs.copilotkit.ai/adk/premium/observability) - Guia completo de observabilidade
- [Copilot Cloud Dashboard](https://cloud.copilotkit.ai) - Obtenha sua chave de observabilidade gratuita
- [Discord CopilotKit](https://discord.com/invite/6dffbvGU3D)

---

## Notas para o Aluminify

### Integração com Mastra (Opcional)

O CopilotKit tem integração nativa com Mastra. Se decidirmos usar agentes Mastra como backend:

```tsx
// Ver: https://mastra.ai/docs/frameworks/agentic-uis/copilotkit
```

### Considerações de UX

1. **CopilotPopup**: Ideal para assistência contextual sem ocupar espaço permanente
2. **CopilotSidebar**: Bom para conversas mais longas e análises detalhadas
3. **CopilotChat**: Para páginas dedicadas ao assistente (ex: página TobIAs)

### Backend Actions Sugeridas para o ERP

- `searchOrders` - Buscar pedidos com filtros
- `getClientInfo` - Obter informações de cliente
- `generateReport` - Gerar relatórios
- `checkInventory` - Verificar estoque
- `calculateQuote` - Calcular orçamentos

### Próximos Passos Sugeridos

1. Criar o endpoint `/api/copilotkit/route.ts`
2. Configurar o provider no layout
3. Implementar na página do TobIAs com `CopilotChat`
4. Definir as backend actions necessárias para o contexto do ERP
5. Implementar `useCopilotReadable` para dados relevantes de cada página
