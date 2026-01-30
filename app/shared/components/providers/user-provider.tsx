'use client'

import React from 'react'

import { createContext, useContext, useMemo, useEffect } from 'react'

import type { AppUser } from '@/app/shared/types'
import { cacheService } from '@/app/shared/core/services/cache/cache.service'

const UserContext = createContext<AppUser | null>(null)

export function UserProvider({
  user,
  children,
}: {
  user: AppUser
  children: React.ReactNode
}) {
  const value = useMemo(() => user, [user])

  // Persistir usuário no LocalStorage para recuperação rápida/cache
  useEffect(() => {
    if (user?.id) {
      // Cache de sessão por 30 minutos (mesmo TTL do servidor)
      cacheService.set(`auth:session:${user.id}`, user, 1800);
    }
  }, [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}


export function useCurrentUser() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useCurrentUser must be used within a UserProvider')
  }

  return context
}




















