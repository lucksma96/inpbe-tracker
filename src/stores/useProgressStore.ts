import { defineStore } from 'pinia'
import type { Module } from '../models/module'
import curriculumJSON from '../assets/curriculum.json'

const curriculum = curriculumJSON as Array<Module>

// STATIC LOOKUP MAPS (Generated once on load for O(1) sibling checks)
const courseLessonsMap: Record<string, string[]> = {}
const moduleCoursesMap: Record<string, string[]> = {}

curriculum.forEach(m => {
  moduleCoursesMap[m.moduleId] = m.courses.map(c => c.courseId)
  m.courses.forEach(c => {
    courseLessonsMap[c.courseId] = c.lessons.map(l => l.lessonId)
  })
})

interface ProgressState {
  curriculum: Module[]
  completedLessons: Record<string, boolean>
  completedCourses: Record<string, boolean>
  completedModules: Record<string, boolean>
}

export const useProgressStore = defineStore('progress', {
  state: (): ProgressState => ({
    curriculum: curriculum as Module[],
    completedLessons: {} as Record<string, boolean>,
    completedCourses: {} as Record<string, boolean>,
    completedModules: {} as Record<string, boolean>,
  }),
  actions: {
    toggleLesson(lessonId: string, courseId: string, moduleId: string) {
      const isNowComplete = !this.completedLessons[lessonId]
      this.completedLessons[lessonId] = isNowComplete

      if (!isNowComplete) {
        // If a lesson is unchecked, instantly invalidate parents (no calculation needed)
        this.completedCourses[courseId] = false
        this.completedModules[moduleId] = false
        return
      }

      // If checked, check siblings to see if we should bubble up
      const siblings = courseLessonsMap[courseId] || []
      const courseComplete = siblings.every(id => this.completedLessons[id])

      if (courseComplete) {
        this.completedCourses[courseId] = true

        // If course became complete, check course siblings
        const courseSiblings = moduleCoursesMap[moduleId] || []
        const moduleComplete = courseSiblings.every(id => this.completedCourses[id])

        if (moduleComplete) {
          this.completedModules[moduleId] = true
        }
      }
    },
    initializeCompletions() {
      for (const [moduleId, courseIds] of Object.entries(moduleCoursesMap)) {
        let allCoursesComplete = courseIds.length > 0;

        for (const courseId of courseIds) {
          const lessonIds = courseLessonsMap[courseId] || [];
          const allLessonsComplete = lessonIds.length > 0 && lessonIds.every(id => this.completedLessons[id]);

          this.completedCourses[courseId] = allLessonsComplete;
          if (!allLessonsComplete) {
            allCoursesComplete = false;
          }
        }
        this.completedModules[moduleId] = allCoursesComplete;
      }
    }
  },
  persist: {
    pick: ['completedLessons']
  }
})
