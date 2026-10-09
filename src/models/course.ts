import type { Module } from './module'
import type { Lesson } from './lesson'

export interface Course {
  courseId: string
  title: string
  completed: boolean

  module: Module
  lessons: Array<Lesson>
}
