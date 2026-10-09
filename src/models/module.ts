import type { Course } from './course'

export interface Module {
  moduleId: string
  title: string
  completed: boolean

  courses: Array<Course>
}
