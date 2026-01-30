"use client"

import { useState } from "react"
import { updateConfiguracoesProfessor } from "@/app/[tenant]/(modules)/agendamentos/lib/actions"
import { ConfiguracoesProfessor } from "@/app/[tenant]/(modules)/agendamentos/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/app/shared/components/forms/input"
import { Label } from "@/app/shared/components/forms/label"
import { Textarea } from "@/app/shared/components/forms/textarea"
import { Switch } from "@/app/shared/components/forms/switch"
import { Separator } from "@/app/shared/components/ui/separator"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

interface ConfiguracoesFormProps {
  professorId: string
  initialData: ConfiguracoesProfessor | null
}

export function ConfiguracoesForm({ professorId, initialData }: ConfiguracoesFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [autoConfirmar, setAutoConfirmar] = useState(initialData?.auto_confirmar ?? false)
  const [tempoAntecedencia, setTempoAntecedencia] = useState(
    initialData?.tempo_antecedencia_minimo?.toString() ?? "60"
  )
  const [tempoLembrete, setTempoLembrete] = useState(
    initialData?.tempo_lembrete_minutos?.toString() ?? "1440"
  )
  const [linkPadrao, setLinkPadrao] = useState(initialData?.link_reuniao_padrao ?? "")
  const [mensagemConfirmacao, setMensagemConfirmacao] = useState(
    initialData?.mensagem_confirmacao ?? ""
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateConfiguracoesProfessor(professorId, {
        auto_confirmar: autoConfirmar,
        tempo_antecedencia_minimo: parseInt(tempoAntecedencia) || 60,
        tempo_lembrete_minutos: parseInt(tempoLembrete) || 1440,
        link_reuniao_padrao: linkPadrao || null,
        mensagem_confirmacao: mensagemConfirmacao || null
      })
      toast.success("Configurações salvas com sucesso!")
    } catch (error) {
      toast.error("Erro ao salvar configurações")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Auto-confirmação */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Auto-confirmação</Label>
              <p className="text-sm text-muted-foreground">
                Agendamentos confirmados automaticamente ao serem criados
              </p>
            </div>
            <Switch
              checked={autoConfirmar}
              onCheckedChange={setAutoConfirmar}
            />
          </div>

          <Separator />

          {/* Configurações de Tempo */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Prazos e Lembretes</h3>
              <p className="text-xs text-muted-foreground">
                Defina os tempos mínimos de antecedência e envio de lembretes
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="antecedencia">Antecedência mínima (minutos)</Label>
                <Input
                  id="antecedencia"
                  type="number"
                  min="0"
                  value={tempoAntecedencia}
                  onChange={(e) => setTempoAntecedencia(e.target.value)}
                  placeholder="60"
                />
                <p className="text-xs text-muted-foreground">
                  Tempo mínimo para aceitar agendamentos
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lembrete">Lembrete antes (minutos)</Label>
                <Input
                  id="lembrete"
                  type="number"
                  min="0"
                  value={tempoLembrete}
                  onChange={(e) => setTempoLembrete(e.target.value)}
                  placeholder="1440"
                />
                <p className="text-xs text-muted-foreground">
                  1440 min = 24h antes do agendamento
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Link de Reunião */}
          <div className="space-y-2">
            <Label htmlFor="link">Link de Reunião Padrão</Label>
            <Input
              id="link"
              type="url"
              value={linkPadrao}
              onChange={(e) => setLinkPadrao(e.target.value)}
              placeholder="https://meet.google.com/sua-sala"
            />
            <p className="text-xs text-muted-foreground">
              Usado automaticamente ao confirmar agendamentos
            </p>
          </div>

          <Separator />

          {/* Mensagem de Confirmação */}
          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem de Confirmação</Label>
            <Textarea
              id="mensagem"
              value={mensagemConfirmacao}
              onChange={(e) => setMensagemConfirmacao(e.target.value)}
              placeholder="Ex: Olá! Seu agendamento foi confirmado. Nos vemos em breve!"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Incluída no email de confirmação enviado aos alunos
            </p>
          </div>

          <Separator />

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
