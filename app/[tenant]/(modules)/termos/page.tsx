import { requireUser } from "@/app/shared/core/auth";
import { LegalDocumentViewer } from "@/app/shared/components/legal-document-viewer";
import { consultarHistoricoAceites } from "@/app/shared/core/services/termos/termos.service";
import { getDatabaseClient } from "@/app/shared/core/database/database";
import { TERMOS_LABELS, type TipoDocumentoLegal } from "@/app/shared/types/entities/termos";
import { TermosTabs } from "./components/termos-tabs";
import { HistoricoAceites } from "./components/historico-aceites";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos e Políticas",
};

const DOCUMENTOS: TipoDocumentoLegal[] = [
  "termos_uso",
  "politica_privacidade",
  "dpa",
];

export default async function TermosPage() {
  const user = await requireUser();

  const documentosContent = await Promise.all(
    DOCUMENTOS.map(async (tipo) => ({
      tipo,
      label: TERMOS_LABELS[tipo],
      content: <LegalDocumentViewer tipo={tipo} />,
    })),
  );

  // Para admins, buscar histórico de aceites do tenant
  let historico: Awaited<ReturnType<typeof consultarHistoricoAceites>> = [];
  let adminsMap: Record<string, string> = {};

  if ((user.isAdmin || user.isOwner) && user.empresaId) {
    historico = await consultarHistoricoAceites(user.empresaId);

    // Buscar nomes dos admins que aceitaram
    const adminIds = [...new Set(historico.map((h) => h.usuarioId))];
    if (adminIds.length > 0) {
      const adminClient = getDatabaseClient();
      const { data: admins } = await adminClient
        .from("usuarios")
        .select("id, nome_completo")
        .in("id", adminIds);

      adminsMap = (admins ?? []).reduce(
        (acc, a) => {
          acc[a.id] = a.nome_completo || a.id;
          return acc;
        },
        {} as Record<string, string>,
      );
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Termos e Políticas</h1>

      <TermosTabs documentos={documentosContent} />

      {(user.isAdmin || user.isOwner) && historico.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Histórico de Aceites</h2>
          <HistoricoAceites historico={historico} adminsMap={adminsMap} />
        </div>
      )}
    </div>
  );
}
