import { requireSuperadmin } from "@/shared/core/services/superadmin-auth.service";
import { SuperadminSidebar } from "./components/superadmin-sidebar";
import { SuperadminHeader } from "./components/superadmin-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export const dynamic = "force-dynamic";

export default async function SuperadminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const superadmin = await requireSuperadmin();

  return (
    <SidebarProvider className="font-sans antialiased">
      <SuperadminSidebar />
      <SidebarInset>
        <SuperadminHeader name={superadmin.name} email={superadmin.email} />
        <div className="p-4 md:px-8 md:py-6 pb-20 md:pb-8 bg-background">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
