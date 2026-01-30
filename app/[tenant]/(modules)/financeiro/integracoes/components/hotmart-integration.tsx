"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/app/shared/components/forms/input";
import { Label } from "@/app/shared/components/forms/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/app/shared/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/shared/components/ui/collapsible";
import {
  Loader2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Webhook,
  ShieldCheck,
  ChevronDown,
  Power,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/app/shared/core/client";

interface HotmartIntegrationProps {
  empresaId: string;
}

interface PaymentProvider {
  id: string;
  empresa_id: string;
  provider: string;
  name: string;
  webhook_secret: string | null;
  webhook_url: string | null;
  active: boolean;
}

const HOTMART_EVENTS = [
  { name: "PURCHASE_APPROVED", description: "Compra aprovada" },
  { name: "PURCHASE_COMPLETE", description: "Compra finalizada" },
  { name: "PURCHASE_CANCELED", description: "Compra cancelada" },
  { name: "PURCHASE_REFUNDED", description: "Compra reembolsada" },
  { name: "PURCHASE_CHARGEBACK", description: "Chargeback" },
  { name: "SUBSCRIPTION_CANCELLATION", description: "Cancelamento de assinatura" },
  { name: "CLUB_FIRST_ACCESS", description: "Primeiro acesso ao curso" },
];

export function HotmartIntegration({ empresaId }: HotmartIntegrationProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState<PaymentProvider | null>(null);
  const [hottok, setHottok] = useState("");
  const [showHottok, setShowHottok] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/hotmart?empresaId=${empresaId}`
      : "";

  useEffect(() => {
    loadProvider();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId]);

  async function loadProvider() {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("payment_providers")
        .select("*")
        .eq("empresa_id", empresaId)
        .eq("provider", "hotmart")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setProvider(data);
        setHottok(data.webhook_secret || "");
      }
    } catch (error) {
      console.error("Error loading payment provider:", error);
      toast.error("Erro ao carregar configuração de integração");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!hottok.trim()) {
      toast.error("Informe o Hottok da Hotmart");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();

      if (provider) {
        const { error } = await supabase
          .from("payment_providers")
          .update({
            webhook_secret: hottok.trim(),
            webhook_url: webhookUrl,
            active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", provider.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("payment_providers").insert({
          empresa_id: empresaId,
          provider: "hotmart",
          name: "Hotmart",
          webhook_secret: hottok.trim(),
          webhook_url: webhookUrl,
          active: true,
        });

        if (error) throw error;
      }

      toast.success("Integração Hotmart configurada!");
      loadProvider();
    } catch (error) {
      console.error("Error saving payment provider:", error);
      toast.error("Erro ao salvar configuração");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    if (!provider) return;

    setSaving(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("payment_providers")
        .update({
          active: !provider.active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", provider.id);

      if (error) throw error;

      toast.success(
        provider.active ? "Integração desativada" : "Integração ativada"
      );
      loadProvider();
    } catch (error) {
      console.error("Error toggling provider:", error);
      toast.error("Erro ao alterar status");
    } finally {
      setSaving(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("URL copiada!");
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuração principal */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Header com status */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                <Webhook className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="section-title">Integração Hotmart</h3>
                <p className="text-sm text-muted-foreground">
                  Receba dados de vendas e alunos automaticamente
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {provider?.active ? (
                <Badge variant="default" className="bg-green-600">Ativo</Badge>
              ) : provider ? (
                <Badge variant="secondary">Inativo</Badge>
              ) : (
                <Badge variant="outline">Não configurado</Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Webhook URL */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium">URL do Webhook</Label>
              <p className="text-xs text-muted-foreground">
                Copie e configure no painel da Hotmart
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="font-mono text-sm bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(webhookUrl)}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Hottok */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Autenticação (Hottok)</Label>
            </div>
            <div className="relative">
              <Input
                type={showHottok ? "text" : "password"}
                placeholder="Cole aqui o Hottok da aba Autenticação"
                value={hottok}
                onChange={(e) => setHottok(e.target.value)}
                className="pr-10 font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowHottok(!showHottok)}
              >
                {showHottok ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Encontre na aba Autenticação das configurações de Webhook da Hotmart
            </p>
          </div>

          <Separator />

          {/* Ações */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !hottok.trim()}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {provider ? "Atualizar" : "Ativar Integração"}
              </Button>

              {provider && (
                <Button
                  variant="outline"
                  onClick={handleToggleActive}
                  disabled={saving}
                >
                  <Power className="mr-2 h-4 w-4" />
                  {provider.active ? "Desativar" : "Ativar"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seções colapsáveis */}
      <div className="space-y-3">
        {/* Guia de configuração */}
        <Collapsible open={showSetupGuide} onOpenChange={setShowSetupGuide}>
          <Card>
            <CollapsibleTrigger className="w-full cursor-pointer">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-left">
                    <h4 className="text-sm font-medium">Como configurar na Hotmart</h4>
                    <Badge variant="outline" className="text-xs">Passo a passo</Badge>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showSetupGuide ? "rotate-180" : ""}`} />
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6">
                <Separator className="mb-4" />
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</span>
                    <span>
                      Acesse{" "}
                      <a
                        href="https://app-vlc.hotmart.com/tools/webhook"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:no-underline"
                      >
                        Ferramentas &gt; Webhook
                      </a>{" "}
                      na Hotmart
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</span>
                    <span>Clique em &quot;Adicionar webhook&quot;</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</span>
                    <span>Cole a URL do webhook acima no campo &quot;URL de destino&quot;</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">4</span>
                    <span>Selecione os eventos desejados (recomendamos todos)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">5</span>
                    <span>Copie o Hottok exibido e cole no campo acima</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">6</span>
                    <span>Salve a configuração em ambos os lados</span>
                  </li>
                </ol>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Eventos suportados */}
        <Collapsible open={showEvents} onOpenChange={setShowEvents}>
          <Card>
            <CollapsibleTrigger className="w-full cursor-pointer">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-left">
                    <h4 className="text-sm font-medium">Eventos suportados</h4>
                    <Badge variant="outline" className="text-xs">{HOTMART_EVENTS.length} eventos</Badge>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showEvents ? "rotate-180" : ""}`} />
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6">
                <Separator className="mb-4" />
                <div className="grid gap-2 sm:grid-cols-2">
                  {HOTMART_EVENTS.map((event) => (
                    <div
                      key={event.name}
                      className="flex items-center gap-2 rounded-md border p-2.5"
                    >
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium font-mono truncate">{event.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
}
