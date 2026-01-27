export interface IntegrationStats {
  totalIntegrations: number;
  activeIntegrations: number;
  errorRate: number;
  integrationsByProvider: {
    providerId: string;
    name: string;
    connected: number;
    active: number;
    error: number;
  }[];
  dailyActivity: {
    date: string;
    requests: number;
    errors: number;
  }[];
}

export type IntegrationStatus = "active" | "inactive" | "error" | "pending";

export interface EmpresaIntegration {
  id: string;
  empresaId: string;
  empresaNome: string;
  providerId: string;
  status: IntegrationStatus;
  lastSyncAt: string | null;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  key: string;
  prefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
  createdBy: string;
}
