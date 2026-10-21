import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Button, Field, Input } from '../../components/ui'
import { REFEREE_REWARD } from '../../db/schema'
import { useAuth } from '../../hooks/useAuth'
import { AuthShell } from './AuthShell'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', password: '', refCode: params.get('ref') ?? '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Start learning and earning points today.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Full name" htmlFor="name">
          <Input id="name" autoComplete="name" required value={form.name} onChange={update('name')} />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" required value={form.email} onChange={update('email')} />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 6 characters.">
          <Input id="password" type="password" autoComplete="new-password" required minLength={6} value={form.password} onChange={update('password')} />
        </Field>
        <Field label="Referral code (optional)" htmlFor="refCode" hint={`Get ${REFEREE_REWARD} bonus points with a friend's code.`}>
          <Input id="refCode" className="uppercase" value={form.refCode} onChange={update('refCode')} placeholder="e.g. LEARN26" />
        </Field>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted">
        {'Already registered? '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
