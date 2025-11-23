'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/client'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  }
}

interface ScheduleKanbanProps {
  itensPorSemana: Record<number, CronogramaItem[]>
  cronogramaId: string
  dataInicio: string
  modalidadeEstudo: 'paralelo' | 'sequencial'
  onToggleConcluido: (itemId: string, concluido: boolean) => void
  onUpdate: (updater: (prev: any) => any) => void
}

function AulaCard({
  item,
  onToggleConcluido,
}: {
  item: CronogramaItem
  onToggleConcluido: (itemId: string, concluido: boolean) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-move",
        item.concluido && "opacity-60"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Checkbox
                checked={item.concluido}
                onCheckedChange={(checked) =>
                  onToggleConcluido(item.id, checked as boolean)
                }
                onClick={(e) => e.stopPropagation()}
              />
              <Badge variant="outline" className="text-xs">
                Aula {item.aulas.numero_aula || 'N/A'}
              </Badge>
              {item.aulas.modulos?.numero_modulo && (
                <Badge variant="secondary" className="text-xs">
                  Módulo {item.aulas.modulos.numero_modulo}
                </Badge>
              )}
              {item.aulas.modulos?.frentes?.nome && (
                <Badge variant="outline" className="text-xs">
                  {item.aulas.modulos.frentes.nome}
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium line-clamp-2">
              {item.aulas.nome}
            </p>
            {item.aulas.tempo_estimado_minutos && (
              <p className="text-xs text-muted-foreground">
                {item.aulas.tempo_estimado_minutos} min
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ScheduleKanban({
  itensPorSemana,
  cronogramaId,
  dataInicio,
  modalidadeEstudo,
  onToggleConcluido,
  onUpdate,
}: ScheduleKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const semanas = Object.keys(itensPorSemana)
    .map(Number)
    .sort((a, b) => a - b)

  const getSemanaDates = (semanaNumero: number) => {
    const inicio = new Date(dataInicio)
    const inicioSemana = addDays(inicio, (semanaNumero - 1) * 7)
    const fimSemana = addDays(inicioSemana, 6)
    return { inicioSemana, fimSemana }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const itemId = active.id as string
    const overId = over.id as string

    // Encontrar o item atual
    let itemAtual: CronogramaItem | null = null
    let semanaAtual = 0

    for (const [semana, itens] of Object.entries(itensPorSemana)) {
      const item = itens.find((i) => i.id === itemId)
      if (item) {
        itemAtual = item
        semanaAtual = Number(semana)
        break
      }
    }

    if (!itemAtual) return

    // Verificar se está sendo arrastado para outra semana (coluna)
    const novaSemana = overId.toString().startsWith('semana-')
      ? Number(overId.toString().replace('semana-', ''))
      : null

    // Verificar se está sendo arrastado para outro item (reordenação)
    const itemSobre = Object.values(itensPorSemana)
      .flat()
      .find((i) => i.id === overId)

    if (itemSobre && itemSobre.semana_numero === semanaAtual) {
      // Reordenação dentro da mesma semana
      const itens = [...itensPorSemana[semanaAtual]]
      const oldIndex = itens.findIndex((i) => i.id === itemId)
      const newIndex = itens.findIndex((i) => i.id === overId)

      if (oldIndex !== newIndex && newIndex !== -1) {
        const newItems = arrayMove(itens, oldIndex, newIndex)
        const itensAtualizados = newItems.map((item, index) => ({
          ...item,
          ordem_na_semana: index + 1,
        }))

        // Atualizar no banco
        const supabase = createClient()
        for (const item of itensAtualizados) {
          await supabase
            .from('cronograma_itens')
            .update({ ordem_na_semana: item.ordem_na_semana })
            .eq('id', item.id)
        }

        // Atualizar estado local
        onUpdate((prev: any) => {
          if (!prev) return prev
          return {
            ...prev,
            cronograma_itens: prev.cronograma_itens.map((item: CronogramaItem) => {
              const updated = itensAtualizados.find((i) => i.id === item.id)
              return updated || item
            }),
          }
        })
      }
      return
    }

    // Mover para outra semana (arrastar para a coluna)
    if (novaSemana && novaSemana !== semanaAtual) {
      const itensNovaSemana = [...(itensPorSemana[novaSemana] || [])]
      const novaOrdem = itensNovaSemana.length + 1

      // Atualizar no banco
      const supabase = createClient()
      const { error } = await supabase
        .from('cronograma_itens')
        .update({
          semana_numero: novaSemana,
          ordem_na_semana: novaOrdem,
        })
        .eq('id', itemId)

      if (error) {
        console.error('Erro ao atualizar item:', error)
        return
      }

      // Atualizar estado local (optimistic update)
      onUpdate((prev: any) => {
        if (!prev) return prev
        const itens = prev.cronograma_itens.map((item: CronogramaItem) => {
          if (item.id === itemId) {
            return {
              ...item,
              semana_numero: novaSemana,
              ordem_na_semana: novaOrdem,
            }
          }
          return item
        })

        return {
          ...prev,
          cronograma_itens: itens,
        }
      })
    }
  }

  const activeItem = activeId
    ? Object.values(itensPorSemana)
        .flat()
        .find((item) => item.id === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {semanas.map((semana) => {
          const itens = itensPorSemana[semana] || []
          const { inicioSemana, fimSemana } = getSemanaDates(semana)

          return (
            <div
              key={semana}
              id={`semana-${semana}`}
              className="flex-shrink-0 w-80"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="mb-4 space-y-2">
                    <div>
                      <h3 className="font-semibold text-sm">
                        Semana {semana}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {format(inicioSemana, 'dd/MM', { locale: ptBR })} -{' '}
                        {format(fimSemana, 'dd/MM', { locale: ptBR })}
                      </p>
                    </div>
                    {itens.length > 0 && (
                      <div className="text-xs space-y-1 pt-2 border-t">
                        {(() => {
                          const tempoAulas = itens.reduce((acc, item) => {
                            return acc + (item.aulas.tempo_estimado_minutos || 0)
                          }, 0)
                          const tempoAnotacoesExercicios = tempoAulas * 0.5 // 50% do tempo de aulas para anotações e exercícios
                          const tempoTotal = tempoAulas + tempoAnotacoesExercicios
                          
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Aulas:</span>
                                <span className="font-medium">{Math.round(tempoAulas)} min</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Anotações/Exercícios:</span>
                                <span className="font-medium">{Math.round(tempoAnotacoesExercicios)} min</span>
                              </div>
                              <div className="flex justify-between pt-1 border-t">
                                <span className="font-semibold">Total:</span>
                                <span className="font-semibold">{Math.round(tempoTotal)} min ({Math.round(tempoTotal / 60)}h)</span>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                  <ScrollArea className="h-[600px]">
                    <SortableContext
                      items={itens.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {itens.map((item) => (
                          <AulaCard
                            key={item.id}
                            item={item}
                            onToggleConcluido={onToggleConcluido}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
      <DragOverlay>
        {activeItem ? (
          <Card className="w-80">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      Aula {activeItem.aulas.numero_aula || 'N/A'}
                    </Badge>
                    {activeItem.aulas.modulos?.numero_modulo && (
                      <Badge variant="secondary" className="text-xs">
                        Módulo {activeItem.aulas.modulos.numero_modulo}
                      </Badge>
                    )}
                    {activeItem.aulas.modulos?.frentes?.nome && (
                      <Badge variant="outline" className="text-xs">
                        {activeItem.aulas.modulos.frentes.nome}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">{activeItem.aulas.nome}</p>
                  {activeItem.aulas.tempo_estimado_minutos && (
                    <p className="text-xs text-muted-foreground">
                      {activeItem.aulas.tempo_estimado_minutos} min
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
