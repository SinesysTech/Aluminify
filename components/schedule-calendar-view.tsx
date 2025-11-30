'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/client'
import { CalendarDatePicker } from '@/components/calendar-date-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { format, addDays, startOfWeek, isSameDay, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Loader2, Save, ChevronDown, ChevronUp, CheckSquare2 } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface CronogramaItem {
  id: string
  aula_id: string
  semana_numero: number
  ordem_na_semana: number
  concluido: boolean
  data_conclusao: string | null
  aulas: {
    id: string
    nome: string
    numero_aula: number | null
    tempo_estimado_minutos: number | null
    curso_id: string | null
    modulos: {
      id: string
      nome: string
      numero_modulo: number | null
      frentes: {
        id: string
        nome: string
        disciplinas: {
          id: string
          nome: string
        }
      }
    }
  } | null
}

interface Cronograma {
  id: string
  nome: string
  data_inicio: string
  data_fim: string
  dias_estudo_semana: number
  horas_estudo_dia: number
  modalidade_estudo: 'paralelo' | 'sequencial'
  cronograma_itens: CronogramaItem[]
  curso_alvo_id?: string | null
  periodos_ferias?: Array<{ inicio: string; fim: string }>
}

interface ScheduleCalendarViewProps {
  cronogramaId: string
}

interface ItemComData extends CronogramaItem {
  data: Date
}

const DIAS_SEMANA = [
  { valor: 0, nome: 'Domingo', abreviacao: 'Dom' },
  { valor: 1, nome: 'Segunda-feira', abreviacao: 'Seg' },
  { valor: 2, nome: 'Terça-feira', abreviacao: 'Ter' },
  { valor: 3, nome: 'Quarta-feira', abreviacao: 'Qua' },
  { valor: 4, nome: 'Quinta-feira', abreviacao: 'Qui' },
  { valor: 5, nome: 'Sexta-feira', abreviacao: 'Sex' },
  { valor: 6, nome: 'Sábado', abreviacao: 'Sáb' },
]

