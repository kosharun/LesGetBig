import { create } from 'zustand'
import type { Session } from '../lib/auth'

type SessionState = {
  session: Session | null
  setSession: (s: Session | null) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  session: (() => {
    const raw = sessionStorage.getItem('forma-session')
    if (!raw) return null
    try { return JSON.parse(raw) as Session } catch { return null }
  })(),
  setSession: (s) => {
    if (s) sessionStorage.setItem('forma-session', JSON.stringify(s))
    else sessionStorage.removeItem('forma-session')
    set({ session: s })
  },
}))


