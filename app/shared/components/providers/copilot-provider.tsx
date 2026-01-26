"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { ReactNode } from "react";

interface CopilotProviderProps {
  children: ReactNode;
  /**
   * ID do agente a ser usado
   * - "student-agent": Para área do aluno
   * - "institution-agent": Para área da instituição
   */
  agentId?: string;
}

/**
 * Provider do CopilotKit para integração com Mastra AI
 *
 * Envolva os componentes que precisam de acesso ao Copilot com este provider.
 * O agentId determina qual agente será usado nas conversas.
 */
export function CopilotProvider({
  children,
  agentId = "student-agent",
}: CopilotProviderProps) {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      agent={agentId}
      showDevConsole={process.env.NODE_ENV === "development"}
    >
      {children}
    </CopilotKit>
  );
}
