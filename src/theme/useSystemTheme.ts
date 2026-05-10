import { useSyncExternalStore } from 'react'

import type { GithubThemeMode } from '@/editor/githubTheme'

const darkSchemeQuery = '(prefers-color-scheme: dark)'

function getThemeSnapshot(): GithubThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia(darkSchemeQuery).matches ? 'dark' : 'light'
}

function subscribeToSystemTheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(darkSchemeQuery)
  mediaQuery.addEventListener('change', onStoreChange)

  return () => mediaQuery.removeEventListener('change', onStoreChange)
}

export function useSystemTheme(): GithubThemeMode {
  return useSyncExternalStore(
    subscribeToSystemTheme,
    getThemeSnapshot,
    getThemeSnapshot,
  )
}
