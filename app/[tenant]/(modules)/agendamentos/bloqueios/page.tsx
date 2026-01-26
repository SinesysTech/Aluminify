
import { BloqueiosManager } from "./components/bloqueios-manager"
import { requireUser } from "@/app/shared/core/auth"
import { isAdminRoleTipo } from "@/app/shared/core/roles"

export default async function BloqueiosPage() {
  const user = await requireUser({ allowedRoles: ["usuario"] })

  if (!user.empresaId) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="page-title">Bloqueios</h1>
          <p className="page-subtitle">
            Você precisa estar vinculado a uma empresa para gerenciar bloqueios.
          </p>
        </div>
      </div>
    )
  }

  // Check if user is admin based on roleType
  const isAdmin = user.roleType ? isAdminRoleTipo(user.roleType) : false

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="page-title">Bloqueios de Agenda</h1>
        <p className="page-subtitle">
          Gerencie períodos de indisponibilidade como feriados, recessos e imprevistos.
        </p>
      </div>

      <BloqueiosManager
        professorId={user.id}
        empresaId={user.empresaId}
        isAdmin={isAdmin}
      />
    </div>
  )
}
