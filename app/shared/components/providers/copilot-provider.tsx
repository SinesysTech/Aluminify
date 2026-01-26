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

const MASTRA_SERVER_URL =
  process.env.NEXT_PUBLIC_MASTRA_SERVER_URL || "http://localhost:4111";

const RUNTIME_URLS = {
  student: `${MASTRA_SERVER_URL}/copilot/student`,
  institution: `${MASTRA_SERVER_URL}/copilot/institution`,
};

/**
 * Provider do CopilotKit para integração com Mastra AI
 *
 * Usa CopilotKit Cloud (publicApiKey) + Mastra Server (runtimeUrl)
 */
export function CopilotProvider({
  children,
  context = "student",
}: CopilotProviderProps) {
  return (
    <CopilotKit
      publicApiKey={COPILOTKIT_PUBLIC_KEY}
      runtimeUrl={RUNTIME_URLS[context]}
      showDevConsole={process.env.NODE_ENV === "development"}
    >
      {children}
    </CopilotKit>
  );
}
