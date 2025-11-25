import { ProfessorTable } from '@/components/professor-table'
import { requireUser } from '@/lib/auth'

export default async function ProfessorPage() {
  await requireUser({ allowedRoles: ['professor'] })

  return (
    <div className="container mx-auto py-6">
      <ProfessorTable />
    </div>
  )
}