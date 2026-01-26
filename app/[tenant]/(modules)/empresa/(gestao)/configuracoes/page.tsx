import { createClient } from "@/app/shared/core/server"
import { redirect } from "next/navigation"
import { SettingsTabs } from "@/app/[tenant]/(modules)/agendamentos/configuracoes/components/settings-tabs"
import { mapSupabaseUserToAuthUser } from "@/app/[tenant]/auth/middleware"
import type { AppUser, AppUserRole } from "@/app/shared/types"

export default async function EmpresaConfiguracoesPage() {
    const supabase = await createClient()
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser()

    if (!supabaseUser) {
        redirect("/auth/login")
    }

    const authUser = await mapSupabaseUserToAuthUser(supabaseUser)
    
    if (!authUser) {
        redirect("/auth/login")
    }

    // Convert AuthUser to AppUser
    const appUser: AppUser = {
        id: authUser.id,
        email: authUser.email,
        role: authUser.role as AppUserRole,
        empresaId: authUser.empresaId,
        roleType: authUser.roleType,
        permissions: authUser.permissions,
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="page-title">Configurações da Empresa</h1>
                <p className="page-subtitle">
                    Gerencie dados da empresa, marca e usuários.
                </p>
            </div>

            <SettingsTabs user={appUser} />
        </div>
    )
}