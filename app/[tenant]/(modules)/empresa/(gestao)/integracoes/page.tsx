
import { requireUser } from "@/app/shared/core/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IntegracaoManager } from "@/app/[tenant]/(modules)/agendamentos/configuracoes/components/integracao-manager"
import { ConfiguracoesForm } from "@/app/[tenant]/(modules)/agendamentos/configuracoes/components/configuracoes-form"
import { HotmartIntegration } from "@/app/[tenant]/(modules)/financeiro/integracoes/components/hotmart-integration"
import { getConfiguracoesProfessor } from "@/app/[tenant]/(modules)/agendamentos/lib/actions"
import { Video, CreditCard, CalendarCog } from "lucide-react"

export default async function IntegracoesPage() {
  const user = await requireUser({ allowedRoles: ["usuario"] })

  if (!user.empresaId) {
    return (
      <div className="page-container">
        <div className="flex flex-col gap-2">
          <h1 className="page-title">Integrações</h1>
          <p className="page-subtitle">
            Você precisa estar vinculado a uma empresa para gerenciar integrações.
          </p>
        </div>
      </div>
    )
  }

  const configuracoes = await getConfiguracoesProfessor(user.id)

  return (
    <div className="page-container section-container">
      <div className="flex flex-col gap-1">
        <h1 className="page-title">Integrações e Configurações</h1>
        <p className="page-subtitle">
          Conexões externas, pagamentos e preferências de agendamento
        </p>
      </div>

      <Tabs defaultValue="videoconferencia" className="space-y-6">
        <TabsList>
          <TabsTrigger value="videoconferencia" className="gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Videoconferência</span>
            <span className="sm:hidden">Vídeo</span>
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="agendamento" className="gap-2">
            <CalendarCog className="h-4 w-4" />
            Agendamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videoconferencia">
          <IntegracaoManager professorId={user.id} />
        </TabsContent>

        <TabsContent value="financeiro">
          <HotmartIntegration empresaId={user.empresaId} />
        </TabsContent>

        <TabsContent value="agendamento">
          <ConfiguracoesForm
            professorId={user.id}
            initialData={configuracoes}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
