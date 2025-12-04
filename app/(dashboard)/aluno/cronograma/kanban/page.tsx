'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'
import { ScheduleKanban } from '@/components/schedule-kanban'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarCheck, Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function KanbanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasCronograma, setHasCronograma] = useState(false)
  const [cronogramaId, setCronogramaId] = useState<string | null>(null)

  useEffect(() => {
    async function checkCronograma() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('cronogramas')
        .select('id')
        .eq('aluno_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Erro ao buscar cronograma:', error)
      }

      if (data) {
        setHasCronograma(true)
        setCronogramaId(data.id)
      }

      setLoading(false)
    }

    checkCronograma()
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!hasCronograma) {
    return (
      <div className="container mx-auto py-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CalendarCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Crie seu Cronograma de Estudos</CardTitle>
            <CardDescription className="text-base">
              Para visualizar seu cronograma no quadro Kanban, você precisa criar um cronograma primeiro
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" onClick={() => router.push('/aluno/cronograma/novo')}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Cronograma
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!cronogramaId) {
    return (
      <div className="container mx-auto py-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Carregando...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return <KanbanView cronogramaId={cronogramaId} />
}

function KanbanView({ cronogramaId }: { cronogramaId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [cronograma, setCronograma] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadCronograma() {
      if (!cronogramaId) {
        console.error('cronogramaId não fornecido')
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        
        const { data: userResponse } = await supabase.auth.getUser()
        setUserId(userResponse?.user?.id ?? null)

        const { data: cronogramaData, error: cronogramaError } = await supabase
          .from('cronogramas')
          .select('*')
          .eq('id', cronogramaId)
          .single()

        if (cronogramaError) {
          console.error('Erro ao carregar cronograma base:', {
            message: cronogramaError.message,
            details: cronogramaError.details,
            hint: cronogramaError.hint,
            code: cronogramaError.code,
            cronogramaId,
          })
          setLoading(false)
          return
        }

        if (!cronogramaData) {
          console.error('Cronograma não encontrado para o ID:', cronogramaId)
          setLoading(false)
          return
        }

        const { data: itensData, error: itensError } = await supabase
          .from('cronograma_itens')
          .select('id, aula_id, semana_numero, ordem_na_semana, concluido, data_conclusao')
          .eq('cronograma_id', cronogramaId)
          .order('semana_numero', { ascending: true })
          .order('ordem_na_semana', { ascending: true })

        if (itensError) {
          console.error('Erro ao carregar itens do cronograma:', {
            message: itensError.message,
            details: itensError.details,
            hint: itensError.hint,
            code: itensError.code,
            cronogramaId,
          })
        }

        let itensCompletos: any[] = []
        if (itensData && itensData.length > 0) {
          const aulaIds = [...new Set(itensData.map(item => item.aula_id).filter(Boolean))]
          
          if (aulaIds.length > 0) {
            const LOTE_SIZE = 100
            const lotes = []
            for (let i = 0; i < aulaIds.length; i += LOTE_SIZE) {
              lotes.push(aulaIds.slice(i, i + LOTE_SIZE))
            }
            
            const todasAulas: any[] = []
            
            for (let i = 0; i < lotes.length; i++) {
              const lote = lotes[i]
              
              const { data: loteData, error: loteError } = await supabase
                .from('aulas')
                .select('id, nome, numero_aula, tempo_estimado_minutos, curso_id, modulo_id')
                .in('id', lote)
              
              if (loteError) {
                console.error(`Erro no lote ${i + 1}/${lotes.length}:`, loteError)
              } else if (loteData) {
                todasAulas.push(...loteData)
              }
            }

            const moduloIds = [...new Set(todasAulas.map(a => a.modulo_id).filter(Boolean))]
            let modulosMap = new Map()
            
            if (moduloIds.length > 0) {
              const { data: modulosData, error: modulosError } = await supabase
                .from('modulos')
                .select('id, nome, numero_modulo, frente_id')
                .in('id', moduloIds)

              if (modulosError) {
                console.error('Erro ao carregar módulos:', modulosError)
              } else if (modulosData) {
                modulosMap = new Map(modulosData.map(m => [m.id, m]))
              }
            }

            const frenteIds = [...new Set(Array.from(modulosMap.values()).map((m: any) => m.frente_id).filter(Boolean))]
            let frentesMap = new Map()
            
            if (frenteIds.length > 0) {
              const { data: frentesData, error: frentesError } = await supabase
                .from('frentes')
                .select('id, nome, disciplina_id')
                .in('id', frenteIds)

              if (frentesError) {
                console.error('Erro ao carregar frentes:', frentesError)
              } else if (frentesData) {
                frentesMap = new Map(frentesData.map(f => [f.id, f]))
              }
            }

            const disciplinaIds = [...new Set(Array.from(frentesMap.values()).map((f: any) => f.disciplina_id).filter(Boolean))]
            let disciplinasMap = new Map()
            
            if (disciplinaIds.length > 0) {
              const { data: disciplinasData, error: disciplinasError } = await supabase
                .from('disciplinas')
                .select('id, nome')
                .in('id', disciplinaIds)

              if (disciplinasError) {
                console.error('Erro ao carregar disciplinas:', disciplinasError)
              } else if (disciplinasData) {
                disciplinasMap = new Map(disciplinasData.map(d => [d.id, d]))
              }
            }

            const aulasCompletas = (todasAulas || []).map(aula => {
              const modulo = modulosMap.get(aula.modulo_id)
              const frente = modulo ? frentesMap.get((modulo as any).frente_id) : null
              const disciplina = frente ? disciplinasMap.get((frente as any).disciplina_id) : null

              return {
                id: aula.id,
                nome: aula.nome,
                numero_aula: aula.numero_aula,
                tempo_estimado_minutos: aula.tempo_estimado_minutos,
                curso_id: aula.curso_id,
                modulos: modulo ? {
                  id: (modulo as any).id,
                  nome: (modulo as any).nome,
                  numero_modulo: (modulo as any).numero_modulo,
                  frentes: frente ? {
                    id: (frente as any).id,
                    nome: (frente as any).nome,
                    disciplinas: disciplina ? {
                      id: (disciplina as any).id,
                      nome: (disciplina as any).nome,
                    } : null,
                  } : null,
                } : null,
              }
            })

            const aulasMap = new Map(aulasCompletas.map(aula => [aula.id, aula]))

            itensCompletos = itensData.map(item => {
              const aula = aulasMap.get(item.aula_id)
              return {
                ...item,
                aulas: aula || null,
              }
            })
          } else {
            itensCompletos = itensData.map(item => ({
              ...item,
              aulas: null,
            }))
          }
        }

        const data = {
          ...cronogramaData,
          cronograma_itens: itensCompletos,
        }

        if (data.cronograma_itens) {
          data.cronograma_itens.sort((a: any, b: any) => {
            if (a.semana_numero !== b.semana_numero) {
              return a.semana_numero - b.semana_numero
            }
            return a.ordem_na_semana - b.ordem_na_semana
          })
        }

        setCronograma(data)
      } catch (err) {
        console.error('Erro inesperado ao carregar cronograma:', {
          error: err,
          errorString: String(err),
          errorJSON: JSON.stringify(err, Object.getOwnPropertyNames(err)),
          cronogramaId,
        })
      } finally {
        setLoading(false)
      }
    }

    loadCronograma()
  }, [cronogramaId])

  const toggleConcluido = async (itemId: string, concluido: boolean) => {
    const supabase = createClient()
    
    const updateData: any = { concluido }
    if (concluido) {
      updateData.data_conclusao = new Date().toISOString()
    } else {
      updateData.data_conclusao = null
    }

    const { error } = await supabase
      .from('cronograma_itens')
      .update(updateData)
      .eq('id', itemId)

    if (error) {
      console.error('Erro ao atualizar item:', error)
      return
    }

    const itemAlvo = cronograma?.cronograma_itens.find((item: any) => item.id === itemId)
    const alunoAtual = userId || (await supabase.auth.getUser()).data?.user?.id || null
    const cursoDaAula = itemAlvo?.aulas?.curso_id || cronograma?.curso_alvo_id || null

    if (itemAlvo?.aula_id && alunoAtual && cursoDaAula) {
      if (concluido) {
        const { data: upsertData, error: aulaError } = await supabase
          .from('aulas_concluidas')
          .upsert(
            {
              aluno_id: alunoAtual,
              aula_id: itemAlvo.aula_id,
              curso_id: cursoDaAula,
            },
            { onConflict: 'aluno_id,aula_id' },
          )
        if (aulaError) {
          console.error('Erro ao registrar aula concluída:', aulaError)
        }
      } else {
        const { error: deleteError } = await supabase
          .from('aulas_concluidas')
          .delete()
          .eq('aluno_id', alunoAtual)
          .eq('aula_id', itemAlvo.aula_id)
        if (deleteError) {
          console.error('Erro ao remover aula concluída:', deleteError)
        }
      }
    }

    if (cronograma) {
      const updatedItems = cronograma.cronograma_itens.map((item: any) =>
        item.id === itemId
          ? { ...item, concluido, data_conclusao: updateData.data_conclusao }
          : item
      )
      setCronograma({ ...cronograma, cronograma_itens: updatedItems })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!cronograma) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Cronograma não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/aluno/cronograma/novo')}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo Cronograma
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Agrupar itens por semana
  const itensPorSemana = cronograma.cronograma_itens.reduce((acc: any, item: any) => {
    if (!acc[item.semana_numero]) {
      acc[item.semana_numero] = []
    }
    acc[item.semana_numero].push(item)
    return acc
  }, {} as Record<number, any[]>)

  // Ordenar itens dentro de cada semana
  Object.keys(itensPorSemana).forEach((semana) => {
    itensPorSemana[Number(semana)].sort((a: any, b: any) => a.ordem_na_semana - b.ordem_na_semana)
  })

  return (
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6 px-2 md:px-4">
      <ScheduleKanban
        itensPorSemana={itensPorSemana}
        cronogramaId={cronogramaId}
        dataInicio={cronograma.data_inicio}
        modalidadeEstudo={cronograma.modalidade_estudo}
        onToggleConcluido={toggleConcluido}
        onUpdate={(updater) => {
          if (cronograma) {
            setCronograma(updater(cronograma))
          }
        }}
      />
    </div>
  )
}


