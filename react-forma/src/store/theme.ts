import { create } from 'zustand'

type ThemeState = {
  theme: 'light'
}

function applyTheme() {
  document.documentElement.setAttribute('data-bs-theme', 'light')
  localStorage.setItem('forma-theme', 'light')
}

export const useThemeStore = create<ThemeState>(() => ({
  theme: 'light',
}))

// Initialize light theme
applyTheme()


