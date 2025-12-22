'use client'

import { useState } from 'react'

import type { AppUser } from '@/types/user'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AvatarUpload } from '@/components/shared/avatar-upload'

type ProfileSettingsProps = {
  user: AppUser
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const supabase = createClient()
  const [fullName, setFullName] = useState(user.fullName || '')
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSavingProfile(true)
    setProfileMessage(null)
    setProfileError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      })

      if (error) {
        throw error
      }

      setProfileMessage('Dados atualizados com sucesso.')
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : 'Não foi possível atualizar os dados.'
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPasswordError(null)
    setPasswordMessage(null)

    if (password !== passwordConfirmation) {
      setPasswordError('As senhas precisam ser iguais.')
      return
    }

    if (password.length < 8) {
      setPasswordError('A senha deve possuir ao menos 8 caracteres.')
      return
    }

    setIsSavingPassword(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password,
        data: { must_change_password: false },
      })

      if (error) {
        throw error
      }

      // Atualizar must_change_password apenas se o usuário for aluno
      // Para professores, o flag está no user_metadata e já foi atualizado acima
      if (user.role === 'aluno') {
        const { error: alunoError } = await supabase
          .from('alunos')
          .update({ must_change_password: false, senha_temporaria: null })
          .eq('id', user.id)

        if (alunoError) {
          // Não falhar se a atualização na tabela alunos falhar
          // O importante é que a senha foi atualizada no auth
          console.warn('Erro ao atualizar flag must_change_password na tabela alunos:', alunoError)
        }
      }

      setPassword('')
      setPasswordConfirmation('')
      setPasswordMessage('Senha atualizada com sucesso.')
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : 'Não foi possível atualizar a senha.'
      )
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados cadastrais</CardTitle>
          <CardDescription>Atualize como o seu nome aparece dentro da plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          {profileMessage && (
            <Alert variant="default" className="mb-4">
              <AlertTitle>Pronto!</AlertTitle>
              <AlertDescription>{profileMessage}</AlertDescription>
            </Alert>
          )}
          {profileError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{profileError}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={handleProfileSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Como deseja ser identificado(a)?"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
              <p className="text-muted-foreground text-xs">
                Para alterar o email, entre em contato com o suporte.
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Biografia</Label>
              <Textarea disabled placeholder="Disponível em breve" />
            </div>
            <Button type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Senha de acesso</CardTitle>
          <CardDescription>Defina uma nova senha sempre que achar necessário.</CardDescription>
        </CardHeader>
        <CardContent>
          {passwordMessage && (
            <Alert variant="default" className="mb-4">
              <AlertTitle>Senha atualizada</AlertTitle>
              <AlertDescription>{passwordMessage}</AlertDescription>
            </Alert>
          )}
          {passwordError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password_confirmation">Confirme a senha</Label>
              <Input
                id="password_confirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                placeholder="********"
              />
            </div>
            <Button type="submit" disabled={isSavingPassword}>
              {isSavingPassword ? 'Atualizando...' : 'Atualizar senha'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avatar e imagem de perfil</CardTitle>
          <CardDescription>
            Envie uma foto para personalizar seu avatar. A foto aparecerá em toda a plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentAvatarUrl={user.avatarUrl}
            userName={user.fullName || user.email}
            onUploadSuccess={() => {
              setProfileMessage('Avatar atualizado com sucesso.')
              setProfileError(null)
              // Recarregar página após um breve delay para atualizar a UI
              setTimeout(() => {
                window.location.reload()
              }, 1000)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

