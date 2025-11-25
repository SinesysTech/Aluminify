export type AppUserRole = 'aluno' | 'professor' | 'superadmin'

export interface AppUser {
  id: string
  email: string
  role: AppUserRole
  fullName?: string
  avatarUrl?: string
  mustChangePassword?: boolean
}

