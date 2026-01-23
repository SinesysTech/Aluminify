import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Área do Aluno'
}

export default async function AlunoRedirectPage() {
  const user = await requireUser({ allowedRoles: ['usuario', 'superadmin'] })

  if (user.empresaSlug) {
    redirect(`/${user.empresaSlug}/aluno`)
  }

  return <div>Erro: Usuário sem empresa associada. Contate o suporte.</div>
}
