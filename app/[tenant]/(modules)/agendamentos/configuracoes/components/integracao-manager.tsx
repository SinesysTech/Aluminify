"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/app/shared/components/forms/input"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/shared/components/ui/collapsible"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/app/shared/components/feedback/alert"
import {
  getConfiguracoesProfessor,
  updateConfiguracoesProfessor,
} from "@/app/[tenant]/(modules)/agendamentos/lib/actions"
import {
  getOAuthAuthorizationUrl,
  disconnectTenantOAuth,
} from "@/app/[tenant]/(modules)/settings/integracoes/lib/oauth-actions"
import type { ConfiguracoesProfessor } from "@/app/[tenant]/(modules)/agendamentos/types"
import { Loader2, Link2, Check, X, ExternalLink, AlertCircle, ChevronDown, Save } from "lucide-react"
import { toast } from "sonner"

interface IntegracaoManagerProps {
  professorId: string
  empresaId: string
  tenantSlug: string
  isAdmin: boolean
  availableProviders: {
    google: { configured: boolean; connected: boolean }
    zoom: { configured: boolean; connected: boolean }
  }
}

export function IntegracaoManager({
  professorId,
  empresaId,
  tenantSlug,
  isAdmin,
  availableProviders,
}: IntegracaoManagerProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [_configuracoes, setConfiguracoes] = useState<ConfiguracoesProfessor | null>(null)
  const [defaultLink, setDefaultLink] = useState("")
  const [showGoogleDetails, setShowGoogleDetails] = useState(false)
  const [showZoomDetails, setShowZoomDetails] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  if (!dataLoaded) {
    setDataLoaded(true)
    setLoading(true)
    getConfiguracoesProfessor(professorId)
      .then((configData) => {
        setConfiguracoes(configData)
        setDefaultLink(configData?.link_reuniao_padrao || "")
      })
      .catch((error) => {
        console.error("Error loading config data:", error)
        toast.error("Erro ao carregar dados de configuração")
      })
      .finally(() => setLoading(false))
  }

  const isGoogleConnected = availableProviders.google.connected
  const isZoomConnected = availableProviders.zoom.connected
  const hasGoogleConfig = availableProviders.google.configured
  const hasZoomConfig = availableProviders.zoom.configured

  const handleSaveDefaultLink = async () => {
    setSaving(true)
    try {
      await updateConfiguracoesProfessor(professorId, {
        link_reuniao_padrao: defaultLink || null,
      })
      toast.success("Link padrão salvo!")
    } catch (error) {
      console.error("Error saving default link:", error)
      toast.error("Erro ao salvar link padrão")
    } finally {
      setSaving(false)
    }
  }

  const handleConnect = async (provider: "google" | "zoom") => {
    try {
      const authUrl = await getOAuthAuthorizationUrl(
        empresaId,
        tenantSlug,
        provider,
      )
      if (!authUrl) {
        toast.error(`Não foi possível gerar a URL de autorização do ${provider === "google" ? "Google" : "Zoom"}`)
        return
      }
      window.location.href = authUrl
    } catch (err) {
      console.error(`Error getting ${provider} OAuth URL:`, err)
      toast.error(`Erro ao iniciar conexão com ${provider === "google" ? "Google" : "Zoom"}`)
    }
  }

  const handleDisconnect = async (provider: "google" | "zoom") => {
    setSaving(true)
    try {
      await disconnectTenantOAuth(empresaId, provider)
      toast.success("Integração desconectada")
      window.location.reload()
    } catch (error) {
      console.error("Error disconnecting:", error)
      toast.error("Erro ao desconectar integração")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Link Padrão */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="section-title">Link de Reunião Padrão</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Link fixo usado automaticamente ao confirmar agendamentos
              </p>
            </div>
            {!isGoogleConnected && !isZoomConnected && defaultLink && (
              <Badge variant="secondary" className="shrink-0">Em uso</Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://meet.google.com/sua-sala"
              value={defaultLink}
              onChange={(e) => setDefaultLink(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveDefaultLink} disabled={saving} size="sm">
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integrações de Provedores */}
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="section-title">Integrações Automáticas</h3>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Conecte a conta corporativa para gerar links de reunião automaticamente"
              : "Integrações de videoconferência configuradas pelo administrador"}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {/* Google Calendar / Meet */}
          <Card className={`transition-colors ${isGoogleConnected ? "border-primary/40 bg-primary/2" : ""}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                    <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm6.804 16.18a.598.598 0 01-.822.206l-5.388-3.304A.6.6 0 0112.3 12.6V5.4a.6.6 0 011.2 0v6.78l5.098 3.178a.598.598 0 01.206.822z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Google Calendar</h4>
                    <p className="text-xs text-muted-foreground">Meet</p>
                  </div>
                </div>
                {isGoogleConnected ? (
                  <Badge variant="default" className="bg-green-600 shrink-0">Conectado</Badge>
                ) : (
                  <Badge variant="secondary" className="shrink-0">Desconectado</Badge>
                )}
              </div>

              {!hasGoogleConfig ? (
                <Alert variant="default" className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Configuração necessária</AlertTitle>
                  <AlertDescription className="text-xs">
                    {isAdmin
                      ? "Configure as credenciais Google OAuth acima para habilitar esta integração."
                      : "O administrador precisa configurar as credenciais Google OAuth para esta empresa."}
                  </AlertDescription>
                </Alert>
              ) : isAdmin ? (
                <>
                  <div className="mt-3">
                    {isGoogleConnected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect("google")}
                        disabled={saving}
                        className="w-full"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Desconectar
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleConnect("google")}
                        disabled={saving}
                        size="sm"
                        className="w-full"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Conectar Conta Google
                      </Button>
                    )}
                  </div>

                  <Collapsible open={showGoogleDetails} onOpenChange={setShowGoogleDetails}>
                    <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground mt-3 hover:text-foreground transition-colors cursor-pointer">
                      <ChevronDown className={`h-3 w-3 transition-transform ${showGoogleDetails ? "rotate-180" : ""}`} />
                      O que acontece ao conectar
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <li className="flex items-start gap-1.5">
                          <Check className="h-3 w-3 mt-0.5 text-green-500 shrink-0" />
                          Eventos criados no Google Calendar da conta corporativa
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="h-3 w-3 mt-0.5 text-green-500 shrink-0" />
                          Links do Google Meet gerados automaticamente
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="h-3 w-3 mt-0.5 text-green-500 shrink-0" />
                          Alunos recebem convites do calendário
                        </li>
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              ) : (
                <p className="text-xs text-muted-foreground mt-3">
                  {isGoogleConnected
                    ? "Links do Google Meet são gerados automaticamente ao confirmar agendamentos."
                    : "Aguardando o administrador conectar a conta Google corporativa."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Zoom */}
          <Card className={`transition-colors ${isZoomConnected ? "border-primary/40 bg-primary/2" : ""}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.4 16.2c-.3.3-.7.3-1 .1l-3-2.1v1.2c0 .8-.7 1.5-1.5 1.5H6.6c-.8 0-1.5-.7-1.5-1.5V8.6c0-.8.7-1.5 1.5-1.5h5.3c.8 0 1.5.7 1.5 1.5v1.2l3-2.1c.3-.2.7-.2 1 .1.1.1.2.3.2.5v7.4c0 .2-.1.4-.2.5z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Zoom</h4>
                    <p className="text-xs text-muted-foreground">Reuniões</p>
                  </div>
                </div>
                {isZoomConnected ? (
                  <Badge variant="default" className="bg-green-600 shrink-0">Conectado</Badge>
                ) : (
                  <Badge variant="secondary" className="shrink-0">Desconectado</Badge>
                )}
              </div>

              {!hasZoomConfig ? (
                <Alert variant="default" className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Configuração necessária</AlertTitle>
                  <AlertDescription className="text-xs">
                    {isAdmin
                      ? "Configure as credenciais Zoom OAuth acima para habilitar esta integração."
                      : "O administrador precisa configurar as credenciais Zoom OAuth para esta empresa."}
                  </AlertDescription>
                </Alert>
              ) : isAdmin ? (
                <>
                  <div className="mt-3">
                    {isZoomConnected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect("zoom")}
                        disabled={saving}
                        className="w-full"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Desconectar
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleConnect("zoom")}
                        disabled={saving}
                        size="sm"
                        className="w-full"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Conectar Conta Zoom
                      </Button>
                    )}
                  </div>

                  <Collapsible open={showZoomDetails} onOpenChange={setShowZoomDetails}>
                    <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground mt-3 hover:text-foreground transition-colors cursor-pointer">
                      <ChevronDown className={`h-3 w-3 transition-transform ${showZoomDetails ? "rotate-180" : ""}`} />
                      O que acontece ao conectar
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <li className="flex items-start gap-1.5">
                          <Check className="h-3 w-3 mt-0.5 text-green-500 shrink-0" />
                          Reuniões Zoom criadas automaticamente
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="h-3 w-3 mt-0.5 text-green-500 shrink-0" />
                          Links de acesso enviados aos alunos
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="h-3 w-3 mt-0.5 text-green-500 shrink-0" />
                          Sala de espera e vídeo habilitados
                        </li>
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              ) : (
                <p className="text-xs text-muted-foreground mt-3">
                  {isZoomConnected
                    ? "Links do Zoom são gerados automaticamente ao confirmar agendamentos."
                    : "Aguardando o administrador conectar a conta Zoom corporativa."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
