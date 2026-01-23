import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Agendamentos'
}

export default async function AgendamentosRedirectPage() {
    const user = await requireUser({ allowedRoles: ['professor', 'usuario'] })

    if (user.empresaSlug) {
        redirect(`/${user.empresaSlug}/professor/agendamentos`)
    }

    return <div>Erro: Professor sem empresa associada. Contate o suporte.</div>
}
