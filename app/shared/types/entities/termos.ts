/**
 * Tipos para o sistema de aceite de termos legais
 */

export const TIPO_DOCUMENTO_LEGAL = {
  TERMOS_USO: "termos_uso",
  POLITICA_PRIVACIDADE: "politica_privacidade",
  DPA: "dpa",
} as const;

export type TipoDocumentoLegal =
  (typeof TIPO_DOCUMENTO_LEGAL)[keyof typeof TIPO_DOCUMENTO_LEGAL];

/**
 * Versões vigentes dos documentos legais.
 * Atualizar aqui quando uma nova versão dos termos for publicada.
 * Mudança de versão = re-aceite obrigatório para todos os admins.
 */
export const TERMOS_VIGENTES: Record<TipoDocumentoLegal, string> = {
  termos_uso: "2.0",
  politica_privacidade: "2.0",
  dpa: "1.0",
} as const;

/**
 * Mapa de tipo de documento para o caminho do arquivo Markdown
 */
export const TERMOS_DOCUMENTO_PATH: Record<TipoDocumentoLegal, string> = {
  termos_uso: "docs/Aluminify_01_Termos_de_Uso.md",
  politica_privacidade: "docs/Aluminify_02_Politica_de_Privacidade.md",
  dpa: "docs/Aluminify_03_DPA_Acordo_Processamento_Dados.md",
};

/**
 * Labels amigáveis para exibição na UI
 */
export const TERMOS_LABELS: Record<TipoDocumentoLegal, string> = {
  termos_uso: "Termos de Uso",
  politica_privacidade: "Política de Privacidade",
  dpa: "Acordo de Processamento de Dados (DPA)",
};

export interface TermoAceite {
  id: string;
  usuarioId: string;
  empresaId: string;
  tipoDocumento: TipoDocumentoLegal;
  versao: string;
  ipAddress: string | null;
  userAgent: string | null;
  acceptedAt: string;
}

export interface TermoAceiteStatus {
  tipoDocumento: TipoDocumentoLegal;
  label: string;
  aceito: boolean;
  versaoAceita: string | null;
  versaoVigente: string;
  vigente: boolean;
}
