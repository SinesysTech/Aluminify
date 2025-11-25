'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/client'
import { getDefaultRouteForRole } from '@/lib/roles'
import type { AppUserRole } from '@/types/user'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface FirstAccessFormProps {
  userId: string
  role: AppUserRole
}

export function FirstAccessForm({ userId, role }: FirstAccessFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resolveErrorMessage = (err: unknown) => {
    let message: string | null = null

    if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
      message = err.message
    } else if (typeof err === 'string') {
      message = err
    }

    if (!message) {
      return 'Não foi possível atualizar a senha. Tente novamente em instantes.'
    }

    if (message.toLowerCase().includes('new password should be different')) {
      return 'A nova senha precisa ser diferente da senha atual.'
    }

    if (message.toLowerCase().includes('auth session missing')) {
      return 'Sua sessão expirou. Faça login novamente para alterar a senha.'
    }

    return message
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas informadas não conferem.')
      return
    }

    setIsSubmitting(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: { must_change_password: false },
      })

      if (updateError) {
        throw updateError
      }

      const { error: alunoError } = await supabase
        .from('alunos')
        .update({ must_change_password: false, senha_temporaria: null })
        .eq('id', userId)

      if (alunoError) {
        throw alunoError
      }

      router.push(getDefaultRouteForRole(role))
      router.refresh()
    } catch (err) {
      console.error('[FirstAccessForm] Erro ao atualizar senha do primeiro acesso:', err)
      setError(resolveErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Nova senha</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="********"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirme a nova senha</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="********"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar e continuar'}
      </Button>
    </form>
  )
}

