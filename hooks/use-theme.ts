'use client'

import * as React from 'react'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  // Tenta ler do localStorage
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  // Se não houver preferência salva, detecta do sistema
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

export function useTheme() {
  const [theme, setThemeState] = React.useState<Theme>(() => getInitialTheme())
  const [mounted, setMounted] = React.useState(false)

  const applyTheme = React.useCallback((newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  React.useEffect(() => {
    setMounted(true)
    const initialTheme = getInitialTheme()
    setThemeState(initialTheme)
    applyTheme(initialTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setTheme = React.useCallback(
    (newTheme: Theme | ((prev: Theme) => Theme)) => {
      setThemeState((prev) => {
        const resolvedTheme = typeof newTheme === 'function' ? newTheme(prev) : newTheme
        localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme)
        applyTheme(resolvedTheme)
        return resolvedTheme
      })
    },
    [applyTheme]
  )

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [setTheme])

  return {
    theme,
    setTheme,
    toggleTheme,
    mounted,
  }
}

