import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import FlashcardsClient from './client'

export const metadata: Metadata = {
  title: 'Flashcards | Aluminify'
}

export default async function FlashcardsPage() {
  await requireUser()

  return <FlashcardsClient />
}
