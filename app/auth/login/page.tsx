import type { Metadata } from 'next'
import { LoginPageClient } from '@/app/[tenant]/auth/components/login-page-client'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Entrar'
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageClient />
    </Suspense>
  )
}
