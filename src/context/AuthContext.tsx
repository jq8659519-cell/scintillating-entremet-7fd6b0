import { createContext, useCallback, useMemo, type ReactNode } from 'react'
import { KEYS, type User } from '../db/schema'
import { loginUser, registerUser } from '../db/services'
import { useCollection, useLocalStorage } from '../hooks/useLocalStorage'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  register: (input: { name: string; email: string; password: string; refCode?: string }) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useLocalStorage('session')
  const users = useCollection<User>(KEYS.users)
  const user = useMemo(() => users.find((u) => u.id === sessionId) ?? null, [users, sessionId])

  const login = useCallback(
    async (email: string, password: string) => {
      const found = await loginUser(email, password)
      setSessionId(found.id)
      return found
    },
    [setSessionId],
  )

  const register = useCallback(
    async (input: { name: string; email: string; password: string; refCode?: string }) => {
      const created = await registerUser(input)
      setSessionId(created.id)
      return created
    },
    [setSessionId],
  )

  const logout = useCallback(() => setSessionId(null), [setSessionId])

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
