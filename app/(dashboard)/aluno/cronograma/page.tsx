import type { Metadata } from 'next'
import CronogramaClientPage from './cronograma-client'

export const metadata: Metadata = {
  title: 'Cronograma de Estudos'
}

export default function CronogramaPage() {
  return <CronogramaClientPage />
}

