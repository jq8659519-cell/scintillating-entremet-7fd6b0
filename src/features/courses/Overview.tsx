import { useMemo } from 'react'
import { Award, BookOpen, GraduationCap, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, PageHeader, StatCard } from '../../components/ui'
import { KEYS, type Transaction } from '../../db/schema'
import { useAuth } from '../../hooks/useAuth'
import { useCollection } from '../../hooks/useLocalStorage'
import { formatPoints, pointsToCurrency } from '../../lib/utils'
import { TransactionList } from '../wallet/TransactionList'
import { CourseCard } from './CourseCard'
import { useCourseProgress } from './useCourseProgress'

export function Overview() {
  const { user } = useAuth()
  const courses = useCourseProgress(user?.id)
  const allTx = useCollection<Transaction>(KEYS.transactions)
  const transactions = useMemo(() => allTx.filter((t) => t.userId === user?.id), [allTx, user?.id])

  if (!user) return null

  const lessonsDone = courses.reduce((sum, c) => sum + c.completedIds.size, 0)
  const coursesDone = courses.filter((c) => c.percent === 100).length
  const inProgress = courses.filter((c) => c.percent < 100).sort((a, b) => b.percent - a.percent).slice(0, 3)

  return (
    <>
      <PageHeader title={`Welcome back, ${user.name.split(' ')[0]}`} description="Here's a snapshot of your learning and rewards." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Points balance" value={formatPoints(user.points)} hint={`≈ ${pointsToCurrency(user.points)}`} icon={Wallet} tone="accent" />
        <StatCard label="Lessons completed" value={lessonsDone} hint={`across ${courses.length} courses`} icon={BookOpen} />
        <StatCard label="Courses finished" value={coursesDone} hint={`${courses.length - coursesDone} remaining`} icon={GraduationCap} />
      </div>

      <section className="flex flex-col gap-4" aria-labelledby="continue-heading">
        <div className="flex items-center justify-between">
          <h2 id="continue-heading" className="text-lg font-semibold">Continue learning</h2>
          <Link to="/dashboard/courses" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </div>
        {inProgress.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <Card className="flex items-center gap-3 p-5 text-sm text-muted">
            <Award className="size-5 text-accent" aria-hidden="true" />
            You&apos;ve completed every course. Nice work!
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="activity-heading">
        <div className="flex items-center justify-between">
          <h2 id="activity-heading" className="text-lg font-semibold">Recent activity</h2>
          <Link to="/dashboard/wallet" className="text-sm font-medium text-primary hover:underline">Wallet</Link>
        </div>
        <Card>
          <TransactionList transactions={transactions} limit={5} />
        </Card>
      </section>
    </>
  )
}
