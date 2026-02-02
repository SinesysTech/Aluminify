import { getDatabaseClient } from "@/app/shared/core/database/database";

export type OAuthProvider = "google" | "zoom";

export type OAuthCredentials = {
  clientId: string;
  clientSecret: string;
};

export type OAuthCredentialConfig = {
  provider: OAuthProvider;
  configured: boolean;
  active: boolean;
};

import { env } from "@/app/shared/core/env";

function getEncryptionKey(): string {
  return env.OAUTH_ENCRYPTION_KEY;
}

/**
 * Saves (upserts) OAuth app credentials for a tenant.
 * Uses pgcrypto pgp_sym_encrypt for the client_secret.
 */
export async function saveOAuthCredentials(
  empresaId: string,
  provider: OAuthProvider,
  clientId: string,
  clientSecret: string,
  configuredBy?: string,
): Promise<string> {
  const db = getDatabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.rpc as any)("upsert_oauth_credential", {
    p_empresa_id: empresaId,
    p_provider: provider,
    p_client_id: clientId,
    p_client_secret: clientSecret,
    p_encryption_key: getEncryptionKey(),
    p_configured_by: configuredBy ?? null,
  });

  if (error) {
    console.error("Error saving OAuth credentials:", error);
    throw new Error(`Failed to save OAuth credentials for ${provider}`);
  }

  return data as string;
}

/**
 * Retrieves decrypted OAuth credentials for a tenant + provider.
 * Returns null if not configured or inactive.
 */
export async function getOAuthCredentials(
  empresaId: string,
  provider: OAuthProvider,
): Promise<OAuthCredentials | null> {
  const db = getDatabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.rpc as any)("get_oauth_credentials", {
    p_empresa_id: empresaId,
    p_provider: provider,
    p_encryption_key: getEncryptionKey(),
  });

  if (error) {
    console.error("Error fetching OAuth credentials:", error);
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (
    !row ||
    typeof row !== "object" ||
    !("client_id" in row) ||
    !("client_secret" in row)
  ) {
    return null;
  }

  const typedRow = row as { client_id: string; client_secret: string };
  if (!typedRow.client_id || !typedRow.client_secret) {
    return null;
  }

  return {
    clientId: typedRow.client_id,
    clientSecret: typedRow.client_secret,
  };
}

/**
 * Returns only the client_id for a tenant + provider (non-sensitive, no decryption).
 * Used for building OAuth authorization URLs.
 */
export async function getOAuthClientId(
  empresaId: string,
  provider: OAuthProvider,
): Promise<string | null> {
  const db = getDatabaseClient();
  const { data, error } = await db
    .from("empresa_oauth_credentials" as never)
    .select("client_id")
    .eq("empresa_id", empresaId)
    .eq("provider", provider)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return (data as { client_id: string }).client_id || null;
}

/**
 * Returns the OAuth configuration status for a tenant (which providers are configured).
 */
export async function getTenantOAuthStatus(
  empresaId: string,
): Promise<{
  google: OAuthCredentialConfig | null;
  zoom: OAuthCredentialConfig | null;
}> {
  const db = getDatabaseClient();
  const { data, error } = await db
    .from("empresa_oauth_credentials" as never)
    .select("provider, active")
    .eq("empresa_id", empresaId);

  if (error || !data) {
    return { google: null, zoom: null };
  }

  const rows = data as Array<{ provider: string; active: boolean }>;
  const googleRow = rows.find((r) => r.provider === "google");
  const zoomRow = rows.find((r) => r.provider === "zoom");

  return {
    google: googleRow
      ? { provider: "google", configured: true, active: googleRow.active }
      : null,
    zoom: zoomRow
      ? { provider: "zoom", configured: true, active: zoomRow.active }
      : null,
  };
}

/**
 * Deletes OAuth credentials for a tenant + provider.
 */
export async function deleteOAuthCredentials(
  empresaId: string,
  provider: OAuthProvider,
): Promise<void> {
  const db = getDatabaseClient();
  const { error } = await db
    .from("empresa_oauth_credentials" as never)
    .delete()
    .eq("empresa_id", empresaId)
    .eq("provider", provider);

  if (error) {
    console.error("Error deleting OAuth credentials:", error);
    throw new Error(`Failed to delete OAuth credentials for ${provider}`);
  }
}
