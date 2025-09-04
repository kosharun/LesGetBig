import { openDB } from 'idb'
import type { IDBPDatabase } from 'idb'
import type { StoreName } from './models'

type AnyRecord = Record<string, unknown> & { id: string }

const DATABASE_NAME = 'lesgetbig'
const DATABASE_VERSION = 1
const STORE_NAMES: StoreName[] = [
  'users',
  'profiles',
  'workouts',
  'nutrition',
  'schedules',
  'progress',
  'messages',
  'plans',
]

export const Storage = {
  stores: STORE_NAMES,
  db: null as IDBPDatabase | null,

  async init(): Promise<void> {
    try {
      this.db = await openDB(DATABASE_NAME, DATABASE_VERSION, {
        upgrade(db) {
          for (const name of STORE_NAMES) {
            if (!db.objectStoreNames.contains(name)) {
              db.createObjectStore(name, { keyPath: 'id' })
            }
          }
        },
      })
    } catch (err) {
      console.warn('IndexedDB unavailable, falling back to localStorage', err)
      this.db = null
    }
  },

  async getAll<T extends AnyRecord>(store: StoreName): Promise<T[]> {
    if (this.db) {
      return (await this.db.getAll(store)) as T[]
    }
    const raw = localStorage.getItem(this.localStoreKey(store))
    return raw ? (JSON.parse(raw) as T[]) : []
  },

  async get<T extends AnyRecord>(store: StoreName, id: string): Promise<T | undefined> {
    if (this.db) {
      return (await this.db.get(store, id)) as T | undefined
    }
    const all = await this.getAll<T>(store)
    return all.find((x) => x.id === id)
  },

  async put<T extends AnyRecord>(store: StoreName, value: T): Promise<void> {
    if (this.db) {
      await this.db.put(store, value)
      return
    }
    const all = await this.getAll<T>(store)
    const idx = all.findIndex((x) => x.id === value.id)
    if (idx >= 0) all[idx] = value
    else all.push(value)
    localStorage.setItem(this.localStoreKey(store), JSON.stringify(all))
  },

  async delete(store: StoreName, id: string): Promise<void> {
    if (this.db) {
      await this.db.delete(store, id)
      return
    }
    const raw = localStorage.getItem(this.localStoreKey(store))
    if (!raw) return
    const all = JSON.parse(raw) as AnyRecord[]
    const next = all.filter((x) => x.id !== id)
    localStorage.setItem(this.localStoreKey(store), JSON.stringify(next))
  },

  localStoreKey(store: StoreName) {
    return `forma-${store}`
  },

  generateId(prefix: string) {
    const random = Math.random().toString(36).slice(2, 8)
    const ts = Date.now().toString(36)
    return `${prefix}_${random}_${ts}`
  },
}

export default Storage


