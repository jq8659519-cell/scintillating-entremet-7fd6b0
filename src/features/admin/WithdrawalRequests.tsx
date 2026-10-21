import { useMemo, useState } from 'react'
import { ArrowDownToLine, Check, X } from 'lucide-react'
import { Badge, Button, Card, EmptyState, PageHeader } from '../../components/ui'
import { KEYS, type User, type Withdrawal, type WithdrawalStatus } from '../../db/schema'
import { reviewWithdrawal } from '../../db/services'
import { useCollection } from '../../hooks/useLocalStorage'
import { cn, formatDate, formatPoints, pointsToCurrency } from '../../lib/utils'
import { statusTone } from '../wallet/WalletView'

const FILTERS: (WithdrawalStatus | 'all')[] = ['pending', 'completed', 'rejected', 'all']

export function WithdrawalRequests() {
  const withdrawals = useCollection<Withdrawal>(KEYS.withdrawals)
  const users = useCollection<User>(KEYS.users)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('pending')

  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])
  const list = useMemo(
    () => withdrawals.filter((w) => filter === 'all' || w.status === filter).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [withdrawals, filter],
  )

  return (
    <>
      <PageHeader title="Withdrawal queue" description="Approve to mark as paid, or reject to refund points to the learner." />

      <div role="tablist" aria-label="Filter by status" className="flex w-fit gap-1 rounded-lg border border-border bg-surface p-1">
        {FILTERS.map((f) => {
          const count = f === 'all' ? withdrawals.length : withdrawals.filter((w) => w.status === f).length
          return (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn('rounded-md px-3 py-1.5 text-sm font-medium capitalize transition', filter === f ? 'bg-primary/15 text-primary' : 'text-muted hover:text-foreground')}
            >
              {`${f} (${count})`}
            </button>
          )
        })}
      </div>

      <Card>
        {list.length === 0 ? (
          <EmptyState icon={ArrowDownToLine} title={`No ${filter === 'all' ? '' : filter} requests`} />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((w) => {
              const u = userById.get(w.userId)
              return (
                <li key={w.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{`${formatPoints(w.amount)} pts`}</span>
                      <span className="text-sm text-muted">{pointsToCurrency(w.amount)}</span>
                      <Badge tone={statusTone[w.status]}>{w.status}</Badge>
                    </div>
                    <span className="truncate text-sm">{u ? `${u.name} · ${u.email}` : 'Deleted user'}</span>
                    <span className="truncate text-xs text-muted">{`${w.method}: ${w.account} · ${formatDate(w.createdAt)}`}</span>
                  </div>
                  {w.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => reviewWithdrawal(w.id, 'completed')}>
                        <Check className="size-4" aria-hidden="true" />
                        Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => reviewWithdrawal(w.id, 'rejected')}>
                        <X className="size-4" aria-hidden="true" />
                        Reject
                      </Button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </>
  )
}
