import Storage from '../data/storage'
import type { Role, User } from '../data/models'

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', enc)
  const hashArray = Array.from(new Uint8Array(digest))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export async function registerUser(
  name: string,
  email: string,
  role: Role,
  password: string,
): Promise<User> {
  const users = await Storage.getAll<User>('users')
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email već postoji')
  }
  const user: User = {
    id: Storage.generateId('usr'),
    name,
    email,
    role,
    passwordHash: await hashPassword(password),
  }
  await Storage.put('users', user)
  return user
}

export type Session = {
  userId: string
  role: Role
  name: string
  email: string
}

export async function login(email: string, password: string): Promise<Session> {
  const users = await Storage.getAll<User>('users')
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user) throw new Error('Neispravni podaci')
  const hash = await hashPassword(password)
  if (hash !== user.passwordHash) throw new Error('Neispravni podaci')
  const session: Session = { userId: user.id, role: user.role, name: user.name, email: user.email }
  sessionStorage.setItem('forma-session', JSON.stringify(session))
  return session
}

export function getCurrentSession(): Session | null {
  const raw = sessionStorage.getItem('forma-session')
  if (!raw) return null
  try { return JSON.parse(raw) as Session } catch { return null }
}

export function logout() {
  sessionStorage.removeItem('forma-session')
}


