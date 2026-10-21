import { useMemo, useState } from 'react'
import { Minus, Plus, Search, Trash2, Users } from 'lucide-react'
import { Alert, Badge, Button, Card, EmptyState, Input, PageHeader } from '../../components/ui'
import { KEYS, type Progress, type User } from '../../db/schema'
import { adjustPoints, deleteUser, setUserRole } from '../../db/services'
import { useAuth } from '../../hooks/useAuth'
import { useCollection } from '../../hooks/useLocalStorage'
import { formatDate, formatPoints } from '../../lib/utils'

export function UserManagement() {
  const { user: me } = useAuth()
  const users = useCollection<User>(KEYS.users)
  const progress = useCollection<Progress>(KEYS.progress)
  const [query, setQuery] = useState('')
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.includes(q) || u.referralCode.toLowerCase().includes(q))
  }, [users, query])

  function adjust(u: User, sign: 1 | -1) {
    setError('')
    const value = Number(amounts[u.id] || 0)
    try {
      adjustPoints(u.id, sign * value, sign > 0 ? 'Manual credit by admin' : 'Manual debit by admin')
      setAmounts((a) => ({ ...a, [u.id]: '' }))
    } catch (err) {
      setError(err instanceof Error ? `${u.name}: ${err.message}` : 'Update failed')
    }
  }

  function remove(u: User) {
    if (window.confirm(`Delete ${u.name}? This cannot be undone.`)) deleteUser(u.id)
  }

  return (
    <>
      <PageHeader title="Users" description={`${users.length} registered accounts`} />

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <Input placeholder="Search by name, email or referral code" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search users" />
      </div>
      {error && <Alert>{error}</Alert>}

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">User</th>
                  <th scope="col" className="px-5 py-3 font-medium">Role</th>
                  <th scope="col" className="px-5 py-3 font-medium">Points</th>
                  <th scope="col" className="px-5 py-3 font-medium">Lessons</th>
                  <th scope="col" className="px-5 py-3 font-medium">Credit / Debit</th>
                  <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => {
                  const isMe = u.id === me?.id
                  return (
                    <tr key={u.id} className="align-middle">
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{u.name}{isMe && <span className="text-muted">{' (you)'}</span>}</span>
                          <span className="text-xs text-muted">{`${u.email} · ${u.referralCode} · ${formatDate(u.createdAt)}`}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          aria-label={`Role for ${u.name}`}
                          value={u.role}
                          disabled={isMe}
                          onChange={(e) => setUserRole(u.id, e.target.value as User['role'])}
                          className="h-8 rounded-md border border-border bg-surface px-2 text-sm disabled:opacity-60"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-3 font-semibold tabular-nums">{formatPoints(u.points)}</td>
                      <td className="px-5 py-3 tabular-nums">
                        <Badge>{progress.filter((p) => p.userId === u.id).length}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min={1}
                            step={1}
                            inputMode="numeric"
                            aria-label={`Points to adjust for ${u.name}`}
                            className="h-8 w-24"
                            value={amounts[u.id] ?? ''}
                            onChange={(e) => setAmounts((a) => ({ ...a, [u.id]: e.target.value }))}
                          />
                          <Button size="sm" variant="secondary" aria-label={`Credit ${u.name}`} onClick={() => adjust(u, 1)}>
                            <Plus className="size-4" aria-hidden="true" />
                          </Button>
                          <Button size="sm" variant="secondary" aria-label={`Debit ${u.name}`} onClick={() => adjust(u, -1)}>
                            <Minus className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button size="sm" variant="danger" disabled={isMe} onClick={() => remove(u)} aria-label={`Delete ${u.name}`}>
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