// Helper para normalizar data para dataKey (yyyy-MM-dd) sempre no horário local
const normalizarDataParaKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function ScheduleCalendarView({ cronogramaId }: ScheduleCalendarViewProps) {
  const [loading, setLoading] = useState(true)
  const [cronograma, setCronograma] = useState<Cronograma | null>(null)
  const [itensPorData, setItensPorData] = useState<Map<string, ItemComData[]>>(new Map())
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  
  // Handler customizado para permitir seleção livre do range
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    // Se já temos um range completo (from e to) e o usuário clicou em uma nova data,
    // resetar o range e começar um novo com a data clicada como from
    if (dateRange?.from && dateRange?.to && range?.from) {
      const clickedDate = range.from
      const currentFrom = dateRange.from
      const currentTo = dateRange.to
      
      // Normalizar datas para comparar apenas dia/mês/ano (sem hora)
      const normalizeDate = (d: Date) => {
        const normalized = new Date(d)
        normalized.setHours(0, 0, 0, 0)
        return normalized
      }
      
      const clickedNormalized = normalizeDate(clickedDate)
      const fromNormalized = normalizeDate(currentFrom)
      const toNormalized = normalizeDate(currentTo)
      
      // Se a data clicada é diferente de ambas as datas do range atual, resetar
      if (
        clickedNormalized.getTime() !== fromNormalized.getTime() &&
        clickedNormalized.getTime() !== toNormalized.getTime()
      ) {
        // Resetar e começar um novo range com a data clicada
        const newRange: DateRange = {
          from: clickedDate,
          to: undefined,
        }
        setDateRange(newRange)
        console.log('[DateRange] Range resetado - nova data inicial:', clickedDate.toISOString().split('T')[0])
        return
      }
    }
    
    // Comportamento normal
    setDateRange(range)
    console.log('[DateRange] Range atualizado:', {
      from: range?.from?.toISOString().split('T')[0],
      to: range?.to?.toISOString().split('T')[0],
    })
  }
  const [userId, setUserId] = useState<string | null>(null)
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([1, 2, 3, 4, 5]) // Padrão: segunda a sexta
  const [diasSalvos, setDiasSalvos] = useState<number[]>([1, 2, 3, 4, 5]) // Dias salvos no banco
  const [manterDiasAtuais, setManterDiasAtuais] = useState(true) // Checkbox "Manter dias atuais"
  const [cardsExpandidos, setCardsExpandidos] = useState<Set<string>>(new Set()) // Cards expandidos (padrão: nenhum)
  const [salvandoDistribuicao, setSalvandoDistribuicao] = useState(false)
  const [itensCompletosCache, setItensCompletosCache] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [calendarForceUpdate, setCalendarForceUpdate] = useState(0)

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

        // Carregar cronograma
        const { data: cronogramaData, error: cronogramaError } = await supabase
          .from('cronogramas')
          .select('*')
          .eq('id', cronogramaId)
          .single()

        if (cronogramaError || !cronogramaData) {
          console.error('Erro ao carregar cronograma:', cronogramaError)
          setLoading(false)
          return
        }

        // Carregar itens (incluindo data_prevista)
        const { data: itensData, error: itensError } = await supabase
          .from('cronograma_itens')
          .select('id, aula_id, semana_numero, ordem_na_semana, concluido, data_conclusao, data_prevista')
          .eq('cronograma_id', cronogramaId)
          .order('semana_numero', { ascending: true })
          .order('ordem_na_semana', { ascending: true })

        if (itensError) {
          console.error('Erro ao carregar itens:', itensError)
        }

        // Carregar aulas
        let itensCompletos: any[] = []
        if (itensData && itensData.length > 0) {
          const aulaIds = [...new Set(itensData.map(item => item.aula_id).filter(Boolean))]
          
          if (aulaIds.length > 0) {
            // Buscar aulas em lotes
            const LOTE_SIZE = 100
            const lotes = []
            for (let i = 0; i < aulaIds.length; i += LOTE_SIZE) {
              lotes.push(aulaIds.slice(i, i + LOTE_SIZE))
            }
            
            const todasAulas: any[] = []
            for (const lote of lotes) {
              const { data: loteData, error: loteError } = await supabase
                .from('aulas')
                .select('id, nome, numero_aula, tempo_estimado_minutos, curso_id, modulo_id')
                .in('id', lote)
              
              if (!loteError && loteData) {
                todasAulas.push(...loteData)
              }
            }

            // Buscar módulos
            const moduloIds = [...new Set(todasAulas.map(a => a.modulo_id).filter(Boolean))]
            let modulosMap = new Map()
            
            if (moduloIds.length > 0) {
              const { data: modulosData } = await supabase
                .from('modulos')
                .select('id, nome, numero_modulo, frente_id')
                .in('id', moduloIds)

              if (modulosData) {
                modulosMap = new Map(modulosData.map(m => [m.id, m]))
              }
            }

            // Buscar frentes
            const frenteIds = [...new Set(Array.from(modulosMap.values()).map((m: any) => m.frente_id).filter(Boolean))]
            let frentesMap = new Map()
            
            if (frenteIds.length > 0) {
              const { data: frentesData } = await supabase
                .from('frentes')
                .select('id, nome, disciplina_id')
                .in('id', frenteIds)

              if (frentesData) {
                frentesMap = new Map(frentesData.map(f => [f.id, f]))
              }
            }

            // Buscar disciplinas
            const disciplinaIds = [...new Set(Array.from(frentesMap.values()).map((f: any) => f.disciplina_id).filter(Boolean))]
            let disciplinasMap = new Map()
            
            if (disciplinaIds.length > 0) {
              const { data: disciplinasData } = await supabase
                .from('disciplinas')
                .select('id, nome')
                .in('id', disciplinaIds)

              if (disciplinasData) {
                disciplinasMap = new Map(disciplinasData.map(d => [d.id, d]))
              }
            }

            // Montar estrutura completa
            const aulasCompletas = todasAulas.map(aula => {
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

            itensCompletos = itensData.map(item => ({
              ...item,
              aulas: aulasMap.get(item.aula_id) || null,
            }))
          }
        }

        const data = {
          ...cronogramaData,
          cronograma_itens: itensCompletos,
        }

        setCronograma(data as Cronograma)
        setItensCompletosCache(itensCompletos)

        // Calcular datas dos itens (usar data_prevista se disponível, senão calcular)
        console.log('[Load] Total de itens carregados:', itensCompletos.length)
        console.log('[Load] Itens com data_prevista:', itensCompletos.filter(i => i.data_prevista).length)
        console.log('[Load] Itens sem data_prevista:', itensCompletos.filter(i => !i.data_prevista).length)
        
        const itensComData = calcularDatasItens(data as Cronograma, itensCompletos)
        const mapaPorData = new Map<string, ItemComData[]>()
        
        // Contador por dia da semana para debug
        const contadorInicialPorDia: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
        
        itensComData.forEach(item => {
          // Usar função helper para normalizar data
          const dataKey = normalizarDataParaKey(item.data)
          const diaSemana = item.data.getDay()
          contadorInicialPorDia[diaSemana] += 1
          
          if (!mapaPorData.has(dataKey)) {
            mapaPorData.set(dataKey, [])
          }
          mapaPorData.get(dataKey)!.push(item)
        })

        console.log('[Load] Contador inicial de itens por dia da semana:', contadorInicialPorDia)
        console.log('[Load] Mapa por data criado com', mapaPorData.size, 'datas únicas')
        setItensPorData(mapaPorData)

        // Definir range inicial como sugestão, mas permitir que o usuário altere livremente
        // O usuário pode clicar em qualquer data para iniciar um novo range
        if (data.data_inicio && data.data_fim) {
          const inicio = new Date(data.data_inicio)
          // Definir range inicial apenas se não houver um range já selecionado pelo usuário
          if (!dateRange) {
            setDateRange({
              from: inicio,
              to: new Date(data.data_fim),
            })
          }
          // Sempre definir o mês inicial do calendário para mostrar o período do cronograma
          setCurrentMonth(inicio)
        }

        // Buscar distribuição de dias da semana
        const { data: distribuicaoData, error: distError } = await supabase
          .from('cronograma_semanas_dias')
          .select('dias_semana')
          .eq('cronograma_id', cronogramaId)
          .maybeSingle()

        if (!distError && distribuicaoData?.dias_semana) {
          setDiasSelecionados(distribuicaoData.dias_semana)
          setDiasSalvos(distribuicaoData.dias_semana) // Salvar também os dias salvos
        }
      } catch (err) {
        console.error('Erro inesperado ao carregar cronograma:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCronograma()
  }, [cronogramaId])

  const calcularDatasItens = (cronograma: Cronograma, itensCompletos: any[]): ItemComData[] => {
    const itensComData: ItemComData[] = []
    
    // Contador por dia da semana para debug
    const contadorPorDia: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    const contadorComDataPrevista: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    const contadorSemDataPrevista: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }

    itensCompletos.forEach((item) => {
      let dataItem: Date

      // Se tiver data_prevista, usar ela
      if (item.data_prevista) {
        // Parsear data_prevista corretamente (pode vir como string YYYY-MM-DD ou ISO)
        const dataPrevistaStr = item.data_prevista
        // Se for apenas data (YYYY-MM-DD), criar Date no horário local para evitar problemas de timezone
        if (typeof dataPrevistaStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dataPrevistaStr)) {
          const [year, month, day] = dataPrevistaStr.split('-').map(Number)
          dataItem = new Date(year, month - 1, day) // month é 0-indexed
        } else {
          dataItem = new Date(dataPrevistaStr)
        }
        
        const diaSemana = dataItem.getDay()
        contadorPorDia[diaSemana] += 1
        contadorComDataPrevista[diaSemana] += 1
        
        // Debug para quinta, sexta, sábado e domingo
        if (diaSemana >= 4 || diaSemana === 0) {
          const nomeDia = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][diaSemana]
          const dataKey = normalizarDataParaKey(dataItem)
          console.log(`[CalcularDatas] Item ${item.id} (semana ${item.semana_numero}, ordem ${item.ordem_na_semana}) tem data_prevista: ${item.data_prevista} -> ${dataKey} (${nomeDia})`)
        }
      } else {
        // Fallback: calcular baseado na semana e ordem (lógica antiga)
        const dataInicio = new Date(cronograma.data_inicio)
        const diasEstudoSemana = cronograma.dias_estudo_semana || 7
        const inicioSemana = addDays(dataInicio, (item.semana_numero - 1) * 7)
        const inicioSemanaUtil = startOfWeek(inicioSemana, { weekStartsOn: 1 }) // Segunda-feira
        const diaNaSemana = (item.ordem_na_semana - 1) % diasEstudoSemana
        dataItem = addDays(inicioSemanaUtil, diaNaSemana)
        
        const diaSemana = dataItem.getDay()
        contadorPorDia[diaSemana] += 1
        contadorSemDataPrevista[diaSemana] += 1
        
        // Debug para quinta, sexta, sábado e domingo
        if (diaSemana >= 4 || diaSemana === 0) {
          const nomeDia = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][diaSemana]
          console.log(`[CalcularDatas] Item ${item.id} (semana ${item.semana_numero}, ordem ${item.ordem_na_semana}) SEM data_prevista, calculado: ${normalizarDataParaKey(dataItem)} (${nomeDia})`)
        }
      }

      itensComData.push({
        ...item,
        data: dataItem,
        data_prevista: item.data_prevista || null,
      })
    })
    
    console.log('[CalcularDatas] Contador total por dia da semana:', contadorPorDia)
    console.log('[CalcularDatas] Contador com data_prevista por dia:', contadorComDataPrevista)
    console.log('[CalcularDatas] Contador sem data_prevista (fallback) por dia:', contadorSemDataPrevista)

    return itensComData
  }

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

    const itemAlvo = cronograma?.cronograma_itens.find((item) => item.id === itemId)
    const alunoAtual = userId || (await supabase.auth.getUser()).data?.user?.id || null
    const cursoDaAula = itemAlvo?.aulas?.curso_id || cronograma?.curso_alvo_id || null

    if (itemAlvo?.aula_id && alunoAtual && cursoDaAula) {
      if (concluido) {
        await supabase
          .from('aulas_concluidas')
          .upsert(
            {
              aluno_id: alunoAtual,
              aula_id: itemAlvo.aula_id,
              curso_id: cursoDaAula,
            },
            { onConflict: 'aluno_id,aula_id' },
          )
      } else {
        await supabase
          .from('aulas_concluidas')
          .delete()
          .eq('aluno_id', alunoAtual)
          .eq('aula_id', itemAlvo.aula_id)
      }
    }

    // Atualizar estado local
    if (cronograma) {
      const updatedItems = itensCompletosCache.map((item) =>
        item.id === itemId
          ? { ...item, concluido, data_conclusao: updateData.data_conclusao }
          : item
      )
      setItensCompletosCache(updatedItems)
      setCronograma({ ...cronograma, cronograma_itens: updatedItems })

      // Atualizar mapa de itens por data
      const itensComData = calcularDatasItens(cronograma, updatedItems)
      const mapaPorData = new Map<string, ItemComData[]>()
      
      itensComData.forEach(item => {
        // Usar função helper para normalizar data
        const dataKey = normalizarDataParaKey(item.data)
        if (!mapaPorData.has(dataKey)) {
          mapaPorData.set(dataKey, [])
        }
        mapaPorData.get(dataKey)!.push(item)
      })

      setItensPorData(mapaPorData)
    }
  }

  const formatTempo = (minutes: number | null) => {
    if (!minutes) return '--'
    const rounded = Math.max(0, Math.round(minutes))
    const hours = Math.floor(rounded / 60)
    const mins = rounded % 60
    const parts = []
    if (hours > 0) parts.push(`${hours}h`)
    if (mins > 0) parts.push(`${mins} min`)
    return parts.length === 0 ? '0 min' : parts.join(' ')
  }

  const toggleTodasAulasDoDia = async (itensDoDia: ItemComData[]) => {
    console.log('[toggleTodasAulasDoDia] Iniciando, itens recebidos:', itensDoDia.length)
    
    if (!cronograma) {
      console.error('[toggleTodasAulasDoDia] Cronograma não encontrado')
      return
    }
    
    if (itensDoDia.length === 0) {
      console.warn('[toggleTodasAulasDoDia] Nenhum item recebido')
      return
    }
    
    const supabase = createClient()
    
    // Verificar se todas já estão concluídas
    const todasConcluidas = itensDoDia.every(item => item.concluido)
    
    // Se todas estão concluídas, desmarcar todas; senão, marcar todas como concluídas
    const novoEstado = !todasConcluidas
    const dataConclusao = novoEstado ? new Date().toISOString() : null
    
    console.log('[toggleTodasAulasDoDia] Estado atual:', { todasConcluidas, novoEstado, totalItens: itensDoDia.length })
    
    // Obter IDs dos itens
    const itemIds = itensDoDia.map(item => item.id)
    console.log('[toggleTodasAulasDoDia] IDs dos itens:', itemIds)
    
    // Atualizar todos os itens no banco de uma vez
    const { error: updateError, data: updateData } = await supabase
      .from('cronograma_itens')
      .update({ 
        concluido: novoEstado,
        data_conclusao: dataConclusao
      })
      .in('id', itemIds)
      .select()
    
    if (updateError) {
      console.error('[toggleTodasAulasDoDia] Erro ao atualizar itens:', updateError)
      alert('Erro ao marcar aulas. Tente novamente.')
      return
    }
    
    console.log('[toggleTodasAulasDoDia] Itens atualizados no banco:', updateData?.length || 0)
    
    // Obter aluno atual
    const alunoAtual = userId || (await supabase.auth.getUser()).data?.user?.id || null
    
    // Atualizar tabela aulas_concluidas para cada item
    if (alunoAtual) {
      const operacoes = itensDoDia.map(async (item) => {
        const itemAlvo = cronograma.cronograma_itens.find((i) => i.id === item.id)
        const cursoDaAula = itemAlvo?.aulas?.curso_id || cronograma.curso_alvo_id || null
        
        if (itemAlvo?.aula_id && cursoDaAula) {
          if (novoEstado) {
            await supabase
              .from('aulas_concluidas')
              .upsert(
                {
                  aluno_id: alunoAtual,
                  aula_id: itemAlvo.aula_id,
                  curso_id: cursoDaAula,
                },
                { onConflict: 'aluno_id,aula_id' },
              )
          } else {
            await supabase
              .from('aulas_concluidas')
              .delete()
              .eq('aluno_id', alunoAtual)
              .eq('aula_id', itemAlvo.aula_id)
          }
        }
      })
      
      await Promise.all(operacoes)
    }
    
    // Atualizar estado local de uma vez
    const updatedItems = itensCompletosCache.map((item) => {
      if (itemIds.includes(item.id)) {
        return { ...item, concluido: novoEstado, data_conclusao: dataConclusao }
      }
      return item
    })
    
    // Criar cronograma atualizado ANTES de usar no calcularDatasItens
    const cronogramaAtualizado = { ...cronograma, cronograma_itens: updatedItems }
    
    setItensCompletosCache(updatedItems)
    setCronograma(cronogramaAtualizado)
    
    // Atualizar mapa de itens por data usando o cronograma atualizado
    const itensComData = calcularDatasItens(cronogramaAtualizado, updatedItems)
    const mapaPorData = new Map<string, ItemComData[]>()
    
    itensComData.forEach(item => {
      const dataKey = normalizarDataParaKey(item.data)
      if (!mapaPorData.has(dataKey)) {
        mapaPorData.set(dataKey, [])
      }
      mapaPorData.get(dataKey)!.push(item)
    })
    
    // Verificar se os itens foram atualizados corretamente
    const itensAtualizadosNoMapa = Array.from(mapaPorData.values()).flat()
    const concluidasNoMapa = itensAtualizadosNoMapa.filter(item => itemIds.includes(item.id) && item.concluido === novoEstado).length
    console.log('[toggleTodasAulasDoDia] Verificação:', {
      totalItensAtualizados: concluidasNoMapa,
      esperado: itemIds.length,
      novoEstado
    })
    
    setItensPorData(mapaPorData)
    
    console.log('[toggleTodasAulasDoDia] Concluído com sucesso')
  }

  const toggleTodasAulasDaFrente = async (itensDaFrente: ItemComData[]) => {
    if (!cronograma || itensDaFrente.length === 0) return
    
    const supabase = createClient()
    
    // Verificar se todas já estão concluídas
    const todasConcluidas = itensDaFrente.every(item => item.concluido)
    
    // Se todas estão concluídas, desmarcar todas; senão, marcar todas como concluídas
    const novoEstado = !todasConcluidas
    const dataConclusao = novoEstado ? new Date().toISOString() : null
    
    // Obter IDs dos itens
    const itemIds = itensDaFrente.map(item => item.id)
    
    // Atualizar todos os itens no banco de uma vez
    const { error: updateError } = await supabase
      .from('cronograma_itens')
      .update({ 
        concluido: novoEstado,
        data_conclusao: dataConclusao
      })
      .in('id', itemIds)
    
    if (updateError) {
      console.error('Erro ao atualizar itens:', updateError)
      return
    }
    
    // Obter aluno atual
    const alunoAtual = userId || (await supabase.auth.getUser()).data?.user?.id || null
    
    // Atualizar tabela aulas_concluidas para cada item
    if (alunoAtual) {
      const operacoes = itensDaFrente.map(async (item) => {
        const itemAlvo = cronograma.cronograma_itens.find((i) => i.id === item.id)
        const cursoDaAula = itemAlvo?.aulas?.curso_id || cronograma.curso_alvo_id || null
        
        if (itemAlvo?.aula_id && cursoDaAula) {
          if (novoEstado) {
            await supabase
              .from('aulas_concluidas')
              .upsert(
                {
                  aluno_id: alunoAtual,
                  aula_id: itemAlvo.aula_id,
                  curso_id: cursoDaAula,
                },
                { onConflict: 'aluno_id,aula_id' },
              )
          } else {
            await supabase
              .from('aulas_concluidas')
              .delete()
              .eq('aluno_id', alunoAtual)
              .eq('aula_id', itemAlvo.aula_id)
          }
        }
      })
      
      await Promise.all(operacoes)
    }
    
    // Atualizar estado local de uma vez
    const updatedItems = itensCompletosCache.map((item) => {
      if (itemIds.includes(item.id)) {
        return { ...item, concluido: novoEstado, data_conclusao: dataConclusao }
      }
      return item
    })
    
    // Criar cronograma atualizado ANTES de usar no calcularDatasItens
    const cronogramaAtualizado = { ...cronograma, cronograma_itens: updatedItems }
    
    setItensCompletosCache(updatedItems)
    setCronograma(cronogramaAtualizado)
    
    // Atualizar mapa de itens por data usando o cronograma atualizado
    const itensComData = calcularDatasItens(cronogramaAtualizado, updatedItems)
    const mapaPorData = new Map<string, ItemComData[]>()
    
    itensComData.forEach(item => {
      const dataKey = normalizarDataParaKey(item.data)
      if (!mapaPorData.has(dataKey)) {
        mapaPorData.set(dataKey, [])
      }
      mapaPorData.get(dataKey)!.push(item)
    })
    
    setItensPorData(mapaPorData)
  }

  const handleToggleDia = (dia: number) => {
    // Se "manter dias atuais" estiver marcado, desmarcar automaticamente ao editar
    if (manterDiasAtuais) {
      setManterDiasAtuais(false)
    }
    
    setDiasSelecionados((prev) => {
      if (prev.includes(dia)) {
        // Remover dia (permitir remover todos se necessário)
        const novo = prev.filter((d) => d !== dia)
        console.log(`[ToggleDia] Removendo dia ${dia}, novos dias:`, novo)
        // Forçar atualização imediata do calendário
        setCalendarForceUpdate(v => v + 1)
        return novo
      } else {
        // Adicionar dia
        const novo = [...prev, dia].sort((a, b) => a - b)
        console.log(`[ToggleDia] Adicionando dia ${dia}, novos dias:`, novo)
        // Forçar atualização imediata do calendário
        setCalendarForceUpdate(v => v + 1)
        return novo
      }
    })
  }

  const handleToggleManterDiasAtuais = (checked: boolean) => {
    setManterDiasAtuais(checked)
    if (checked) {
      // Se marcar "manter dias atuais", restaurar os dias salvos
      setDiasSelecionados(diasSalvos)
      setCalendarForceUpdate(v => v + 1)
    }
  }


  const recarregarCronograma = async () => {
    if (!cronogramaId) return

    try {
      const supabase = createClient()
      
      const { data: userResponse } = await supabase.auth.getUser()
      setUserId(userResponse?.user?.id ?? null)

      // Carregar cronograma
      const { data: cronogramaData, error: cronogramaError } = await supabase
        .from('cronogramas')
        .select('*')
        .eq('id', cronogramaId)
        .single()

      if (cronogramaError || !cronogramaData) {
        console.error('Erro ao carregar cronograma:', cronogramaError)
        return
      }

      // Aguardar um pouco antes de buscar para garantir que o backend terminou
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Carregar itens (incluindo data_prevista atualizada)
      // Forçar busca sem cache usando uma query única
      const timestamp = Date.now()
      const { data: itensData, error: itensError } = await supabase
        .from('cronograma_itens')
        .select('id, aula_id, semana_numero, ordem_na_semana, concluido, data_conclusao, data_prevista')
        .eq('cronograma_id', cronogramaId)
        .order('semana_numero', { ascending: true })
        .order('ordem_na_semana', { ascending: true })
        // Forçar busca sem cache usando um filtro que sempre retorna true mas força nova query
        .gte('semana_numero', 0) // Sempre verdadeiro, mas força nova query
        .limit(999999) // Limite alto para garantir que busca todos
      
      console.log('[RecarregarCronograma] Itens carregados do banco:', itensData?.length || 0)
      
      // Verificar distribuição de data_prevista por dia da semana ANTES de processar
      if (itensData && itensData.length > 0) {
        const distribuicaoDataPrevistaAntes: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
        const exemplosDataPrevista = itensData
          .filter(i => i.data_prevista)
          .slice(0, 20)
          .map(i => {
            const [year, month, day] = i.data_prevista.split('-').map(Number)
            const data = new Date(year, month - 1, day)
            const diaSemana = data.getDay()
            distribuicaoDataPrevistaAntes[diaSemana] += 1
            return { id: i.id, data_prevista: i.data_prevista, diaSemana, nomeDia: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][diaSemana] }
          })
        console.log('[RecarregarCronograma] Distribuição de data_prevista ANTES de processar (primeiros 20):', {
          distribuicao: distribuicaoDataPrevistaAntes,
          exemplos: exemplosDataPrevista,
          totalComDataPrevista: itensData.filter(i => i.data_prevista).length,
          totalSemDataPrevista: itensData.filter(i => !i.data_prevista).length,
        })
      }

      if (itensError) {
        console.error('Erro ao carregar itens:', itensError)
        return
      }

      // Carregar aulas
      let itensCompletos: any[] = []
      if (itensData && itensData.length > 0) {
        const aulaIds = [...new Set(itensData.map(item => item.aula_id).filter(Boolean))]
        
        if (aulaIds.length > 0) {
          // Buscar aulas em lotes
          const LOTE_SIZE = 100
          const lotes = []
          for (let i = 0; i < aulaIds.length; i += LOTE_SIZE) {
            lotes.push(aulaIds.slice(i, i + LOTE_SIZE))
          }
          
          const todasAulas: any[] = []
          for (const lote of lotes) {
            const { data: loteData, error: loteError } = await supabase
              .from('aulas')
              .select('id, nome, numero_aula, tempo_estimado_minutos, curso_id, modulo_id')
              .in('id', lote)
            
            if (!loteError && loteData) {
              todasAulas.push(...loteData)
            }
          }

          // Buscar módulos
          const moduloIds = [...new Set(todasAulas.map(a => a.modulo_id).filter(Boolean))]
          let modulosMap = new Map()
          
          if (moduloIds.length > 0) {
            const { data: modulosData } = await supabase
              .from('modulos')
              .select('id, nome, numero_modulo, frente_id')
              .in('id', moduloIds)

            if (modulosData) {
              modulosMap = new Map(modulosData.map(m => [m.id, m]))
            }
          }

          // Buscar frentes
          const frenteIds = [...new Set(Array.from(modulosMap.values()).map((m: any) => m.frente_id).filter(Boolean))]
          let frentesMap = new Map()
          
          if (frenteIds.length > 0) {
            const { data: frentesData } = await supabase
              .from('frentes')
              .select('id, nome, disciplina_id')
              .in('id', frenteIds)

            if (frentesData) {
              frentesMap = new Map(frentesData.map(f => [f.id, f]))
            }
          }

          // Buscar disciplinas
          const disciplinaIds = [...new Set(Array.from(frentesMap.values()).map((f: any) => f.disciplina_id).filter(Boolean))]
          let disciplinasMap = new Map()
          
          if (disciplinaIds.length > 0) {
            const { data: disciplinasData } = await supabase
              .from('disciplinas')
              .select('id, nome')
              .in('id', disciplinaIds)

            if (disciplinasData) {
              disciplinasMap = new Map(disciplinasData.map(d => [d.id, d]))
            }
          }

          // Montar estrutura completa
          const aulasCompletas = todasAulas.map(aula => {
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

          itensCompletos = itensData.map(item => ({
            ...item,
            aulas: aulasMap.get(item.aula_id) || null,
          }))
        }
      }

      const data = {
        ...cronogramaData,
        cronograma_itens: itensCompletos,
      }

      setCronograma(data as Cronograma)
      setItensCompletosCache(itensCompletos)

      // Calcular datas dos itens (usar data_prevista atualizada)
      console.log('[RecarregarCronograma] Recalculando datas dos itens...')
      console.log('[RecarregarCronograma] Total de itens:', itensCompletos.length)
      console.log('[RecarregarCronograma] Itens com data_prevista:', itensCompletos.filter(i => i.data_prevista).length)
      console.log('[RecarregarCronograma] Itens sem data_prevista:', itensCompletos.filter(i => !i.data_prevista).length)
      
      // Verificar distribuição de data_prevista por dia da semana ANTES de calcular
      const distribuicaoDataPrevista: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
      const exemplosPorDia: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
      itensCompletos.forEach(item => {
        if (item.data_prevista) {
          const [year, month, day] = item.data_prevista.split('-').map(Number)
          const data = new Date(year, month - 1, day)
          const diaSemana = data.getDay()
          distribuicaoDataPrevista[diaSemana] += 1
          if (exemplosPorDia[diaSemana].length < 3) {
            exemplosPorDia[diaSemana].push(item.data_prevista)
          }
        }
      })
      console.log('[RecarregarCronograma] Distribuição de data_prevista por dia da semana (do banco):', {
        distribuicao: distribuicaoDataPrevista,
        exemplos: exemplosPorDia,
        diasSelecionados: diasSelecionados,
      })
      
      // Verificar se há itens com data_prevista nos dias selecionados
      const itensNosDiasSelecionados = itensCompletos.filter(item => {
        if (!item.data_prevista) return false
        const [year, month, day] = item.data_prevista.split('-').map(Number)
        const data = new Date(year, month - 1, day)
        const diaSemana = data.getDay()
        return diasSelecionados.includes(diaSemana)
      })
      console.log('[RecarregarCronograma] Itens com data_prevista nos dias selecionados:', {
        total: itensNosDiasSelecionados.length,
        esperado: itensCompletos.length,
        percentual: itensCompletos.length > 0 ? ((itensNosDiasSelecionados.length / itensCompletos.length) * 100).toFixed(1) + '%' : '0%',
      })
      
      const itensComData = calcularDatasItens(data as Cronograma, itensCompletos)
      const mapaPorData = new Map<string, ItemComData[]>()
      
      itensComData.forEach(item => {
        // Usar função helper para normalizar data
        const dataKey = normalizarDataParaKey(item.data)
        if (!mapaPorData.has(dataKey)) {
          mapaPorData.set(dataKey, [])
        }
        mapaPorData.get(dataKey)!.push(item)
      })
      
      // Log detalhado do mapa por data
      console.log('[RecarregarCronograma] Mapa por data criado com', mapaPorData.size, 'datas únicas')
      const contadorPorDia: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
      const datasPorDia: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
      mapaPorData.forEach((itens, dataKey) => {
        const [year, month, day] = dataKey.split('-').map(Number)
        const data = new Date(year, month - 1, day)
        const diaSemana = data.getDay()
        contadorPorDia[diaSemana] += itens.length
        datasPorDia[diaSemana] += 1
      })
      console.log('[RecarregarCronograma] Contador final por dia da semana:', contadorPorDia)
      console.log('[RecarregarCronograma] Datas únicas por dia da semana:', {
        domingo: `${contadorPorDia[0]} itens em ${datasPorDia[0]} datas`,
        segunda: `${contadorPorDia[1]} itens em ${datasPorDia[1]} datas`,
        terca: `${contadorPorDia[2]} itens em ${datasPorDia[2]} datas`,
        quarta: `${contadorPorDia[3]} itens em ${datasPorDia[3]} datas`,
        quinta: `${contadorPorDia[4]} itens em ${datasPorDia[4]} datas`,
        sexta: `${contadorPorDia[5]} itens em ${datasPorDia[5]} datas`,
        sabado: `${contadorPorDia[6]} itens em ${datasPorDia[6]} datas`,
      })

      setItensPorData(mapaPorData)
      
      // Recarregar distribuição de dias da semana para garantir sincronização
      const { data: distribuicaoData, error: distError } = await supabase
        .from('cronograma_semanas_dias')
        .select('dias_semana')
        .eq('cronograma_id', cronogramaId)
        .maybeSingle()

      if (!distError && distribuicaoData?.dias_semana) {
        setDiasSelecionados(distribuicaoData.dias_semana)
        setDiasSalvos(distribuicaoData.dias_semana) // Atualizar dias salvos
        console.log('[RecarregarCronograma] Dias selecionados recarregados:', distribuicaoData.dias_semana)
      }
    } catch (err) {
      console.error('Erro ao recarregar cronograma:', err)
    }
  }

  const handleSalvarDistribuicao = async () => {
    if (!cronogramaId || cronogramaId.trim() === '' || diasSelecionados.length === 0) {
      console.error('cronogramaId inválido:', cronogramaId)
      alert('Erro: ID do cronograma não encontrado. Por favor, recarregue a página.')
      return
    }

    setSalvandoDistribuicao(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('Sessão não encontrada')
      }

      const response = await fetch(`/api/cronograma/${cronogramaId}/distribuicao-dias`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          dias_semana: diasSelecionados,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errorData.error || 'Erro ao salvar distribuição')
      }

      const responseData = await response.json()
      
      // Atualizar dias selecionados e dias salvos com o que foi salvo no banco
      if (responseData.distribuicao?.dias_semana) {
        setDiasSelecionados(responseData.distribuicao.dias_semana)
        setDiasSalvos(responseData.distribuicao.dias_semana) // Atualizar dias salvos
        setManterDiasAtuais(true) // Voltar para "manter dias atuais" após salvar
        console.log('[SalvarDistribuicao] Dias selecionados atualizados:', responseData.distribuicao.dias_semana)
      }

      // Verificar atualização usando polling
      console.log('[SalvarDistribuicao] Iniciando verificação de atualização...')
      
      const verificarAtualizacaoCompleta = async (): Promise<boolean> => {
        const supabaseCheck = createClient()
        
        // Buscar amostra representativa de itens (aumentar para 200 para melhor verificação)
        const { data: amostraItens, error: amostraError } = await supabaseCheck
          .from('cronograma_itens')
          .select('data_prevista')
          .eq('cronograma_id', cronogramaId)
          .limit(200)
        
        if (amostraError) {
          console.error('[SalvarDistribuicao] Erro ao verificar atualização:', amostraError)
          return false
        }
        
        if (!amostraItens || amostraItens.length === 0) {
          return false
        }
        
        // Verificar distribuição de dias na amostra
        const amostraDias = amostraItens
          .filter(i => i.data_prevista)
          .map(i => {
            const [year, month, day] = i.data_prevista.split('-').map(Number)
            return new Date(year, month - 1, day).getDay()
          })
        const amostraDiasUnicos = [...new Set(amostraDias)]
        
        // Verificar se todos os dias selecionados aparecem na amostra
        const todosDiasPresentes = diasSelecionados.every(d => amostraDiasUnicos.includes(d))
        const percentualComDataPrevista = (amostraItens.filter(i => i.data_prevista).length / amostraItens.length) * 100
        
        // Considerar atualizado se:
        // 1. Todos os dias selecionados aparecem na amostra
        // 2. Pelo menos 90% dos itens têm data_prevista
        // 3. A amostra tem pelo menos os dias selecionados
        const atualizado = todosDiasPresentes && 
                          percentualComDataPrevista >= 90 && 
                          amostraDiasUnicos.length >= diasSelecionados.length
        
        return atualizado
      }
      
      // Polling: verificar a cada 500ms, máximo 20 tentativas (10 segundos)
      const POLLING_INTERVAL = 500
      const MAX_TENTATIVAS = 20
      let tentativas = 0
      let datasAtualizadas = false
      
      while (tentativas < MAX_TENTATIVAS && !datasAtualizadas) {
        tentativas++
        datasAtualizadas = await verificarAtualizacaoCompleta()
        
        if (!datasAtualizadas) {
          console.log(`[SalvarDistribuicao] Tentativa ${tentativas}/${MAX_TENTATIVAS} - Aguardando atualização...`)
          await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL))
        } else {
          console.log('[SalvarDistribuicao] ✅ Datas atualizadas confirmadas!')
        }
      }
      
      if (!datasAtualizadas) {
        console.warn('[SalvarDistribuicao] ⚠️ Não foi possível confirmar atualização das datas após', MAX_TENTATIVAS, 'tentativas. Continuando mesmo assim...')
      }
      
      // Recarregar cronograma com cache desabilitado
      await recarregarCronograma()
      
      // Pequeno delay adicional para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Forçar atualização do calendário após recarregar
      setCalendarForceUpdate(v => v + 1)
      setCurrentMonth(prev => {
        const newMonth = new Date(prev)
        newMonth.setMilliseconds(newMonth.getMilliseconds() + 1)
        return newMonth
      })
      
      console.log('[SalvarDistribuicao] Atualização completa')
    } catch (error) {
      console.error('Erro ao salvar distribuição:', error)
      
      // Tratamento de erro mais robusto
      let errorMessage = 'Erro ao salvar distribuição de dias. Tente novamente.'
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Mensagens de erro mais amigáveis
        if (error.message.includes('Sessão não encontrada')) {
          errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'A operação demorou muito. Tente novamente.'
        }
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // Usar alert por enquanto, mas pode ser substituído por toast/notificação
      alert(errorMessage)
    } finally {
      setSalvandoDistribuicao(false)
    }
  }

  // Filtrar itens por data baseado nos dias selecionados
  // Usar useMemo para recalcular apenas quando itensPorData ou diasSelecionados mudarem
  // IMPORTANTE: Este hook deve ser chamado ANTES de qualquer return condicional
  const itensPorDataFiltrados = useMemo(() => {
    if (!itensPorData || itensPorData.size === 0) {
      console.log('[Filtro] Nenhum item disponível para filtrar')
      return new Map<string, ItemComData[]>()
    }
    
    const filtrados = new Map<string, ItemComData[]>()
    console.log('[Filtro] Dias selecionados:', diasSelecionados)
    console.log('[Filtro] Total de itens antes do filtro:', itensPorData.size)
    
    // Contador por dia da semana para debug
    const contadorPorDia: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    const contadorFiltradoPorDia: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    
    // Primeiro, listar todas as datas que existem no mapa original para debug
    const datasPorDia: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
    itensPorData.forEach((itens, dataKey) => {
      const [year, month, day] = dataKey.split('-').map(Number)
      const data = new Date(year, month - 1, day)
      const diaSemana = data.getDay()
      datasPorDia[diaSemana].push(dataKey)
    })
    console.log('[Filtro] Datas disponíveis por dia da semana:', {
      domingo: datasPorDia[0].length,
      segunda: datasPorDia[1].length,
      terca: datasPorDia[2].length,
      quarta: datasPorDia[3].length,
      quinta: datasPorDia[4].length,
      sexta: datasPorDia[5].length,
      sabado: datasPorDia[6].length,
      exemplosDomingo: datasPorDia[0].slice(0, 3),
      exemplosSegunda: datasPorDia[1].slice(0, 3),
      exemplosTerca: datasPorDia[2].slice(0, 3),
      exemplosQuarta: datasPorDia[3].slice(0, 3),
      exemplosQuinta: datasPorDia[4].slice(0, 3),
      exemplosSexta: datasPorDia[5].slice(0, 3),
      exemplosSabado: datasPorDia[6].slice(0, 3),
    })
    
    itensPorData.forEach((itens, dataKey) => {
      // Criar data no horário local para evitar problemas de fuso horário
      // dataKey está no formato 'yyyy-MM-dd'
      const [year, month, day] = dataKey.split('-').map(Number)
      const data = new Date(year, month - 1, day) // month é 0-indexed no Date
      const diaSemana = data.getDay() // 0=domingo, 1=segunda, ..., 6=sábado
      
      // Contar itens por dia
      contadorPorDia[diaSemana] += itens.length
      
      // Debug para todos os dias (limitado para não poluir muito o console)
      const nomeDia = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][diaSemana]
      if (contadorPorDia[diaSemana] <= 5 || diaSemana === 1 || diaSemana === 2 || diaSemana === 3) {
        // Logar primeiras 5 ocorrências de cada dia, ou sempre para segunda, terça e quarta
        console.log(`[Filtro] Data: ${dataKey}, Dia da semana: ${diaSemana} (${nomeDia}), Itens: ${itens.length}, Incluído: ${diasSelecionados.includes(diaSemana)}`)
      }
      
      if (diasSelecionados.includes(diaSemana)) {
        filtrados.set(dataKey, itens)
        contadorFiltradoPorDia[diaSemana] += itens.length
      }
    })
    
    console.log('[Filtro] Contador por dia (antes do filtro):', contadorPorDia)
    console.log('[Filtro] Contador por dia (após filtro):', contadorFiltradoPorDia)
    console.log('[Filtro] Total de datas após filtro:', filtrados.size)
    
    // Verificar se todos os dias selecionados têm itens
    const diasSemItens: number[] = []
    diasSelecionados.forEach(dia => {
      if (contadorFiltradoPorDia[dia] === 0) {
        diasSemItens.push(dia)
      }
    })
    
    if (diasSemItens.length > 0) {
      const nomesDiasSemItens = diasSemItens.map(d => ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d])
      console.warn('[Filtro] ⚠️ Dias selecionados sem itens após filtro:', nomesDiasSemItens.join(', '))
    } else {
      console.log('[Filtro] ✅ Todos os dias selecionados têm itens após filtro')
    }
    
    // Resumo final
    const totalItensAntes = Object.values(contadorPorDia).reduce((sum, count) => sum + count, 0)
    const totalItensDepois = Object.values(contadorFiltradoPorDia).reduce((sum, count) => sum + count, 0)
    console.log(`[Filtro] Resumo: ${totalItensAntes} itens antes → ${totalItensDepois} itens depois (${filtrados.size} datas únicas)`)
    
    return filtrados
  }, [itensPorData, diasSelecionados])

  // Criar objeto modifiers diretamente com as funções inline
  // Isso garante que o objeto seja recriado sempre que as dependências mudarem
  // IMPORTANTE: Este hook deve ser chamado ANTES de qualquer return condicional
  const modifiers = useMemo(() => {
    // Usar mapa original (não filtrado) para hasAulas e hasConcluidas
    // Essas marcações devem sempre aparecer, independente da seleção de dias
    const itensPorDataMap = new Map(itensPorData)
    const diasSelecionadosSorted = [...diasSelecionados].sort((a, b) => a - b)
    
    console.log('[Modifiers] Recriando modifiers com dias selecionados:', diasSelecionadosSorted.join(','))
    console.log('[Modifiers] Total de datas no mapa original:', itensPorDataMap.size)
    console.log('[Modifiers] Manter dias atuais:', manterDiasAtuais)
    
    return {
      hasAulas: (date: Date) => {
        // Normalizar data para dataKey usando a função helper
        const dataKey = normalizarDataParaKey(date)
        
        // Verificar diretamente se há itens nessa data específica no mapa ORIGINAL (não filtrado)
        // Isso garante que as marcações de aulas sempre apareçam, independente da seleção de dias
        const temAulas = itensPorDataMap.has(dataKey) && (itensPorDataMap.get(dataKey)?.length || 0) > 0
        
        return temAulas
      },
      hasConcluidas: (date: Date) => {
        // Normalizar data para dataKey usando a função helper
        const dataKey = normalizarDataParaKey(date)
        
        // Usar mapa ORIGINAL (não filtrado) para garantir que sempre apareça
        const itens = itensPorDataMap.get(dataKey) || []
        // Verificar se TODAS as aulas do dia estão concluídas
        return itens.length > 0 && itens.every(item => item.concluido)
      },
      hasPendentes: (date: Date) => {
        // Normalizar data para dataKey usando a função helper
        const dataKey = normalizarDataParaKey(date)
        
        // Usar mapa ORIGINAL (não filtrado) para garantir que sempre apareça
        const itens = itensPorDataMap.get(dataKey) || []
        
        if (itens.length === 0) return false // Sem aulas, não é pendente
        
        const concluidas = itens.filter(item => item.concluido).length
        const temConcluidas = concluidas > 0
        const todasConcluidas = concluidas === itens.length
        
        // Pendente = tem aulas, tem pelo menos uma concluída, mas nem todas
        return temConcluidas && !todasConcluidas
      },
      hasDiasSelecionados: (date: Date) => {
        // Se "manter dias atuais" estiver selecionado, não mostrar marcação amarela
        if (manterDiasAtuais) {
          return false
        }
        
        // Verificar se a data corresponde a um dos dias da semana selecionados
        // Aparece apenas se houver pelo menos um dia selecionado no card
        // E se for um dia selecionado (independente de ter aulas ou não)
        if (diasSelecionadosSorted.length === 0) {
          return false // Se nenhum dia estiver selecionado, não mostrar marcação amarela
        }
        
        const diaSemana = date.getDay()
        return diasSelecionadosSorted.includes(diaSemana)
      },
      hasFerias: (date: Date) => {
        // Verificar se a data está dentro de algum período de férias
        if (!cronograma?.periodos_ferias || cronograma.periodos_ferias.length === 0) {
          return false
        }
        
        const dataKey = normalizarDataParaKey(date)
        
        return cronograma.periodos_ferias.some(periodo => {
          const inicio = normalizarDataParaKey(new Date(periodo.inicio))
          const fim = normalizarDataParaKey(new Date(periodo.fim))
          return dataKey >= inicio && dataKey <= fim
        })
      },
    }
  }, [itensPorData, diasSelecionados, manterDiasAtuais, cronograma])

  // Log quando os dias selecionados mudarem para debug e forçar atualização
  // IMPORTANTE: Este hook deve ser chamado DEPOIS de itensPorDataFiltrados e modifiers
  // Usar apenas itensPorDataFiltrados.size para evitar problemas com Map nas dependências
  const itensPorDataSize = itensPorData.size
  const itensPorDataFiltradosSize = itensPorDataFiltrados.size
  
  useEffect(() => {
    console.log('[Effect] Dias selecionados mudaram:', diasSelecionados)
    console.log('[Effect] Itens filtrados disponíveis:', itensPorDataFiltradosSize)
    console.log('[Effect] Total de itens no mapa original:', itensPorDataSize)
    console.log('[Effect] Forçando atualização do calendário...')
    
    // Forçar atualização imediata do calendário quando os dias selecionados mudarem
    // Isso garante que o react-day-picker detecte as mudanças nos modifiers
    // Usar requestAnimationFrame para garantir que o estado foi atualizado antes do re-render
    const frameId = requestAnimationFrame(() => {
      // Forçar re-render do calendário atualizando o mês atual
      // (mas mantendo o mesmo mês para não resetar a visualização)
      setCurrentMonth(prev => {
        const newMonth = new Date(prev)
        // Forçar atualização criando uma nova referência com um pequeno ajuste
        // que não muda o mês visualmente, mas força o re-render
        newMonth.setMilliseconds(newMonth.getMilliseconds() + 1)
        console.log('[Effect] Atualizando mês do calendário para forçar re-render')
        return newMonth
      })
      // Também incrementar o contador de força de atualização
      setCalendarForceUpdate(v => v + 1)
    })
    
    return () => cancelAnimationFrame(frameId)
  }, [diasSelecionados, itensPorDataFiltradosSize, itensPorDataSize])

  // Returns condicionais DEVEM vir DEPOIS de todos os hooks
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
        </Card>
      </div>
    )
  }

  const totalItens = cronograma.cronograma_itens.length
  const itensConcluidos = cronograma.cronograma_itens.filter((item) => item.concluido).length
  const progressoPercentual = totalItens > 0 ? (itensConcluidos / totalItens) * 100 : 0

  return (
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6 px-2 md:px-4">
      {/* Header com Resumo */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg md:text-xl">{cronograma.nome || 'Meu Cronograma'}</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                {format(new Date(cronograma.data_inicio), "dd 'de' MMMM", { locale: ptBR })} -{' '}
                {format(new Date(cronograma.data_fim), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso Geral</span>
              <span>{itensConcluidos} de {totalItens} aulas concluídas</span>
            </div>
            <Progress value={progressoPercentual} />
            <p className="text-xs text-muted-foreground">
              {progressoPercentual.toFixed(1)}% completo
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Calendário */}
      <Card>
        <CardHeader>
          <CardTitle>Calendário de Estudos</CardTitle>
          <CardDescription>
            Visualize suas aulas agendadas e marque as concluídas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Seletor de Range */}
          <div className="flex flex-col gap-3">
            <CalendarDatePicker
              date={dateRange}
              onDateSelect={handleDateRangeSelect}
              numberOfMonths={2}
            />
          </div>

          {/* Calendário com marcações e painel de filtros */}
          <div className="flex flex-col lg:flex-row gap-3 lg:items-stretch w-full">
            {/* Calendário */}
            <div className="flex flex-col w-full lg:flex-1">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={modifiers}
                modifiersClassNames={{
                  // hasConcluidas: verde (prioridade máxima - todas as aulas concluídas)
                  hasConcluidas: 'bg-green-50 dark:bg-green-950 border-2 border-green-300 dark:border-green-700',
                  // hasPendentes: laranja (prioridade média - algumas aulas concluídas mas não todas)
                  hasPendentes: 'bg-orange-50 dark:bg-orange-950 border-2 border-orange-300 dark:border-orange-700',
                  // hasAulas: azul (prioridade baixa - tem aulas mas nenhuma concluída)
                  hasAulas: 'bg-blue-50 dark:bg-blue-950 border-2 border-blue-300 dark:border-blue-700',
                  // hasDiasSelecionados: amarelo (prioridade baixa - dia selecionado sem aulas ainda)
                  hasDiasSelecionados: 'bg-yellow-50/50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800',
                  // hasFerias: rosa (períodos de férias e recesso)
                  hasFerias: 'bg-pink-50 dark:bg-pink-950 border-2 border-pink-300 dark:border-pink-700',
                }}
                numberOfMonths={2}
                className="rounded-md border w-full"
                locale={ptBR}
                // Forçar atualização preservando o mês
                defaultMonth={currentMonth}
              />
              <p className="text-xs text-muted-foreground mt-1.5 text-left">
                💡 Dica: Dê um duplo clique em qualquer data para alterar a data inicial a qualquer momento
              </p>
              
              {/* Legenda e Instruções */}
              <Card className="mt-3 w-full py-1">
                <div className="flex flex-col md:flex-row gap-3 items-start">
                  {/* Primeira parte: Legendas */}
                  <div className="md:w-64 flex-shrink-0">
                    <CardHeader className="pb-1 pt-1.5 px-3">
                      <CardTitle className="text-base font-bold">Legendas</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-1.5 pt-0">
                      <div className="flex flex-col gap-1.5 text-sm">
                        <div className="flex items-center gap-2 h-5">
                          <div className="w-4 h-4 rounded bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 flex-shrink-0" />
                          <span className="text-xs">Dias selecionados para estudo</span>
                        </div>
                        <div className="flex items-center gap-2 h-5">
                          <div className="w-4 h-4 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex-shrink-0" />
                          <span className="text-xs">Dia com aulas</span>
                        </div>
                        <div className="flex items-center gap-2 h-5">
                          <div className="w-4 h-4 rounded bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex-shrink-0" />
                          <span className="text-xs">Dia com aulas concluídas</span>
                        </div>
                        <div className="flex items-center gap-2 h-5">
                          <div className="w-4 h-4 rounded bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 flex-shrink-0" />
                          <span className="text-xs">Dia com aulas pendentes</span>
                        </div>
                        <div className="flex items-center gap-2 h-5">
                          <div className="w-4 h-4 rounded bg-pink-50 dark:bg-pink-950 border border-pink-200 dark:border-pink-800 flex-shrink-0" />
                          <span className="text-xs">Períodos de férias e recesso</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                  
                  {/* Divisor vertical */}
                  <Separator orientation="vertical" className="hidden md:block" />
                  
                  {/* Segunda parte: Instruções */}
                  <div className="md:w-[500px] flex-shrink-0">
                    <CardHeader className="pb-1 pt-1.5 px-3">
                      <CardTitle className="text-base font-bold">Como usar</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-1.5 pt-0">
                      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2 whitespace-nowrap h-5">
                          <span className="font-medium flex-shrink-0">•</span>
                          <span>Selecione os dias da semana em que deseja estudar no painel lateral</span>
                        </div>
                        <div className="flex items-center gap-2 whitespace-nowrap h-5">
                          <span className="font-medium flex-shrink-0">•</span>
                          <span>Clique em "Salvar e Atualizar Calendário" para recalcular as datas das aulas</span>
                        </div>
                        <div className="flex items-center gap-2 whitespace-nowrap h-5">
                          <span className="font-medium flex-shrink-0">•</span>
                          <span>Use o botão de data para selecionar um período e ver as aulas agendadas</span>
                        </div>
                        <div className="flex items-center gap-2 whitespace-nowrap h-5">
                          <span className="font-medium flex-shrink-0">•</span>
                          <span>Marque as aulas como concluídas usando os checkboxes na lista</span>
                        </div>
                        <div className="flex items-center gap-2 whitespace-nowrap h-5">
                          <span className="font-medium flex-shrink-0">•</span>
                          <span>Dê um duplo clique em qualquer data do calendário para alterar o período selecionado</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </div>

            {/* Painel de Filtros - Lado Direito - Alinhado com o calendário */}
            <Card className="w-full lg:w-80 flex-shrink-0 flex flex-col border rounded-md shadow-sm py-2">
              <CardHeader className="pb-1 pt-2 px-3">
                <CardTitle className="text-base font-bold leading-tight">Selecionar dias para ver a aula</CardTitle>
                <CardDescription className="text-xs mt-0.5 leading-tight mb-0">
                  Selecione os dias em que deseja ver as aulas no calendário
                </CardDescription>
                {(() => {
                  // Verificar se há dias selecionados sem itens
                  const diasComItens = new Set<number>()
                  itensPorDataFiltrados.forEach((itens, dataKey) => {
                    const [year, month, day] = dataKey.split('-').map(Number)
                    const data = new Date(year, month - 1, day)
                    const diaSemana = data.getDay()
                    if (itens.length > 0) {
                      diasComItens.add(diaSemana)
                    }
                  })
                  const diasSemItens = diasSelecionados.filter(dia => !diasComItens.has(dia))
                  
                  if (diasSemItens.length > 0 && diasSelecionados.length < 7) {
                    const nomesDiasSemItens = diasSemItens.map(d => ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d])
                    return (
                      <div className="mt-1.5 p-1.5 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200 leading-tight">
                        <p className="font-medium">Atenção:</p>
                        <p>Os dias {nomesDiasSemItens.join(', ')} estão selecionados mas não têm aulas ainda. Clique em "Salvar e Atualizar Calendário" para recalcular as datas.</p>
                      </div>
                    )
                  }
                  return null
                })()}
              </CardHeader>
              <CardContent className="flex flex-col px-3 pb-1 pt-1">
                {/* Divisão visual antes do checkbox */}
                <Separator className="mb-2" />
                
                {/* Checkbox "Manter dias atuais" e dias da semana em grid compacto */}
                <div className="mb-2 pb-2 border-b">
                  <div className="flex items-center space-x-2 py-0.5 mb-1">
                    <Checkbox
                      id="manter-dias-atuais"
                      checked={manterDiasAtuais}
                      onCheckedChange={handleToggleManterDiasAtuais}
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor="manter-dias-atuais"
                      className="text-sm font-medium cursor-pointer flex-1 leading-tight"
                    >
                      Manter dias atuais
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6 mb-1.5 leading-tight">
                    {manterDiasAtuais 
                      ? 'Usando os dias salvos no calendário. Desmarque para editar.'
                      : 'Edite os dias selecionados ou desmarque todos para ver apenas as aulas.'}
                  </p>
                  
                  {/* Divisão visual */}
                  <Separator className="my-2" />
                  
                  {/* Lista de dias da semana - vertical */}
                  <div className="flex flex-col gap-1">
                    {DIAS_SEMANA.map((dia) => (
                      <div key={dia.valor} className="flex items-center space-x-2 py-0.5">
                        <Checkbox
                          id={`dia-${dia.valor}`}
                          checked={diasSelecionados.includes(dia.valor)}
                          onCheckedChange={() => handleToggleDia(dia.valor)}
                          disabled={manterDiasAtuais}
                          className="h-4 w-4"
                        />
                        <Label
                          htmlFor={`dia-${dia.valor}`}
                          className={cn(
                            "text-sm font-normal flex-1 leading-tight",
                            manterDiasAtuais ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                          )}
                        >
                          {dia.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão de salvar */}
                <div className="space-y-1 mt-2">
                  <Separator className="my-1" />
                  <Button
                    onClick={handleSalvarDistribuicao}
                    disabled={salvandoDistribuicao || (diasSelecionados.length === 0 && !manterDiasAtuais)}
                    className="w-full"
                    size="sm"
                  >
                    {salvandoDistribuicao ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar e Atualizar Calendário
                      </>
                    )}
                  </Button>
                  {salvandoDistribuicao && (
                    <p className="text-xs text-muted-foreground text-center animate-pulse leading-tight mt-1">
                      Recalculando datas das aulas...
                    </p>
                  )}
                  {!salvandoDistribuicao && (
                    <p className="text-xs text-muted-foreground text-center leading-tight mt-1 mb-0">
                      Ao salvar, as datas das aulas serão recalculadas automaticamente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de itens por data (quando uma data é selecionada) */}
          {dateRange?.from && (
            <div className="mt-6 space-y-4" key={`lista-aulas-${itensPorData.size}-${dateRange.from?.getTime()}-${dateRange.to?.getTime()}`}>
              <h3 className="text-lg font-semibold">
                Aulas do período selecionado
              </h3>
              <div className="space-y-2">
                {(() => {
                  // Usar itensPorData (mapa original) em vez de itensPorDataFiltrados
                  // para mostrar TODAS as aulas do período selecionado, independente do filtro de dias
                  // Log detalhado das datas disponíveis
                  const todasDatasOriginais = Array.from(itensPorData.keys()).sort()
                  const primeiraData = todasDatasOriginais[0]
                  const ultimaData = todasDatasOriginais[todasDatasOriginais.length - 1]
                  
                  console.log('[FiltroPeríodo] Iniciando filtro de período:', {
                    dateRangeFrom: dateRange.from ? normalizarDataParaKey(dateRange.from) : null,
                    dateRangeTo: dateRange.to ? normalizarDataParaKey(dateRange.to) : null,
                    dateRangeFromISO: dateRange.from?.toISOString(),
                    dateRangeToISO: dateRange.to?.toISOString(),
                    totalItensOriginais: itensPorData.size,
                    totalItensFiltrados: itensPorDataFiltrados.size,
                    primeiraDataNoMapa: primeiraData,
                    ultimaDataNoMapa: ultimaData,
                    totalDatasNoMapa: todasDatasOriginais.length,
                    exemplosDatasOriginais: todasDatasOriginais.slice(0, 10),
                    exemplosDatasFiltradas: Array.from(itensPorDataFiltrados.keys()).slice(0, 10),
                  })
                  
                  // Verificar se as datas do range estão dentro do intervalo do mapa
                  if (dateRange.from) {
                    const fromKey = normalizarDataParaKey(dateRange.from)
                    const fromInMap = itensPorData.has(fromKey)
                    console.log('[FiltroPeríodo] Verificando data inicial:', {
                      fromKey,
                      fromInMap,
                      primeiraDataNoMapa: primeiraData,
                      ultimaDataNoMapa: ultimaData,
                      fromKeyAntesPrimeira: fromKey < primeiraData,
                      fromKeyDepoisUltima: fromKey > ultimaData,
                    })
                  }
                  
                  if (dateRange.to) {
                    const toKey = normalizarDataParaKey(dateRange.to)
                    const toInMap = itensPorData.has(toKey)
                    console.log('[FiltroPeríodo] Verificando data final:', {
                      toKey,
                      toInMap,
                      primeiraDataNoMapa: primeiraData,
                      ultimaDataNoMapa: ultimaData,
                      toKeyAntesPrimeira: toKey < primeiraData,
                      toKeyDepoisUltima: toKey > ultimaData,
                    })
                  }
                  
                  // Filtrar itens baseado no range selecionado
                  // Usar itensPorData para mostrar todas as aulas do período, não apenas as dos dias filtrados
                  
                  // Normalizar datas do range para comparação
                  const normalizeDate = (d: Date) => {
                    const normalized = new Date(d)
                    normalized.setHours(0, 0, 0, 0)
                    return normalized
                  }
                  
                  const fromNormalizada = dateRange.from ? normalizeDate(dateRange.from) : null
                  const toNormalizada = dateRange.to ? normalizeDate(dateRange.to) : null
                  
                  // Converter para dataKey para comparação direta
                  const fromKey = fromNormalizada ? normalizarDataParaKey(fromNormalizada) : null
                  const toKey = toNormalizada ? normalizarDataParaKey(toNormalizada) : null
                  
                  console.log('[FiltroPeríodo] Range normalizado:', {
                    fromKey,
                    toKey,
                    fromTime: fromNormalizada?.getTime(),
                    toTime: toNormalizada?.getTime(),
                  })
                  
                  const itensFiltrados = Array.from(itensPorData.entries())
                    .filter(([dataKey, itens]) => {
                      if (!fromKey) return false
                      
                      // Se apenas from está selecionado, mostrar apenas esse dia
                      if (!toKey) {
                        const matches = dataKey === fromKey
                        if (matches) {
                          console.log('[FiltroPeríodo] Item encontrado (apenas from):', {
                            dataKey,
                            fromKey,
                            itensCount: itens.length,
                          })
                        }
                        return matches
                      }
                      
                      // Se ambos estão selecionados, mostrar intervalo
                      // Comparar strings diretamente (já estão no formato yyyy-MM-dd)
                      const withinInterval = dataKey >= fromKey && dataKey <= toKey
                      
                      if (withinInterval) {
                        console.log('[FiltroPeríodo] Item encontrado (range):', {
                          dataKey,
                          fromKey,
                          toKey,
                          itensCount: itens.length,
                        })
                      } else {
                        // Log apenas para algumas datas para debug (não todas para não poluir)
                        const [year, month, day] = dataKey.split('-').map(Number)
                        const data = new Date(year, month - 1, day)
                        const diaSemana = data.getDay()
                        // Log apenas para segunda, quarta e sexta (dias que o usuário reportou problemas)
                        if ((diaSemana === 1 || diaSemana === 3 || diaSemana === 5) && itens.length > 0) {
                          console.log('[FiltroPeríodo] Item FORA do range:', {
                            dataKey,
                            fromKey,
                            toKey,
                            itensCount: itens.length,
                            antes: dataKey < fromKey,
                            depois: dataKey > toKey,
                          })
                        }
                      }
                      
                      return withinInterval
                    })
                    .sort(([a], [b]) => a.localeCompare(b))
                  
                  console.log('[FiltroPeríodo] Resultado final:', {
                    totalFiltrados: itensFiltrados.length,
                    datasEncontradas: itensFiltrados.map(([key]) => key),
                    totalItensNoMapa: itensPorDataFiltrados.size,
                    todasDatasNoMapa: Array.from(itensPorDataFiltrados.keys()),
                  })
                  
                  if (itensFiltrados.length === 0) {
                    // Verificar se há itens no mapa original que não estão sendo filtrados
                    const todasDatas = Array.from(itensPorData.keys()).sort()
                    const primeiraData = todasDatas[0]
                    const ultimaData = todasDatas[todasDatas.length - 1]
                    
                    console.warn('[FiltroPeríodo] Nenhum item encontrado. Verificando...', {
                      periodoSelecionado: {
                        from: fromKey,
                        to: toKey || 'apenas from',
                      },
                      periodoSelecionadoISO: {
                        from: dateRange.from?.toISOString().split('T')[0],
                        to: dateRange.to?.toISOString().split('T')[0] || 'apenas from',
                      },
                      totalDatasDisponiveis: todasDatas.length,
                      primeiraDataNoMapa: primeiraData,
                      ultimaDataNoMapa: ultimaData,
                      primeirasDatas: todasDatas.slice(0, 10),
                      ultimasDatas: todasDatas.slice(-10),
                      rangeDentroDoMapa: fromKey && toKey ? (fromKey >= primeiraData && toKey <= ultimaData) : null,
                    })
                    
                    return (
                      <div className="text-sm text-muted-foreground text-center py-4 space-y-2">
                        <p>Nenhuma aula encontrada para o período selecionado.</p>
                        {itensPorData.size === 0 ? (
                          <p className="text-xs">
                            Nenhuma aula foi encontrada no cronograma. Verifique se o cronograma possui itens.
                          </p>
                        ) : (
                          <p className="text-xs">
                            O período selecionado pode estar fora do intervalo do cronograma ({primeiraData} a {ultimaData}).
                          </p>
                        )}
                      </div>
                    )
                  }
                  
                  return itensFiltrados.map(([dataKey, itens]) => {
                    // Criar data no horário local para formatação
                    const [year, month, day] = dataKey.split('-').map(Number)
                    const data = new Date(year, month - 1, day)
                    
                    // Agrupar itens por disciplina e frente
                    const itensAgrupados = new Map<string, typeof itens>()
                    
                    itens.forEach((item) => {
                      const disciplinaNome = item.aulas?.modulos?.frentes?.disciplinas?.nome || 'Sem disciplina'
                      const frenteNome = item.aulas?.modulos?.frentes?.nome || 'Sem frente'
                      const chave = `${disciplinaNome}|||${frenteNome}`
                      
                      if (!itensAgrupados.has(chave)) {
                        itensAgrupados.set(chave, [])
                      }
                      itensAgrupados.get(chave)!.push(item)
                    })
                    
                    // Ordenar grupos por disciplina e depois por frente
                    const gruposOrdenados = Array.from(itensAgrupados.entries()).sort(([chaveA], [chaveB]) => {
                      return chaveA.localeCompare(chaveB)
                    })
                    
                    // Verificar se todas as aulas do dia estão concluídas
                    const todasAulasDoDiaConcluidas = itens.every(item => item.concluido)
                    const peloMenosUmaAulaDoDia = itens.length > 0
                    // Criar chave única que inclui o estado de conclusão para forçar re-render
                    const concluidasCount = itens.filter(item => item.concluido).length
                    const cardKey = `${dataKey}-${concluidasCount}-${itens.length}`
                    
                    return (
                      <Card key={cardKey}>
                        <CardHeader>
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-base">
                              {format(data, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </CardTitle>
                            {peloMenosUmaAulaDoDia && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async (e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  console.log('[Button] Clicado, itens:', itens.length)
                                  await toggleTodasAulasDoDia(itens)
                                }}
                                className="flex items-center gap-2"
                              >
                                <CheckSquare2 className="h-4 w-4" />
                                {todasAulasDoDiaConcluidas ? 'Desmarcar todas' : 'Marcar todas'}
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {gruposOrdenados.map(([chave, itensGrupo]) => {
                              const [disciplinaNome, frenteNome] = chave.split('|||')
                              const disciplinaId = itensGrupo[0]?.aulas?.modulos?.frentes?.disciplinas?.id || ''
                              const frenteId = itensGrupo[0]?.aulas?.modulos?.frentes?.id || ''
                              
                              // Gerar cor única baseada no ID da disciplina e frente para diferenciação visual
                              const hash = (disciplinaId + frenteId).split('').reduce((acc, char) => {
                                return char.charCodeAt(0) + ((acc << 5) - acc)
                              }, 0)
                              const hue = Math.abs(hash) % 360
                              const borderColor = `hsl(${hue}, 70%, 50%)`
                              
                              // Estilo dinâmico para borda colorida (cores geradas dinamicamente)
                              const borderStyle: React.CSSProperties & { '--border-color'?: string } = {
                                '--border-color': borderColor,
                                borderLeftColor: 'var(--border-color)',
                              }
                              
                              const estaExpandido = cardsExpandidos.has(chave)
                              
                              return (
                                <Collapsible
                                  key={chave}
                                  open={estaExpandido}
                                  onOpenChange={(open) => {
                                    setCardsExpandidos(prev => {
                                      const novo = new Set(prev)
                                      if (open) {
                                        novo.add(chave)
                                      } else {
                                        novo.delete(chave)
                                      }
                                      return novo
                                    })
                                  }}
                                >
                                  {/* eslint-disable-next-line react/forbid-dom-props -- Cores dinâmicas geradas por hash não podem ser pré-definidas */}
                                  <div
                                    className="border rounded-lg p-4 bg-card space-y-2 border-l-4"
                                    style={borderStyle}
                                  >
                                    {/* Cabeçalho do grupo: Disciplina e Frente */}
                                    <div className="mb-3 pb-2 border-b">
                                      <CollapsibleTrigger asChild>
                                        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                                          <div className="flex-1">
                                            <h4 className="font-semibold text-sm">{disciplinaNome}</h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">{frenteNome}</p>
                                            
                                            {/* Informações agregadas do grupo */}
                                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                                              <span>
                                                <span className="font-medium">Número de aulas:</span> {itensGrupo.length}
                                              </span>
                                              {(() => {
                                                const tempoAulas = itensGrupo.reduce((acc, item) => {
                                                  return acc + (item.aulas?.tempo_estimado_minutos || 0)
                                                }, 0)
                                                const tempoAnotacoesExercicios = tempoAulas * 0.5 // 50% do tempo de aulas para anotações e exercícios
                                                
                                                return (
                                                  <>
                                                    {tempoAulas > 0 && (
                                                      <span>
                                                        <span className="font-medium">Tempo estimado de aula:</span> {formatTempo(tempoAulas)}
                                                      </span>
                                                    )}
                                                    {tempoAnotacoesExercicios > 0 && (
                                                      <span>
                                                        <span className="font-medium">Tempo estimado de Anotações/Exercícios:</span> {formatTempo(tempoAnotacoesExercicios)}
                                                      </span>
                                                    )}
                                                  </>
                                                )
                                              })()}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {/* Estilo dinâmico para badge colorido (cores geradas dinamicamente) */}
                                            {/* eslint-disable-next-line react/forbid-dom-props */}
                                            <Badge 
                                              variant="outline" 
                                              className="text-xs"
                                              style={{
                                                '--badge-border-color': borderColor,
                                                '--badge-text-color': borderColor,
                                                borderColor: 'var(--badge-border-color)',
                                                color: 'var(--badge-text-color)',
                                              } as React.CSSProperties & { '--badge-border-color': string; '--badge-text-color': string }}
                                            >
                                              {itensGrupo.length} {itensGrupo.length === 1 ? 'aula' : 'aulas'}
                                            </Badge>
                                            {estaExpandido ? (
                                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            )}
                                          </div>
                                        </div>
                                      </CollapsibleTrigger>
                                      {/* Botão para marcar todas as aulas da frente */}
                                      <div className="mt-2 flex justify-end">
                                        {(() => {
                                          const todasAulasDaFrenteConcluidas = itensGrupo.every(item => item.concluido)
                                          return (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                toggleTodasAulasDaFrente(itensGrupo)
                                              }}
                                              className="flex items-center gap-2 text-xs h-7"
                                            >
                                              <CheckSquare2 className="h-3.5 w-3.5" />
                                              {todasAulasDaFrenteConcluidas ? 'Desmarcar todas' : 'Marcar todas'}
                                            </Button>
                                          )
                                        })()}
                                      </div>
                                    </div>
                                    
                                    {/* Lista de aulas do grupo */}
                                    <CollapsibleContent>
                                      <div className="space-y-2">
                                    {itensGrupo.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-start gap-3 p-2 rounded-md border hover:bg-accent/50 transition-colors"
                                      >
                                        <Checkbox
                                          checked={item.concluido}
                                          onCheckedChange={(checked) =>
                                            toggleConcluido(item.id, checked === true)
                                          }
                                          className="mt-1"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                              {/* Badges: Aula, Módulo, Frente */}
                                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                {item.aulas?.numero_aula && (
                                                  <Badge variant="outline" className="text-xs">
                                                    Aula {item.aulas.numero_aula}
                                                  </Badge>
                                                )}
                                                {item.aulas?.modulos?.numero_modulo && (
                                                  <Badge variant="secondary" className="text-xs">
                                                    Módulo {item.aulas.modulos.numero_modulo}
                                                  </Badge>
                                                )}
                                                {item.aulas?.modulos?.frentes?.nome && (
                                                  <Badge variant="outline" className="text-xs">
                                                    {item.aulas.modulos.frentes.nome}
                                                  </Badge>
                                                )}
                                              </div>
                                              
                                              {/* Nome da aula */}
                                              <p className="font-medium text-sm mb-1">
                                                {item.aulas?.nome || 'Aula sem nome'}
                                              </p>
                                              
                                              {/* Tempo estimado */}
                                              {item.aulas?.tempo_estimado_minutos && (
                                                <p className="text-xs text-muted-foreground">
                                                  {formatTempo(item.aulas.tempo_estimado_minutos)}
                                                </p>
                                              )}
                                            </div>
                                            
                                            {/* Badge de concluída */}
                                            {item.concluido && (
                                              <Badge variant="default" className="text-xs shrink-0">
                                                Concluída
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                      </div>
                                    </CollapsibleContent>
                                  </div>
                                </Collapsible>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                })()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

