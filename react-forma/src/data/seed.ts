import Storage from './storage'
import type { User } from './models'
import { hashPassword } from '../lib/auth'

const SEED_FLAG = 'forma-seeded'

async function ensurePasswordHashes(users: User[]): Promise<User[]> {
  const result: User[] = []
  for (const u of users) {
    if (!u.passwordHash) {
      const demoHash = await hashPassword('demo123')
      result.push({ ...u, passwordHash: demoHash })
    } else {
      result.push(u)
    }
  }
  return result
}

export async function seedIfNeeded() {
  await Storage.init()
  if (localStorage.getItem(SEED_FLAG)) return

  // Load each JSON file and populate the corresponding store
  const files = [
    'users',
    'profiles',
    'workouts',
    'nutrition',
    'schedules',
    'progress',
    'messages',
    'workouts',
    'plans',
  ] as const

  for (const name of files) {
    const res = await fetch(`/data/${name}.json`)
    if (!res.ok) continue
    const data = await res.json()
    if (name === 'users') {
      const withHashes = await ensurePasswordHashes(data as User[])
      for (const u of withHashes) await Storage.put('users', u)
    } else {
      for (const item of data) await Storage.put(name as any, item)
    }
  }

  localStorage.setItem(SEED_FLAG, '1')
}


