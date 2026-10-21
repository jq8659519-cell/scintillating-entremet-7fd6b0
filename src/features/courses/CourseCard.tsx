import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Card, ProgressBar } from '../../components/ui'
import type { CourseWithProgress } from './useCourseProgress'

export function CourseCard({ course }: { course: CourseWithProgress }) {
  const done = course.percent === 100
  const started = course.completedIds.size > 0
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-snug text-pretty">{course.title}</h3>
        {done ? (
          <Badge tone="success">
            <CheckCircle2 className="mr-1 size-3" aria-hidden="true" />
            Done
          </Badge>
        ) : (
          <Badge tone="warning">{`+${course.pointsPerLesson} pts/lesson`}</Badge>
        )}
      </div>
      <p className="line-clamp-2 flex-1 text-sm text-muted">{course.description}</p>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-muted">
          <span>{`${course.completedIds.size} of ${course.lessons.length} lessons`}</span>
          <span>{`${Math.round(course.percent)}%`}</span>
        </div>
        <ProgressBar value={course.percent} label={`${course.title} progress`} />
      </div>
      <Link
        to={`/dashboard/courses/${course.id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        {done ? 'Review course' : started ? 'Continue' : 'Start course'}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </Card>
  )
}
