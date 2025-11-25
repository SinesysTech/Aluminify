import { redirect } from 'next/navigation'

import { createClient } from '@/lib/server'
import type { AppUser, AppUserRole } from '@/types/user'
import { getDefaultRouteForRole, hasRequiredRole } from '@/lib/roles'

export async function getAuthenticatedUser(): Promise<AppUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  const role = (user.user_metadata?.role as AppUserRole) || 'aluno'
  let mustChangePassword = Boolean(user.user_metadata?.must_change_password)

  if (role === 'aluno') {
    const { data: alunoData } = await supabase
      .from('alunos')
      .select('must_change_password')
      .eq('id', user.id)
      .maybeSingle()

    if (alunoData?.must_change_password !== undefined) {
      mustChangePassword = alunoData.must_change_password
    }
  }

  return {
    id: user.id,
    email: user.email || '',
    role,
    fullName:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0],
    avatarUrl: user.user_metadata?.avatar_url,
    mustChangePassword,
  }
}

type RequireUserOptions = {
  allowedRoles?: AppUserRole[]
  ignorePasswordRequirement?: boolean
}

export async function requireUser(options?: RequireUserOptions): Promise<AppUser> {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (options?.allowedRoles && !hasRequiredRole(user.role, options.allowedRoles)) {
    redirect(getDefaultRouteForRole(user.role))
  }

  if (!options?.ignorePasswordRequirement && user.mustChangePassword) {
    redirect('/primeiro-acesso')
  }

  return user
}

