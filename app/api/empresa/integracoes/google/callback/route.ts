import { NextRequest, NextResponse } from "next/server";
import {
  getOAuthCredentials,
  saveOAuthTokens,
} from "@/app/shared/core/services/oauth-credentials";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      new URL(
        `/settings/integracoes?error=${encodeURIComponent(error)}`,
        request.url,
      ),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/settings/integracoes?error=missing_params", request.url),
    );
  }

  try {
    const { empresaId, tenantSlug } = JSON.parse(
      decodeURIComponent(state),
    );

    if (!empresaId) {
      throw new Error("Missing empresaId in state");
    }

    const credentials = await getOAuthCredentials(empresaId, "google");
    if (!credentials) {
      throw new Error(
        "Google OAuth credentials not configured for this tenant",
      );
    }

    const { clientId, clientSecret } = credentials;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/empresa/integracoes/google/callback`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange error:", errorText);
      throw new Error("Failed to exchange code for tokens");
    }

    const tokens = await tokenResponse.json();

    const tokenExpiry = new Date(
      Date.now() + tokens.expires_in * 1000,
    ).toISOString();

    await saveOAuthTokens(
      empresaId,
      "google",
      tokens.access_token,
      tokens.refresh_token ?? null,
      tokenExpiry,
    );

    const redirectPath = tenantSlug
      ? `/${tenantSlug}/settings/integracoes?success=google`
      : `/settings/integracoes?success=google`;

    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/settings/integracoes?error=${encodeURIComponent(String(error))}`,
        request.url,
      ),
    );
  }
}
