import { useMemo } from 'react'
import { KEYS, type Course, type Progress } from '../../db/schema'
import { useCollection } from '../../hooks/useLocalStorage'

export interface CourseWithProgress extends Course {
  completedIds: Set<string>
  percent: number
}

export function useCourseProgress(userId: string | undefined) {
  const courses = useCollection<Course>(KEYS.courses)
  const progress = useCollection<Progress>(KEYS.progress)

  return useMemo<CourseWithProgress[]>(() => {
    return courses.map((course) => {
      const lessonIds = new Set(course.lessons.map((l) => l.id))
      const completedIds = new Set(
        progress.filter((p) => p.userId === userId && p.courseId === course.id && lessonIds.has(p.lessonId)).map((p) => p.lessonId),
      )
      const percent = course.lessons.length ? (completedIds.size / course.lessons.length) * 100 : 0
      return { ...course, completedIds, percent }
    })
  }, [courses, progress, userId])
}
