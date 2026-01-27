import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { getLocalAgents } from "@ag-ui/mastra";
import { NextRequest } from "next/server";
import { mastra } from "@/mastra";

/**
 * CopilotKit Runtime API Route - Integrado com Mastra
 *
 * Este endpoint conecta CopilotKit aos agentes Mastra diretamente no Next.js.
 *
 * Uso no frontend:
 * <CopilotKit runtimeUrl="/api/copilotkit" agent="studentAgent">
 *   <CopilotChat />
 * </CopilotKit>
 *
 * Agentes disponíveis:
 * - studentAgent: Assistente para área do aluno
 * - institutionAgent: Assistente para área administrativa
 */

export const POST = async (req: NextRequest) => {
  // Get all Mastra agents as AG-UI compatible agents
  const agents = getLocalAgents({ mastra });

  const runtime = new CopilotRuntime({
    agents,
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};

// Aumenta o timeout para streaming de respostas longas
export const maxDuration = 60;
