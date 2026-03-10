/**
 * Testes para tipos e constantes de termos legais
 */

import { describe, it, expect } from "@jest/globals";
import {
  TERMOS_VIGENTES,
  TERMOS_LABELS,
  TERMOS_DOCUMENTO_PATH,
  TIPO_DOCUMENTO_LEGAL,
  type TipoDocumentoLegal,
} from "@/app/shared/types/entities/termos";
import * as fs from "fs";
import * as path from "path";

describe("Termos Types & Constants", () => {
  describe("TIPO_DOCUMENTO_LEGAL", () => {
    it("deve ter os 3 tipos de documento", () => {
      expect(TIPO_DOCUMENTO_LEGAL.TERMOS_USO).toBe("termos_uso");
      expect(TIPO_DOCUMENTO_LEGAL.POLITICA_PRIVACIDADE).toBe(
        "politica_privacidade",
      );
      expect(TIPO_DOCUMENTO_LEGAL.DPA).toBe("dpa");
    });
  });

  describe("TERMOS_VIGENTES", () => {
    it("deve ter versão definida para cada tipo de documento", () => {
      const tipos: TipoDocumentoLegal[] = [
        "termos_uso",
        "politica_privacidade",
        "dpa",
      ];

      for (const tipo of tipos) {
        expect(TERMOS_VIGENTES[tipo]).toBeDefined();
        expect(typeof TERMOS_VIGENTES[tipo]).toBe("string");
        expect(TERMOS_VIGENTES[tipo].length).toBeGreaterThan(0);
      }
    });

    it("deve ter versões no formato esperado (X.Y)", () => {
      for (const versao of Object.values(TERMOS_VIGENTES)) {
        expect(versao).toMatch(/^\d+\.\d+$/);
      }
    });
  });

  describe("TERMOS_LABELS", () => {
    it("deve ter label para cada tipo de documento", () => {
      expect(TERMOS_LABELS.termos_uso).toBe("Termos de Uso");
      expect(TERMOS_LABELS.politica_privacidade).toBe(
        "Política de Privacidade",
      );
      expect(TERMOS_LABELS.dpa).toBe(
        "Acordo de Processamento de Dados (DPA)",
      );
    });
  });

  describe("TERMOS_DOCUMENTO_PATH", () => {
    it("deve ter path para cada tipo de documento", () => {
      const tipos: TipoDocumentoLegal[] = [
        "termos_uso",
        "politica_privacidade",
        "dpa",
      ];

      for (const tipo of tipos) {
        expect(TERMOS_DOCUMENTO_PATH[tipo]).toBeDefined();
        expect(TERMOS_DOCUMENTO_PATH[tipo]).toMatch(/^docs\/.*\.md$/);
      }
    });

    it("os arquivos Markdown devem existir no disco", () => {
      for (const [_tipo, relativePath] of Object.entries(
        TERMOS_DOCUMENTO_PATH,
      )) {
        const absolutePath = path.join(process.cwd(), relativePath);
        expect(fs.existsSync(absolutePath)).toBe(true);
      }
    });
  });
});
