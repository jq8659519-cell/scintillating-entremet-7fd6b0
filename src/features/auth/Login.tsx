import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Field, Input } from '../../components/ui'
import { DEMO_ACCOUNTS } from '../../db/seed'
import { useAuth } from '../../hooks/useAuth'
import { AuthShell } from './AuthShell'
import { homePathFor } from './ProtectedRoute'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function signIn(e: string, p: string) {
    setError('')
    setLoading(true)
    try {
      const user = await login(e, p)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from && from.startsWith(homePathFor(user.role)) ? from : homePathFor(user.role), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    signIn(email, password)
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue learning.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Demo accounts</p>
        <div className="flex gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <Button key={acc.email} type="button" variant="secondary" size="sm" className="flex-1" disabled={loading} onClick={() => signIn(acc.email, acc.password)}>
              {acc.label}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-muted">
        {'No account? '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  )
}
