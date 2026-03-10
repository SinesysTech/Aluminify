/**
 * Testes para o serviço de termos legais
 *
 * Testa a lógica de negócio de aceite de termos usando mocks do Supabase.
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { TERMOS_VIGENTES } from "@/app/shared/types/entities/termos";

// Mock do cacheService
const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();
const mockCacheDel = jest.fn();
const mockCacheGetOrSet = jest.fn();

jest.mock("@/app/shared/core/services/cache/cache.service", () => ({
  cacheService: {
    get: (...args: unknown[]) => mockCacheGet(...args),
    set: (...args: unknown[]) => mockCacheSet(...args),
    del: (...args: unknown[]) => mockCacheDel(...args),
    getOrSet: (...args: unknown[]) => mockCacheGetOrSet(...args),
  },
}));

// Mock do database client
const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();

jest.mock("@/app/shared/core/database/database", () => ({
  getDatabaseClient: () => ({
    from: (...args: unknown[]) => {
      mockFrom(...args);
      return {
        insert: (...insertArgs: unknown[]) => {
          mockInsert(...insertArgs);
          return { error: null };
        },
        select: (...selectArgs: unknown[]) => {
          mockSelect(...selectArgs);
          return {
            eq: (...eqArgs: unknown[]) => {
              mockEq(...eqArgs);
              return {
                eq: (...eq2Args: unknown[]) => {
                  mockEq(...eq2Args);
                  return {
                    order: (...orderArgs: unknown[]) => {
                      mockOrder(...orderArgs);
                      return { data: [], error: null };
                    },
                  };
                },
                order: (...orderArgs: unknown[]) => {
                  mockOrder(...orderArgs);
                  return { data: [], error: null };
                },
              };
            },
          };
        },
      };
    },
  }),
}));

describe("Termos Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Para getOrSet, executar o fetcher
    mockCacheGetOrSet.mockImplementation(
      async (_key: string, fetcher: () => Promise<unknown>) => fetcher(),
    );
  });

  describe("registrarAceite", () => {
    it("deve inserir 3 registros (um para cada documento)", async () => {
      const {
        registrarAceite,
      } = require("@/app/shared/core/services/termos/termos.service");

      await registrarAceite({
        usuarioId: "user-123",
        empresaId: "empresa-456",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      });

      expect(mockFrom).toHaveBeenCalledWith("termos_aceite");
      expect(mockInsert).toHaveBeenCalledTimes(1);

      const insertedRows = mockInsert.mock.calls[0][0];
      expect(insertedRows).toHaveLength(3);
      expect(insertedRows.map((r: { tipo_documento: string }) => r.tipo_documento).sort()).toEqual([
        "dpa",
        "politica_privacidade",
        "termos_uso",
      ]);

      // Verificar que cada row tem a versão vigente correta
      for (const row of insertedRows) {
        expect(row.versao).toBe(
          TERMOS_VIGENTES[row.tipo_documento as keyof typeof TERMOS_VIGENTES],
        );
        expect(row.usuario_id).toBe("user-123");
        expect(row.empresa_id).toBe("empresa-456");
        expect(row.ip_address).toBe("192.168.1.1");
        expect(row.user_agent).toBe("Mozilla/5.0");
      }
    });

    it("deve invalidar o cache após o aceite", async () => {
      const {
        registrarAceite,
      } = require("@/app/shared/core/services/termos/termos.service");

      await registrarAceite({
        usuarioId: "user-123",
        empresaId: "empresa-456",
      });

      expect(mockCacheDel).toHaveBeenCalledWith(
        "termos:aceite:user-123:empresa-456",
      );
    });
  });

  describe("consultarStatusAceite", () => {
    it("deve retornar status para todos os 3 documentos", async () => {
      const {
        consultarStatusAceite,
      } = require("@/app/shared/core/services/termos/termos.service");

      const result = await consultarStatusAceite("user-123", "empresa-456");

      expect(result).toHaveLength(3);
      expect(result.map((s: { tipoDocumento: string }) => s.tipoDocumento).sort()).toEqual([
        "dpa",
        "politica_privacidade",
        "termos_uso",
      ]);
    });

    it("deve marcar como não aceito quando não há registros", async () => {
      const {
        consultarStatusAceite,
      } = require("@/app/shared/core/services/termos/termos.service");

      const result = await consultarStatusAceite("user-123", "empresa-456");

      for (const status of result) {
        expect(status.aceito).toBe(false);
        expect(status.versaoAceita).toBeNull();
        expect(status.vigente).toBe(false);
      }
    });
  });

  describe("verificarAceiteVigente", () => {
    it("deve usar cache para verificação", async () => {
      const {
        verificarAceiteVigente,
      } = require("@/app/shared/core/services/termos/termos.service");

      await verificarAceiteVigente("user-123", "empresa-456");

      expect(mockCacheGetOrSet).toHaveBeenCalledWith(
        "termos:aceite:user-123:empresa-456",
        expect.any(Function),
        1800,
      );
    });

    it("deve retornar false quando não há aceites", async () => {
      const {
        verificarAceiteVigente,
      } = require("@/app/shared/core/services/termos/termos.service");

      const result = await verificarAceiteVigente("user-123", "empresa-456");
      expect(result).toBe(false);
    });
  });
});
