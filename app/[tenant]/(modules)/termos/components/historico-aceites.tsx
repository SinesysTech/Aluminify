import {
  TERMOS_LABELS,
  type TermoAceite,
  type TipoDocumentoLegal,
} from "@/app/shared/types/entities/termos";

interface HistoricoAceitesProps {
  historico: TermoAceite[];
  adminsMap: Record<string, string>;
}

export function HistoricoAceites({
  historico,
  adminsMap,
}: HistoricoAceitesProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Documento</th>
            <th className="text-left px-4 py-3 font-medium">Versão</th>
            <th className="text-left px-4 py-3 font-medium">Admin</th>
            <th className="text-left px-4 py-3 font-medium">Data</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {historico.map((aceite) => (
            <tr key={aceite.id}>
              <td className="px-4 py-3">
                {TERMOS_LABELS[aceite.tipoDocumento as TipoDocumentoLegal] ??
                  aceite.tipoDocumento}
              </td>
              <td className="px-4 py-3 font-mono text-xs">
                v{aceite.versao}
              </td>
              <td className="px-4 py-3">
                {adminsMap[aceite.usuarioId] ?? aceite.usuarioId}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(aceite.acceptedAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
