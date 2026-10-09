import type { Course } from './course'

export interface Lesson {
  lessonId: string
  title: string
  durationMinutes: number
  completed: boolean

  course: Course
}
