import { BookOpen } from 'lucide-react'
import { Card, EmptyState, PageHeader } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { CourseCard } from './CourseCard'
import { useCourseProgress } from './useCourseProgress'

export function CourseList() {
  const { user } = useAuth()
  const courses = useCourseProgress(user?.id)

  return (
    <>
      <PageHeader title="Courses" description="Complete lessons to earn points you can withdraw from your wallet." />
      {courses.length === 0 ? (
        <Card>
          <EmptyState icon={BookOpen} title="No courses yet" description="An admin hasn't published any courses yet. Check back soon." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </>
  )
}
