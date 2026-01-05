"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useCurrentUser } from "@/components/providers/user-provider"
import { createClient } from "@/lib/client"

export function ImpersonationBanner() {
  const user = useCurrentUser()
  const router = useRouter()
  const [isStopping, setIsStopping] = useState(false)

  // Verificar se está em modo impersonação
  const isImpersonating = user && '_impersonationContext' in user && user._impersonationContext

  if (!isImpersonating) {
    return null
  }

  const handleStopImpersonation = async () => {
    setIsStopping(true)
    try {
      // Obter token de autenticação
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('Erro ao obter sessão:', sessionError)
        alert('Sessão expirada. Faça login novamente.')
        return
      }

      const response = await fetch('/api/auth/stop-impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json().catch(() => ({ error: 'Erro desconhecido' }))

      if (response.ok) {
        router.push(data.redirectTo || '/professor/dashboard')
        router.refresh()
      } else {
        console.error('Erro ao parar impersonação:', {
          status: response.status,
          statusText: response.statusText,
          error: data,
        })
        alert(data.error || `Erro ao parar impersonação (${response.status})`)
      }
    } catch (error) {
      console.error('Erro ao parar impersonação:', error)
      alert('Erro ao parar impersonação. Verifique o console para mais detalhes.')
    } finally {
      setIsStopping(false)
    }
  }

  return (
    <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-200">
        Modo Visualização Ativo
      </AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
        <div className="flex items-center justify-between">
          <span>
            Você está visualizando como <strong>{user.fullName || user.email}</strong>.
            Esta é uma visualização somente leitura.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStopImpersonation}
            disabled={isStopping}
            className="ml-4 border-yellow-600 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-400 dark:text-yellow-200 dark:hover:bg-yellow-900"
          >
            <X className="mr-2 h-4 w-4" />
            {isStopping ? 'Saindo...' : 'Sair do Modo Visualização'}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}



