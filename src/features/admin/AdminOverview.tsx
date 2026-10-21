import { ArrowDownToLine, BookOpen, CheckCircle2, RotateCcw, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Card, PageHeader, StatCard } from '../../components/ui'
import { db } from '../../db/localDB'
import { KEYS, type Course, type Progress, type User, type Withdrawal } from '../../db/schema'
import { seedDatabase } from '../../db/seed'
import { useCollection } from '../../hooks/useLocalStorage'
import { formatPoints } from '../../lib/utils'

export function AdminOverview() {
  const users = useCollection<User>(KEYS.users)
  const courses = useCollection<Course>(KEYS.courses)
  const progress = useCollection<Progress>(KEYS.progress)
  const withdrawals = useCollection<Withdrawal>(KEYS.withdrawals)

  const learners = users.filter((u) => u.role === 'user')
  const pending = withdrawals.filter((w) => w.status === 'pending')
  const outstanding = learners.reduce((s, u) => s + u.points, 0)

  async function resetData() {
    if (!window.confirm('Reset all prototype data to the demo seed? This signs everyone out.')) return
    db.reset()
    localStorage.removeItem('session')
    await seedDatabase()
    window.location.assign('/login')
  }

  return (
    <>
      <PageHeader
        title="Admin overview"
        description="Manage learners, courses and payout requests."
        action={
          <Button variant="secondary" size="sm" onClick={resetData}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset demo data
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Learners" value={learners.length} icon={Users} />
        <StatCard label="Courses" value={courses.length} hint={`${courses.reduce((s, c) => s + c.lessons.length, 0)} lessons`} icon={BookOpen} />
        <StatCard label="Lessons completed" value={progress.length} icon={CheckCircle2} />
        <StatCard label="Pending payouts" value={pending.length} hint={`${formatPoints(pending.reduce((s, w) => s + w.amount, 0))} pts`} icon={ArrowDownToLine} tone="accent" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { to: '/admin/users', title: 'User management', text: `${formatPoints(outstanding)} points outstanding across all learners.` },
          { to: '/admin/courses', title: 'Course builder', text: 'Create courses with the form builder or import JSON.' },
          { to: '/admin/withdrawals', title: 'Withdrawal queue', text: `${pending.length} request${pending.length === 1 ? '' : 's'} waiting for review.` },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="group">
            <Card className="flex h-full flex-col gap-1 p-5 transition group-hover:border-primary/50">
              <h2 className="font-semibold group-hover:text-primary">{item.title}</h2>
              <p className="text-sm text-muted">{item.text}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}
