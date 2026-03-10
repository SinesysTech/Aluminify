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
    console.error("Zoom OAuth error:", error);
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

    const credentials = await getOAuthCredentials(empresaId, "zoom");
    if (!credentials) {
      throw new Error(
        "Zoom OAuth credentials not configured for this tenant",
      );
    }

    const { clientId, clientSecret } = credentials;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/empresa/integracoes/zoom/callback`;

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64",
    );

    const tokenResponse = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Zoom token exchange error:", errorText);
      throw new Error("Failed to exchange code for tokens");
    }

    const tokens = await tokenResponse.json();

    const tokenExpiry = new Date(
      Date.now() + (tokens.expires_in || 3600) * 1000,
    ).toISOString();

    await saveOAuthTokens(
      empresaId,
      "zoom",
      tokens.access_token,
      tokens.refresh_token ?? null,
      tokenExpiry,
    );

    const redirectPath = tenantSlug
      ? `/${tenantSlug}/settings/integracoes?success=zoom`
      : `/settings/integracoes?success=zoom`;

    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (error) {
    console.error("Zoom OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/settings/integracoes?error=${encodeURIComponent(String(error))}`,
        request.url,
      ),
    );
  }
}
