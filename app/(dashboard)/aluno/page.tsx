import { AlunoTable } from '@/components/aluno-table'
import { requireUser } from '@/lib/auth'

export default async function AlunoPage() {
  await requireUser({ allowedRoles: ['professor'] })

  return (
    <div className="container mx-auto py-6">
      <AlunoTable />
    </div>
  )
}