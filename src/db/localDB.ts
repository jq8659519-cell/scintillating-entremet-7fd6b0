import type { CollectionKey, Progress, User } from './schema'
import { KEYS } from './schema'

type Listener = () => void

const listeners = new Set<Listener>()
const cache = new Map<string, { raw: string | null; value: unknown[] }>()

function notify() {
  listeners.forEach((listener) => listener())
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', notify)
}

export const db = {
  get<T>(key: CollectionKey): T[] {
    const raw = localStorage.getItem(key)
    const cached = cache.get(key)
    if (cached && cached.raw === raw) return cached.value as T[]
    let value: unknown[] = []
    try {
      value = JSON.parse(raw || '[]')
    } catch {
      value = []
    }
    cache.set(key, { raw, value })
    return value as T[]
  },

  save<T>(key: CollectionKey, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data))
    notify()
  },

  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  isSeeded() {
    return localStorage.getItem(KEYS.users) !== null
  },

  reset() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
    cache.clear()
    notify()
  },

  findUser: (email: string) =>
    db.get<User>(KEYS.users).find((u) => u.email.toLowerCase() === email.trim().toLowerCase()),

  findUserById: (id: string) => db.get<User>(KEYS.users).find((u) => u.id === id),

  updateUser(id: string, patch: Partial<User>) {
    db.save(
      KEYS.users,
      db.get<User>(KEYS.users).map((u) => (u.id === id ? { ...u, ...patch } : u)),
    )
  },

  updateProgress(userId: string, courseId: string, lessonId: string) {
    const progress = db.get<Progress>(KEYS.progress)
    const exists = progress.some(
      (p) => p.userId === userId && p.courseId === courseId && p.lessonId === lessonId,
    )
    if (exists) return false
    db.save(KEYS.progress, [
      ...progress,
      { userId, courseId, lessonId, date: new Date().toISOString() },
    ])
    return true
  },
}
