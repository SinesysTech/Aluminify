import type { Metadata } from 'next'
import NovoCronogramaClientPage from './novo-cronograma-client'

export const metadata: Metadata = {
  title: 'Novo Cronograma'
}

export default function NovoCronogramaPage() {
  return <NovoCronogramaClientPage />
}

