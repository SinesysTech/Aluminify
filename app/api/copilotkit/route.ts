import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { MastraAgent } from "@ag-ui/mastra";
import { NextRequest } from "next/server";

/**
 * CopilotKit Runtime API Route
 *
 * Este endpoint conecta o frontend CopilotKit aos agentes Mastra AI.
 *
 * Agentes disponíveis:
 * - student-agent: Para área logada do aluno
 * - institution-agent: Para área logada da instituição
 *
 * Configuração:
 * - MASTRA_SERVER_URL: URL do servidor Mastra (padrão: http://localhost:4111)
 */

// URL do servidor Mastra (Studio roda na porta 4111)
const MASTRA_SERVER_URL =
  process.env.MASTRA_SERVER_URL || "http://localhost:4111";

// Service adapter vazio - os agentes Mastra lidam com o LLM
const serviceAdapter = new ExperimentalEmptyAdapter();

export const POST = async (req: NextRequest) => {
  // Conecta aos agentes do servidor Mastra remoto
  const agents = await MastraAgent.getRemoteAgents({
    url: MASTRA_SERVER_URL,
  });

  const runtime = new CopilotRuntime({
    // @ts-expect-error - typing issue between packages
    agents,
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};

// Aumenta o timeout para streaming de respostas longas
export const maxDuration = 60;
