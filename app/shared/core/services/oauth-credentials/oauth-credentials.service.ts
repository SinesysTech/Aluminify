import { getDatabaseClient } from "@/app/shared/core/database/database";
import { env } from "@/app/shared/core/env";

export type OAuthProvider = "google" | "zoom";

export type OAuthCredentials = {
  clientId: string;
  clientSecret: string;
};

export type OAuthTokens = {
  accessToken: string;
  refreshToken: string | null;
  tokenExpiry: string | null;
};

export type OAuthCredentialConfig = {
  provider: OAuthProvider;
  configured: boolean;
  active: boolean;
  connected: boolean;
};

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
  const { data, error } = await db.rpc("upsert_oauth_credential", {
    p_empresa_id: empresaId,
    p_provider: provider,
    p_client_id: clientId,
    p_client_secret: clientSecret,
    p_encryption_key: getEncryptionKey(),
    p_configured_by: configuredBy ?? undefined,
  });

  if (error) {
    console.error("Error saving OAuth credentials:", error);
    throw new Error(`Failed to save OAuth credentials for ${provider}`);
  }

  return data as string;
}

/**
 * Saves OAuth tokens (access_token, refresh_token) for a tenant + provider.
 * Used by OAuth callbacks after token exchange.
 * Tokens are encrypted with pgp_sym_encrypt.
 */
export async function saveOAuthTokens(
  empresaId: string,
  provider: OAuthProvider,
  accessToken: string,
  refreshToken: string | null,
  tokenExpiry: string | null,
): Promise<boolean> {
  const db = getDatabaseClient();
  const { data, error } = await db.rpc("save_oauth_tokens", {
    p_empresa_id: empresaId,
    p_provider: provider,
    p_access_token: accessToken,
    p_refresh_token: refreshToken ?? "",
    p_encryption_key: getEncryptionKey(),
    p_token_expiry: tokenExpiry ?? undefined,
  });

  if (error) {
    console.error("Error saving OAuth tokens:", error);
    throw new Error(`Failed to save OAuth tokens for ${provider}`);
  }

  return !!data;
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
  const { data, error } = await db.rpc("get_oauth_credentials", {
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
 * Retrieves decrypted OAuth tokens for a tenant + provider.
 * Returns null if no tokens are stored.
 */
export async function getOAuthTokens(
  empresaId: string,
  provider: OAuthProvider,
): Promise<OAuthTokens | null> {
  const db = getDatabaseClient();
  const { data, error } = await db.rpc("get_oauth_credentials", {
    p_empresa_id: empresaId,
    p_provider: provider,
    p_encryption_key: getEncryptionKey(),
  });

  if (error) {
    console.error("Error fetching OAuth tokens:", error);
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object" || !("access_token" in row)) {
    return null;
  }

  const typedRow = row as {
    access_token: string | null;
    refresh_token: string | null;
    token_expiry: string | null;
  };

  if (!typedRow.access_token) {
    return null;
  }

  return {
    accessToken: typedRow.access_token,
    refreshToken: typedRow.refresh_token,
    tokenExpiry: typedRow.token_expiry,
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
    .from("empresa_oauth_credentials")
    .select("client_id")
    .eq("empresa_id", empresaId)
    .eq("provider", provider)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.client_id || null;
}

/**
 * Returns the OAuth configuration status for a tenant (which providers are configured and connected).
 */
export async function getTenantOAuthStatus(
  empresaId: string,
): Promise<{
  google: OAuthCredentialConfig | null;
  zoom: OAuthCredentialConfig | null;
}> {
  const db = getDatabaseClient();
  const { data, error } = await db
    .from("empresa_oauth_credentials")
    .select("provider, active, access_token_encrypted, token_expiry")
    .eq("empresa_id", empresaId);

  if (error || !data) {
    return { google: null, zoom: null };
  }

  const rows = data as Array<{
    provider: string;
    active: boolean;
    access_token_encrypted: string | null;
    token_expiry: string | null;
  }>;

  function toConfig(
    row: (typeof rows)[number] | undefined,
    provider: OAuthProvider,
  ): OAuthCredentialConfig | null {
    if (!row) return null;
    return {
      provider,
      configured: true,
      active: row.active,
      connected: row.access_token_encrypted !== null,
    };
  }

  const googleRow = rows.find((r) => r.provider === "google");
  const zoomRow = rows.find((r) => r.provider === "zoom");

  return {
    google: toConfig(googleRow, "google"),
    zoom: toConfig(zoomRow, "zoom"),
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
    .from("empresa_oauth_credentials")
    .delete()
    .eq("empresa_id", empresaId)
    .eq("provider", provider);

  if (error) {
    console.error("Error deleting OAuth credentials:", error);
    throw new Error(`Failed to delete OAuth credentials for ${provider}`);
  }
}

/**
 * Disconnects OAuth tokens for a tenant + provider (keeps client_id/secret).
 */
export async function disconnectOAuthTokens(
  empresaId: string,
  provider: OAuthProvider,
): Promise<void> {
  const db = getDatabaseClient();
  const { error } = await db
    .from("empresa_oauth_credentials")
    .update({
      access_token_encrypted: null,
      refresh_token_encrypted: null,
      token_expiry: null,
      updated_at: new Date().toISOString(),
    })
    .eq("empresa_id", empresaId)
    .eq("provider", provider);

  if (error) {
    console.error("Error disconnecting OAuth tokens:", error);
    throw new Error(`Failed to disconnect OAuth tokens for ${provider}`);
  }
}
