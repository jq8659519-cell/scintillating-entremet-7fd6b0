import { useMemo, useState, type FormEvent } from 'react'
import { ArrowDownToLine, Clock, Wallet } from 'lucide-react'
import { Alert, Badge, Button, Card, EmptyState, Field, Input, PageHeader, StatCard } from '../../components/ui'
import { KEYS, MIN_WITHDRAWAL, POINTS_PER_DOLLAR, type Transaction, type Withdrawal } from '../../db/schema'
import { requestWithdrawal } from '../../db/services'
import { useAuth } from '../../hooks/useAuth'
import { useCollection } from '../../hooks/useLocalStorage'
import { formatDate, formatPoints, pointsToCurrency } from '../../lib/utils'
import { TransactionList } from './TransactionList'

const METHODS = ['PayPal', 'Bank transfer', 'Mobile money']

export const statusTone = { pending: 'warning', completed: 'success', rejected: 'danger' } as const

export function WalletView() {
  const { user } = useAuth()
  const allTx = useCollection<Transaction>(KEYS.transactions)
  const allWithdrawals = useCollection<Withdrawal>(KEYS.withdrawals)
  const transactions = useMemo(() => allTx.filter((t) => t.userId === user?.id), [allTx, user?.id])
  const withdrawals = useMemo(
    () => allWithdrawals.filter((w) => w.userId === user?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [allWithdrawals, user?.id],
  )

  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState(METHODS[0])
  const [account, setAccount] = useState('')
  const [message, setMessage] = useState<{ tone: 'danger' | 'success'; text: string } | null>(null)

  if (!user) return null

  const pending = withdrawals.filter((w) => w.status === 'pending').reduce((s, w) => s + w.amount, 0)
  const paidOut = withdrawals.filter((w) => w.status === 'completed').reduce((s, w) => s + w.amount, 0)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      const w = requestWithdrawal(user!.id, Number(amount), method, account)
      setMessage({ tone: 'success', text: `Withdrawal of ${formatPoints(w.amount)} points submitted for review.` })
      setAmount('')
      setAccount('')
    } catch (err) {
      setMessage({ tone: 'danger', text: err instanceof Error ? err.message : 'Request failed' })
    }
  }

  return (
    <>
      <PageHeader title="Wallet" description={`Points convert at ${POINTS_PER_DOLLAR} points = $1. Withdrawals are reviewed by an admin.`} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Available balance" value={formatPoints(user.points)} hint={`≈ ${pointsToCurrency(user.points)}`} icon={Wallet} tone="accent" />
        <StatCard label="Pending withdrawals" value={formatPoints(pending)} hint={pointsToCurrency(pending)} icon={Clock} />
        <StatCard label="Total paid out" value={formatPoints(paidOut)} hint={pointsToCurrency(paidOut)} icon={ArrowDownToLine} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="flex flex-col gap-4 p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Request withdrawal</h2>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {message && <Alert tone={message.tone}>{message.text}</Alert>}
            <Field label="Amount (points)" htmlFor="amount" hint={`Minimum ${formatPoints(MIN_WITHDRAWAL)} points${Number(amount) > 0 ? ` · ≈ ${pointsToCurrency(Number(amount))}` : ''}`}>
              <Input id="amount" type="number" inputMode="numeric" min={MIN_WITHDRAWAL} max={user.points} step={1} required value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Payout method" htmlFor="method">
              <select id="method" value={method} onChange={(e) => setMethod(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25">
                {METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Account details" htmlFor="account" hint="Email, account number or phone.">
              <Input id="account" required value={account} onChange={(e) => setAccount(e.target.value)} />
            </Field>
            <Button type="submit" disabled={user.points < MIN_WITHDRAWAL}>
              {user.points < MIN_WITHDRAWAL ? `Need ${formatPoints(MIN_WITHDRAWAL - user.points)} more points` : 'Submit request'}
            </Button>
          </form>
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-3">
          <Card>
            <h2 className="border-b border-border px-5 py-4 text-lg font-semibold">Withdrawal requests</h2>
            {withdrawals.length === 0 ? (
              <EmptyState icon={ArrowDownToLine} title="No withdrawals yet" />
            ) : (
              <ul className="divide-y divide-border">
                {withdrawals.map((w) => (
                  <li key={w.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="flex min-w-0 flex-col">
                      <span className="text-sm font-medium">{`${formatPoints(w.amount)} pts · ${pointsToCurrency(w.amount)}`}</span>
                      <span className="truncate text-xs text-muted">{`${w.method} · ${formatDate(w.createdAt)}`}</span>
                    </div>
                    <Badge tone={statusTone[w.status]}>{w.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <h2 className="border-b border-border px-5 py-4 text-lg font-semibold">Points history</h2>
            <TransactionList transactions={transactions} />
          </Card>
        </div>
      </div>
    </>
  )
}
