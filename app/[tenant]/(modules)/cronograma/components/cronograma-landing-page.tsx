'use client'

import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Plus, CalendarCheck, AlertTriangle, BookOpen, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/app/shared/components/feedback/alert'
import { Progress } from '@/app/shared/components/feedback/progress'
import { Badge } from '@/components/ui/badge'
import { PageShell } from '@/app/shared/components/layout/page-shell'

interface CronogramaSummary {
  id: string
  nome: string | null
  data_inicio: string
  data_fim: string
  modalidade_estudo: string
  created_at: string | null
  total_itens: number
  itens_concluidos: number
}

interface CronogramaLandingPageProps {
  cronogramas: CronogramaSummary[]
  hasBaseContent: boolean
}

export function CronogramaLandingPage({ cronogramas, hasBaseContent }: CronogramaLandingPageProps) {
  const router = useRouter()
  const params = useParams()
  const tenant = params?.tenant as string

  const navigateTo = (path: string) => {
    router.push(tenant ? `/${tenant}${path}` : path)
  }

  return (
    <PageShell
      title="Cronograma de Estudo"
      subtitle="Organize sua rotina de estudos com cronogramas personalizados"
      actions={
        hasBaseContent ? (
          <Button onClick={() => navigateTo('/cronograma/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Gerar novo cronograma
          </Button>
        ) : undefined
      }
    >
      {!hasBaseContent && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300">Conteudo ainda nao disponivel</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            Sua instituicao ainda nao disponibilizou o conteudo programatico.
            Assim que o conteudo for publicado, voce podera gerar seu cronograma de estudo.
          </AlertDescription>
        </Alert>
      )}

      {cronogramas.length === 0 && hasBaseContent && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <CalendarCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum cronograma criado</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Crie seu primeiro cronograma de estudo personalizado.
              O sistema distribui as aulas de forma inteligente de acordo com suas preferencias.
            </p>
            <Button onClick={() => navigateTo('/cronograma/novo')}>
              <Plus className="mr-2 h-4 w-4" />
              Gerar meu primeiro cronograma
            </Button>
          </CardContent>
        </Card>
      )}

      {cronogramas.length > 0 && (
        <div className="grid gap-3">
          {cronogramas.map((cronograma) => {
            const progress = cronograma.total_itens > 0
              ? Math.round((cronograma.itens_concluidos / cronograma.total_itens) * 100)
              : 0

            const modalidadeLabel = cronograma.modalidade_estudo === 'paralelo'
              ? 'Frentes em Paralelo'
              : 'Sequencial'

            return (
              <Card
                key={cronograma.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group"
                onClick={() => navigateTo(`/cronograma/${cronograma.id}`)}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="hidden sm:flex shrink-0 rounded-lg bg-primary/10 p-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">
                        {cronograma.nome || 'Meu Cronograma'}
                      </h3>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {modalidadeLabel}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        {format(new Date(cronograma.data_inicio), "dd MMM yyyy", { locale: ptBR })} — {format(new Date(cronograma.data_fim), "dd MMM yyyy", { locale: ptBR })}
                      </span>
                      <span>
                        {cronograma.itens_concluidos}/{cronograma.total_itens} aulas
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Progress value={progress} className="h-1.5 flex-1" />
                      <span className="text-xs font-medium tabular-nums w-8 text-right">{progress}%</span>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
