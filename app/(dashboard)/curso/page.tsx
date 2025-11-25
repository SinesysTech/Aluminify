import { CursoTable } from '@/components/curso-table'
import { requireUser } from '@/lib/auth'

export default async function CursoPage() {
  await requireUser({ allowedRoles: ['professor'] })

  return (
    <div className="container mx-auto py-6">
      <CursoTable />
    </div>
  )
}