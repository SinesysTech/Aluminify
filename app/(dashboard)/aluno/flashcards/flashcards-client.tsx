'use client'

import React from 'react'
import { createClient } from '@/lib/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, Loader2, RefreshCcw, BrainCircuit } from 'lucide-react'

type Flashcard = {
  id: string
  pergunta: string
  resposta: string
  importancia?: string | null
}

const MODOS = [
  { id: 'mais_cobrados', title: '🔥 Mais Cobrados', desc: 'Foco no que cai na prova' },
  { id: 'revisao_geral', title: '🧠 Revisão Geral', desc: 'Conteúdo misto' },
  { id: 'mais_errados', title: '🚑 UTI dos Erros', desc: 'Foco nas dificuldades' },
]

export default function FlashcardsClient() {
  const supabase = createClient()
  const [modo, setModo] = React.useState<string | null>(null)
  const [cards, setCards] = React.useState<Flashcard[]>([])
  const [idx, setIdx] = React.useState(0)
  const [showAnswer, setShowAnswer] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const current = cards[idx]
  const progresso = cards.length > 0 ? ((idx + 1) / cards.length) * 100 : 0

  const fetchWithAuth = React.useCallback(
    async (input: string, init?: RequestInit) => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }

      const headers = new Headers(init?.headers || {})
      if (!(init?.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json')
      }
      headers.set('Authorization', `Bearer ${session.access_token}`)

      return fetch(input, {
        ...init,
        headers,
      })
    },
    [supabase],
  )

  const fetchCards = React.useCallback(
    async (modoSelecionado: string) => {
      try {
        setLoading(true)
        setError(null)
        setShowAnswer(false)
        setIdx(0)
        const res = await fetchWithAuth(`/api/flashcards/revisao?modo=${modoSelecionado}`)
        const body = await res.json()
        if (!res.ok) {
          throw new Error(body?.error || 'Não foi possível carregar os flashcards')
        }
        setCards(body.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar flashcards')
      } finally {
        setLoading(false)
      }
    },
    [fetchWithAuth],
  )

  const handleSelectModo = (id: string) => {
    setModo(id)
    fetchCards(id)
  }

  const handleFeedback = async (feedback: number) => {
    if (!current) return
    try {
      await fetchWithAuth('/api/flashcards/feedback', {
        method: 'POST',
        body: JSON.stringify({ cardId: current.id, feedback }),
      })
    } catch (err) {
      console.error('Erro ao enviar feedback', err)
    } finally {
      // Avançar para próximo
      if (idx + 1 < cards.length) {
        setIdx(idx + 1)
        setShowAnswer(false)
      } else {
        setCards([])
      }
    }
  }

  const handleReload = () => {
    if (modo) fetchCards(modo)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Flashcards
          <Badge variant="secondary">SRS</Badge>
        </h1>
        <p className="text-muted-foreground">Selecione o modo e revise com espaçamento inteligente.</p>
      </div>

      {/* Modo de seleção */}
      <div className="grid gap-4 md:grid-cols-3">
        {MODOS.map((m) => (
          <Card
            key={m.id}
            className={`cursor-pointer transition hover:border-primary ${modo === m.id ? 'border-primary shadow-md' : ''}`}
            onClick={() => handleSelectModo(m.id)}
          >
            <CardHeader>
              <CardTitle>{m.title}</CardTitle>
              <CardDescription>{m.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Estado de carregamento/erro */}
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando flashcards...
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Sessão de estudo */}
      {!loading && modo && cards.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="font-semibold">Nenhum card disponível agora.</p>
              <p className="text-sm text-muted-foreground">
                Tente outro modo ou volte mais tarde.
              </p>
            </div>
            <Button variant="outline" onClick={handleReload}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Recarregar
            </Button>
          </CardContent>
        </Card>
      )}

      {current && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BrainCircuit className="h-4 w-4" />
              {modo === 'mais_cobrados' && 'Foco: importância Alta'}
              {modo === 'mais_errados' && 'Foco: dificuldades e baixo aproveitamento'}
              {modo === 'revisao_geral' && 'Foco: revisão mista'}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {idx + 1} / {cards.length}
              </span>
              <Badge variant="outline">
                {current.importancia ? `Importância: ${current.importancia}` : 'Importância: -'}
              </Badge>
              <Button size="sm" variant="outline" onClick={handleReload}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Recarregar
              </Button>
            </div>
          </div>

          <Progress value={progresso} className="h-2" />

          <Card className="cursor-pointer border-primary/50" onClick={() => setShowAnswer(!showAnswer)}>
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Pergunta</div>
              <div className="text-xl font-semibold leading-relaxed whitespace-pre-line">{current.pergunta}</div>
              {showAnswer && (
                <>
                  <div className="border-t pt-4 text-xs uppercase tracking-wide text-muted-foreground">Resposta</div>
                  <div className="text-lg leading-relaxed whitespace-pre-line">{current.resposta}</div>
                </>
              )}
              {!showAnswer && (
                <div className="text-sm text-muted-foreground">Clique para ver a resposta</div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="destructive" onClick={() => handleFeedback(1)}>
              🔴 Errei
            </Button>
            <Button variant="secondary" onClick={() => handleFeedback(2)}>
              🟠 Difícil
            </Button>
            <Button variant="outline" onClick={() => handleFeedback(3)}>
              🔵 Bom
            </Button>
            <Button variant="default" onClick={() => handleFeedback(4)}>
              🟢 Fácil
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
