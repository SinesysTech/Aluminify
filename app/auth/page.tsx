import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Autenticação'
}

export default function AuthPage() {
  redirect('/auth/login')
}
