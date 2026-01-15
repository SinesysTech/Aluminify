'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "./profile-settings"
import { CompanySettings } from "./company-settings"
import { BrandingSettings } from "./branding-settings"
import type { AppUser } from "@/types/user"

interface ProfileTabsProps {
    user: AppUser
}

export function ProfileTabs({ user }: ProfileTabsProps) {
    const showCompanySettings = (user.role === 'professor' || user.role === 'superadmin') && user.empresaId

    return (
        <Tabs defaultValue="perfil" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:w-auto md:inline-flex md:grid-cols-none h-auto">
                <TabsTrigger value="perfil">Meu Perfil</TabsTrigger>
                {showCompanySettings && (
                    <>
                        <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
                        <TabsTrigger value="customizacao">Personalização</TabsTrigger>
                    </>
                )}
            </TabsList>

            <TabsContent value="perfil" className="mt-6">
                <ProfileSettings user={user} />
            </TabsContent>

            {showCompanySettings && (
                <>
                    <TabsContent value="empresa" className="mt-6">
                        {user.empresaId && <CompanySettings empresaId={user.empresaId} />}
                    </TabsContent>
                    <TabsContent value="customizacao" className="mt-6">
                        {user.empresaId && <BrandingSettings empresaId={user.empresaId} />}
                    </TabsContent>
                </>
            )}
        </Tabs>
    )
}
