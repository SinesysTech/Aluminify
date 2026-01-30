
import { RecorrenciaManager } from "./components/recorrencia-manager"
import { requireUser } from "@/app/shared/core/auth"

export default async function DisponibilidadePage() {
  const user = await requireUser({ allowedRoles: ["usuario"] })

  if (!user.empresaId) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="page-title">Disponibilidade</h1>
          <p className="page-subtitle">
            Você precisa estar vinculado a uma empresa para configurar disponibilidade.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="page-title">Disponibilidade</h1>
        <p className="page-subtitle">
          Configure seus horários de atendimento para plantão.
        </p>
      </div>

      <RecorrenciaManager professorId={user.id} empresaId={user.empresaId} />
    </div>
  )
}
