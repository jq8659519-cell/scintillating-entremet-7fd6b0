import { useCallback, useSyncExternalStore } from 'react'
import { db } from '../db/localDB'
import type { CollectionKey } from '../db/schema'

export function useCollection<T>(key: CollectionKey): T[] {
  return useSyncExternalStore(db.subscribe, () => db.get<T>(key))
}

export function useLocalStorage(key: string, initial: string | null = null) {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener('storage', cb)
    window.addEventListener(`local:${key}`, cb)
    return () => {
      window.removeEventListener('storage', cb)
      window.removeEventListener(`local:${key}`, cb)
    }
  }, [key])

  const value = useSyncExternalStore(subscribe, () => localStorage.getItem(key) ?? initial)

  const setValue = useCallback(
    (next: string | null) => {
      if (next === null) localStorage.removeItem(key)
      else localStorage.setItem(key, next)
      window.dispatchEvent(new Event(`local:${key}`))
    },
    [key],
  )

  return [value, setValue] as const
}
