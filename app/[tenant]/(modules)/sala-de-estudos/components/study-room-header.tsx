'use client'

import { useMemo } from 'react'
import { OrganizationSwitcher } from '@/app/[tenant]/(modules)/dashboard/components/organization-switcher'

interface StudyRoomHeaderProps {
  userName: string
}

// Frases motivacionais variadas para a sala de estudos
const motivationalPhrases = [
  (name: string) => `${name}, seu conhecimento cresce a cada dia!`,
  (name: string) => `Bons estudos, ${name}! Cada página conta.`,
  (name: string) => `${name}, o sucesso é construído passo a passo.`,
  (name: string) => `Foco e determinação, ${name}! Você consegue.`,
  (name: string) => `${name}, aprender é uma jornada incrível!`,
  (name: string) => `Que bom ter você aqui, ${name}! Vamos estudar?`,
  (name: string) => `${name}, cada esforço te aproxima do objetivo.`,
  (name: string) => `Sua dedicação inspira, ${name}! Continue assim.`,
  (name: string) => `${name}, o futuro pertence a quem se prepara.`,
  (name: string) => `Vamos lá, ${name}! Hoje é dia de aprender.`,
  (name: string) => `${name}, seu progresso é admirável!`,
  (name: string) => `Persistência é a chave, ${name}!`,
]

export function StudyRoomHeader({ userName }: StudyRoomHeaderProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }, [])

  const firstName = userName.split(' ')[0]

  // Seleciona uma frase baseada no dia do ano para variar a cada dia
  const motivationalPhrase = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    )
    const index = dayOfYear % motivationalPhrases.length
    return motivationalPhrases[index](firstName)
  }, [firstName])

  return (
    <header className="mb-6">
      {/* Mobile Layout */}
      <div className="flex flex-col gap-2 md:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {greeting}, {firstName}!
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {motivationalPhrase}
            </p>
          </div>
          <OrganizationSwitcher variant="compact" />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex md:items-center md:justify-between md:gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, {userName}!
          </h1>
          <p className="text-sm text-muted-foreground">
            {motivationalPhrase}
          </p>
        </div>

        <OrganizationSwitcher />
      </div>
    </header>
  )
}
