import type { Metadata } from 'next'
import CalendarioClientPage from './calendario-client'

export const metadata: Metadata = {
  title: 'Calendário'
}

export default function CalendarioPage() {
  return <CalendarioClientPage />
}

