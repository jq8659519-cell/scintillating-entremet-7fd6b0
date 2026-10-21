import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, ListOrdered, X } from 'lucide-react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { Alert, Button, Card, ProgressBar } from '../../components/ui'
import { completeLesson } from '../../db/services'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import { useCourseProgress } from './useCourseProgress'

export function LessonPlayer() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const courses = useCourseProgress(user?.id)
  const [params, setParams] = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [reward, setReward] = useState<string | null>(null)

  const course = courses.find((c) => c.id === courseId)
  if (!course || !user) return <Navigate to="/dashboard/courses" replace />

  const firstIncomplete = course.lessons.findIndex((l) => !course.completedIds.has(l.id))
  const requested = course.lessons.findIndex((l) => l.id === params.get('lesson'))
  const index = requested >= 0 ? requested : Math.max(0, firstIncomplete)
  const lesson = course.lessons[index]

  function goTo(i: number) {
    setReward(null)
    setDrawerOpen(false)
    setParams({ lesson: course!.lessons[i].id })
    window.scrollTo({ top: 0 })
  }

  function markComplete() {
    if (!lesson || !user || !course) return
    const awarded = completeLesson(user.id, course.id, lesson.id)
    if (awarded) setReward(`Lesson complete! +${course.pointsPerLesson} points added to your wallet.`)
  }

  const lessonNav = (
    <ol className="flex flex-col gap-1">
      {course.lessons.map((l, i) => {
        const complete = course.completedIds.has(l.id)
        return (
          <li key={l.id}>
            <button
              onClick={() => goTo(i)}
              aria-current={i === index ? 'step' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition',
                i === index ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface-muted hover:text-foreground',
              )}
            >
              {complete ? (
                <CheckCircle2 className="size-4 shrink-0 text-primary" aria-label="Completed" />
              ) : (
                <Circle className="size-4 shrink-0" aria-label="Not completed" />
              )}
              <span className="line-clamp-1">{`${i + 1}. ${l.title}`}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )

  return (
    <>
      <div className="flex flex-col gap-3">
        <Link to="/dashboard/courses" className="inline-flex w-fit items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          All courses
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">{course.title}</h1>
          <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setDrawerOpen(true)} aria-expanded={drawerOpen} aria-controls="lesson-drawer">
            <ListOrdered className="size-4" aria-hidden="true" />
            Lessons
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <ProgressBar value={course.percent} label="Course progress" />
          <span className="shrink-0 text-xs text-muted">{`${Math.round(course.percent)}%`}</span>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-72 shrink-0 lg:block">
          <Card className="sticky top-8 p-3">
            <p className="px-3 pt-1 pb-2 text-xs font-medium uppercase tracking-wide text-muted">Lessons</p>
            {lessonNav}
          </Card>
        </aside>

        {lesson ? (
          <Card className="flex min-w-0 flex-1 flex-col gap-6 p-5 md:p-8">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{`Lesson ${index + 1} of ${course.lessons.length}`}</p>
              <h2 className="text-xl font-semibold text-balance">{lesson.title}</h2>
            </div>
            <div className="whitespace-pre-line leading-relaxed text-foreground/90">{lesson.content}</div>
            {reward && <Alert tone="success">{reward}</Alert>}
            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="ghost" disabled={index === 0} onClick={() => goTo(index - 1)}>
                <ArrowLeft className="size-4" aria-hidden="true" />
                Previous
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                {course.completedIds.has(lesson.id) ? (
                  <Button variant="secondary" disabled>
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    Completed
                  </Button>
                ) : (
                  <Button onClick={markComplete}>{`Mark complete · +${course.pointsPerLesson} pts`}</Button>
                )}
                {index < course.lessons.length - 1 && (
                  <Button variant="secondary" onClick={() => goTo(index + 1)}>
                    Next
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex-1 p-8 text-muted">This course has no lessons yet.</Card>
        )}
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Lessons" id="lesson-drawer">
          <button className="absolute inset-0 bg-black/50" aria-label="Close lessons" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[75dvh] flex-col gap-3 overflow-y-auto rounded-t-2xl border-t border-border bg-surface p-4">
            <div className="flex items-center justify-between px-1">
              <p className="font-semibold">Lessons</p>
              <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 text-muted hover:bg-surface-muted" aria-label="Close">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            {lessonNav}
          </div>
        </div>
      )}
    </>
  )
}
