"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { ReactNode } from "react";

interface CopilotProviderProps {
  children: ReactNode;
  /**
   * Contexto do usuário para selecionar o agente correto
   * - "student": Para área do aluno
   * - "institution": Para área da instituição
   */
  context?: "student" | "institution";
}

const COPILOTKIT_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_COPILOTKIT_PUBLIC_KEY || "ck_pub_b5b202514d1736f9e6f6675a87238818";

const AGENT_IDS = {
  student: "studentAgent",
  institution: "institutionAgent",
};

/**
 * Provider do CopilotKit para integração com Mastra AI
 *
 * Usa CopilotKit Cloud + rota API local que conecta ao Mastra
 */
export function CopilotProvider({
  children,
  context = "student",
}: CopilotProviderProps) {
  return (
    <CopilotKit
      publicApiKey={COPILOTKIT_PUBLIC_KEY}
      runtimeUrl="/api/copilotkit"
      agent={AGENT_IDS[context]}
      showDevConsole={process.env.NODE_ENV === "development"}
    >
      {children}
    </CopilotKit>
  );
}
