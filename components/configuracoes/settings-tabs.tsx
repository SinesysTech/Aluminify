'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrandingSettings } from "@/components/perfil/branding-settings"
import { CompanySettings } from "@/components/perfil/company-settings"
import { UserManagement } from "./user-management"
import type { AppUser } from "@/types/user"

interface SettingsTabsProps {
    user: AppUser
}

export function SettingsTabs({ user }: SettingsTabsProps) {
    if (!user.empresaId) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">
                    Você não está associado a nenhuma empresa.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configurações da Empresa</h1>
                <p className="text-muted-foreground">
                    Gerencie as configurações, personalização e usuários da sua empresa.
                </p>
            </div>

            <Tabs defaultValue="branding" className="w-full">
                <TabsList className="grid w-full grid-cols-1 md:w-auto md:inline-flex md:grid-cols-none h-auto">
                    <TabsTrigger value="branding">Customizações de Marca</TabsTrigger>
                    <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
                    <TabsTrigger value="usuarios">Gestão de Usuários</TabsTrigger>
                </TabsList>

                <TabsContent value="branding" className="mt-6">
                    <BrandingSettings empresaId={user.empresaId} />
                </TabsContent>

                <TabsContent value="empresa" className="mt-6">
                    <CompanySettings empresaId={user.empresaId} />
                </TabsContent>

                <TabsContent value="usuarios" className="mt-6">
                    <UserManagement empresaId={user.empresaId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
