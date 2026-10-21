import { useMemo, useState } from 'react'
import { Check, Copy, Gift, Users } from 'lucide-react'
import { Button, Card, EmptyState, PageHeader, StatCard } from '../../components/ui'
import { KEYS, REFEREE_REWARD, REFERRER_REWARD, type User } from '../../db/schema'
import { useAuth } from '../../hooks/useAuth'
import { useCollection } from '../../hooks/useLocalStorage'
import { formatDate, formatPoints } from '../../lib/utils'

export function Referrals() {
  const { user } = useAuth()
  const users = useCollection<User>(KEYS.users)
  const referred = useMemo(() => users.filter((u) => u.referredBy === user?.id), [users, user?.id])
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  if (!user) return null
  const link = `${window.location.origin}/register?ref=${user.referralCode}`

  async function copy(text: string, kind: 'code' | 'link') {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setCopied(null)
    }
  }

  return (
    <>
      <PageHeader title="Referrals" description={`Earn ${REFERRER_REWARD} points for every friend who signs up with your code. They get ${REFEREE_REWARD} points too.`} />

      <Card className="flex flex-col gap-5 p-5 md:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">Your referral code</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg border border-dashed border-accent/50 bg-accent/10 px-4 py-2 font-mono text-xl font-semibold tracking-widest text-accent">
              {user.referralCode}
            </span>
            <Button variant="secondary" size="sm" onClick={() => copy(user.referralCode, 'code')}>
              {copied === 'code' ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {copied === 'code' ? 'Copied' : 'Copy code'}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">Invite link</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-surface-muted px-3 py-2.5 text-sm">{link}</code>
            <Button onClick={() => copy(link, 'link')}>
              {copied === 'link' ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {copied === 'link' ? 'Copied' : 'Copy link'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Friends referred" value={referred.length} icon={Users} />
        <StatCard label="Points earned" value={formatPoints(referred.length * REFERRER_REWARD)} icon={Gift} tone="accent" />
      </div>

      <Card>
        <h2 className="border-b border-border px-5 py-4 text-lg font-semibold">Your referrals</h2>
        {referred.length === 0 ? (
          <EmptyState icon={Users} title="No referrals yet" description="Share your link to start earning." />
        ) : (
          <ul className="divide-y divide-border">
            {referred.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{u.name}</span>
                  <span className="text-xs text-muted">{`Joined ${formatDate(u.createdAt)}`}</span>
                </div>
                <span className="text-sm font-semibold text-primary">{`+${REFERRER_REWARD}`}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
