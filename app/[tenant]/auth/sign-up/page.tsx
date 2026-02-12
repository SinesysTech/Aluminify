import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/app/shared/core/server";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cadastro",
};

interface TenantSignUpPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function TenantSignUpPage({
  params,
}: TenantSignUpPageProps) {
  const { tenant } = await params;
  const tenantSlug = (tenant || "").toLowerCase();

  // Best-effort: tenta buscar branding para manter consistência visual.
  // Se falhar, ainda exibimos a mensagem padrão.
  let tenantName: string | null = null;
  try {
    const supabase = await createClient();
    const { data: empresa } = await supabase
      .from("empresas")
      .select("nome, slug")
      .or(`slug.eq.${tenantSlug},subdomain.eq.${tenantSlug}`)
      .eq("ativo", true)
      .maybeSingle();
    tenantName = empresa?.nome ?? null;
  } catch {
    // noop
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">Criar conta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {tenantName ? (
            <>
              O cadastro para <strong className="text-foreground">{tenantName}</strong>{" "}
              geralmente é feito pela instituição.
            </>
          ) : (
            <>O cadastro geralmente é feito pela sua instituição.</>
          )}{" "}
          Se você já tem acesso, faça login. Se não, solicite suas credenciais ao
          suporte da instituição.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Button asChild>
            <Link href={`/${tenantSlug}/auth/login`}>Ir para o login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

