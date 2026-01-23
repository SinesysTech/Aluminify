import type { Metadata } from 'next'
import { CursoTable } from '@/components/curso/curso-table'
import { requireUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Cursos'
}

export default async function AdminCursosPage() {
  await requireUser({ allowedRoles: ['professor', 'usuario', 'superadmin'] })

  return <CursoTable />
}
