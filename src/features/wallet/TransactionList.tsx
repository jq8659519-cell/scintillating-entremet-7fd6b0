import { Receipt } from 'lucide-react'
import { EmptyState } from '../../components/ui'
import type { Transaction } from '../../db/schema'
import { cn, formatDate, formatPoints } from '../../lib/utils'

export function TransactionList({ transactions, limit }: { transactions: Transaction[]; limit?: number }) {
  const items = [...transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit)
  if (items.length === 0) return <EmptyState icon={Receipt} title="No activity yet" description="Complete lessons or invite friends to earn points." />

  return (
    <ul className="divide-y divide-border">
      {items.map((tx) => (
        <li key={tx.id} className="flex items-center justify-between gap-4 px-5 py-3">
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{tx.note}</span>
            <span className="text-xs text-muted capitalize">{`${tx.type} · ${formatDate(tx.createdAt)}`}</span>
          </div>
          <span className={cn('shrink-0 text-sm font-semibold tabular-nums', tx.amount >= 0 ? 'text-primary' : 'text-danger')}>
            {`${tx.amount >= 0 ? '+' : '−'}${formatPoints(Math.abs(tx.amount))}`}
          </span>
        </li>
      ))}
    </ul>
  )
}
