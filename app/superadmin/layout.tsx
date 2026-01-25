import React from "react"
import { SidebarProvider } from "@/app/shared/components/ui/sidebar"
import { SuperAdminSidebar } from "./components/superadmin-sidebar"

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <SuperAdminSidebar />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </SidebarProvider>
    )
}
