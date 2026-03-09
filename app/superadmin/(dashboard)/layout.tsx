import Link from "next/link";
import { requireSuperadmin } from "@/shared/core/services/superadmin-auth.service";
import { SuperadminLogoutButton } from "./components/logout-button";

export default async function SuperadminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const superadmin = await requireSuperadmin();

  return (
    <>
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Aluminify Superadmin</h1>
            <p className="text-sm text-muted-foreground">
              Gestão de planos e assinaturas
            </p>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-4">
              <Link
                href="/superadmin/planos"
                className="text-sm font-medium hover:text-primary"
              >
                Planos
              </Link>
              <Link
                href="/superadmin/assinaturas"
                className="text-sm font-medium hover:text-primary"
              >
                Assinaturas
              </Link>
            </nav>
            <div className="flex items-center gap-2 border-l pl-4">
              <span className="text-sm text-muted-foreground">
                {superadmin.name}
              </span>
              <SuperadminLogoutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </>
  );
}
