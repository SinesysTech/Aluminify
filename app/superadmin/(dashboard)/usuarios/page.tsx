import type { Metadata } from "next";
import { SuperadminUserList } from "./components/superadmin-user-list";

export const metadata: Metadata = {
  title: "Usuários | Superadmin",
};

export default function UsuariosSuperadminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Usuários</h2>
        <p className="text-muted-foreground">
          Gerencie os administradores do sistema.
        </p>
      </div>
      <SuperadminUserList />
    </div>
  );
}
