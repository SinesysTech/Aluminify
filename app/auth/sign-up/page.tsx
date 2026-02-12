import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cadastro",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">Criar conta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No Aluminify, a criação de conta geralmente é feita pela sua instituição.
          Se você já tem acesso, faça login. Se não, solicite suas credenciais ao
          suporte da instituição.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Button asChild>
            <Link href="/auth/login">Ir para o login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

