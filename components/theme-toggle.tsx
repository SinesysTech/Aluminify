'use client'

import { Moon, Sun } from 'lucide-react'
import { useThemeContext } from '@/components/providers/theme-provider'
import { SidebarMenuButton } from '@/components/ui/sidebar'

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useThemeContext()

  if (!mounted) {
    return (
      <SidebarMenuButton size="default" disabled>
        <Sun className="size-4" />
        <span>Carregando...</span>
      </SidebarMenuButton>
    )
  }

  return (
    <SidebarMenuButton
      size="default"
      onClick={toggleTheme}
      tooltip={theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
      aria-label={theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
    >
      {theme === 'dark' ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
      <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
    </SidebarMenuButton>
  )
}

