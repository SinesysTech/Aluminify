'use client'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { AtividadeRow } from './atividade-row'
import { ModuloComAtividades } from '../types'
import { StatusAtividade, DificuldadePercebida } from '@/app/shared/types/enums'

interface ContentListProps {
    modulo: ModuloComAtividades
    onStatusChange?: (atividadeId: string, status: StatusAtividade) => Promise<void>
    onStatusChangeWithDesempenho?: (
        atividadeId: string,
        status: StatusAtividade,
        desempenho: {
            questoesTotais: number
            questoesAcertos: number
            dificuldadePercebida: DificuldadePercebida
            anotacoesPessoais?: string | null
        }
    ) => Promise<void>
}

export function ContentList({
    modulo,
    onStatusChange,
    onStatusChangeWithDesempenho,
}: ContentListProps) {
    const atividadesConcluidas = modulo.atividades.filter(
        (a) => a.progressoStatus === 'Concluido',
    ).length
    const totalAtividades = modulo.atividades.length
    const percentual = totalAtividades > 0 ? Math.round((atividadesConcluidas / totalAtividades) * 100) : 0
    const isComplete = percentual === 100 && totalAtividades > 0
    const hasProgress = percentual > 0

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value={modulo.id} className="border rounded-lg mb-2">
                <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full mr-4">
                        <div className="flex items-center gap-3">
                            {/* Progress badge */}
                            <div
                                className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold shrink-0 transition-colors',
                                    isComplete
                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                        : hasProgress
                                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                            : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {percentual}%
                            </div>
                            <div className="text-left">
                                <span className="font-medium">
                                    Módulo {modulo.numeroModulo || 'N/A'}: {modulo.nome}
                                </span>
                                <div className="text-xs text-muted-foreground">
                                    {atividadesConcluidas}/{totalAtividades} concluídas
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2 mt-2">
                        {modulo.atividades.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhuma atividade disponível
                            </p>
                        ) : (
                            modulo.atividades.map((atividade) => (
                                <AtividadeRow
                                    key={atividade.id}
                                    atividade={atividade}
                                    onStatusChange={onStatusChange}
                                    onStatusChangeWithDesempenho={onStatusChangeWithDesempenho}
                                />
                            ))
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
