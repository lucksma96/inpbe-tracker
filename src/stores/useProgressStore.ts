import { defineStore } from "pinia";
import type { Module } from "../models/module";
import curriculumJSON from "../assets/curriculum.json";

const curriculum = curriculumJSON as Array<Module>;

// STATIC LOOKUP MAPS (Generated once on load for O(1) sibling checks)
const courseLessonsMap: Record<string, string[]> = {};
const moduleCoursesMap: Record<string, string[]> = {};

export const courseTotalLessons: Record<string, number> = {};
export const moduleTotalLessons: Record<string, number> = {};

curriculum.forEach((m) => {
  let mTotal = 0;

  moduleCoursesMap[m.moduleId] = m.courses.map(c => c.courseId)
  m.courses.forEach((c) => {
    courseLessonsMap[c.courseId] = c.lessons.map(l => l.lessonId)

    const cTotal = c.lessons.length;
    courseTotalLessons[c.courseId] = cTotal;
    mTotal += cTotal;
  });
  moduleTotalLessons[m.moduleId] = mTotal;
});

interface ProgressState {
  curriculum: Module[];
  completedLessons: Record<string, boolean>;
  completedCourses: Record<string, boolean>;
  completedModules: Record<string, boolean>;
  courseCompletedCounts: Record<string, number>;
  moduleCompletedCounts: Record<string, number>;
}

export const useProgressStore = defineStore("progress", {
  state: (): ProgressState => ({
    curriculum: curriculum,
    completedLessons: {},

    // Track booleans for the checkmark UI
    completedCourses: {},
    completedModules: {},

    // Track raw numbers for the progress bars
    courseCompletedCounts: {},
    moduleCompletedCounts: {},
  }),
  actions: {
    toggleLesson(lessonId: string, courseId: string, moduleId: string) {
      const isNowComplete = !this.completedLessons[lessonId];
      this.completedLessons[lessonId] = isNowComplete;

      // O(1) Updates: Just increment or decrement the parent counters
      const modifier = isNowComplete ? 1 : -1;

      this.courseCompletedCounts[courseId] = (this.courseCompletedCounts[courseId] ?? 0) + modifier
      this.moduleCompletedCounts[moduleId] = (this.moduleCompletedCounts[moduleId] ?? 0) + modifier

      // O(1) Checks: Compare current count against the static total
      this.completedCourses[courseId] =
        this.courseCompletedCounts[courseId] === courseTotalLessons[courseId];
      this.completedModules[moduleId] =
        this.moduleCompletedCounts[moduleId] === moduleTotalLessons[moduleId];
    },
    completeCourse(courseId: string, moduleId: string, lessonIds: string[]) {
      // 1. Mark all individual lessons as true
      lessonIds.forEach(id => {
        this.completedLessons[id] = true;
      });

      // 2. Instantly max out the course count and boolean
      const totalInCourse = courseTotalLessons[courseId] || 0;
      this.courseCompletedCounts[courseId] = totalInCourse;
      this.completedCourses[courseId] = true;

      // 3. Recalculate the parent module count based on sibling courses
      // (Since we bypassed toggleLesson, we just recalculate the module once)
      const siblingCourseIds = moduleCoursesMap[moduleId] || [];
      let newModuleCount = 0;

      siblingCourseIds.forEach(cId => {
        newModuleCount += this.courseCompletedCounts[cId] || 0;
      });

      this.moduleCompletedCounts[moduleId] = newModuleCount;
      this.completedModules[moduleId] = newModuleCount === moduleTotalLessons[moduleId];
    },
    initializeCompletions() {
      for (const mId in moduleTotalLessons) this.moduleCompletedCounts[mId] = 0;
      for (const cId in courseTotalLessons) this.courseCompletedCounts[cId] = 0;

      // Loop only through the saved lessons to restore parent counts
      for (const [lessonId, isComplete] of Object.entries(this.completedLessons)) {
        if (isComplete) {
          // Extract parent IDs via string manipulation (e.g. 'm1-c1-l1' -> 'm1-c1' -> 'm1')
          const courseId = lessonId.substring(0, lessonId.lastIndexOf("-"));
          const moduleId = courseId.substring(0, courseId.lastIndexOf("-"));

          this.courseCompletedCounts[courseId] = (this.courseCompletedCounts[courseId] ?? 0) + 1
          this.moduleCompletedCounts[moduleId] = (this.moduleCompletedCounts[moduleId] ?? 0) + 1
        }
      }

      // Restore parent booleans based on the newly calculated counts
      for (const cId in courseTotalLessons) {
        this.completedCourses[cId] = this.courseCompletedCounts[cId] === courseTotalLessons[cId];
      }
      for (const mId in moduleTotalLessons) {
        this.completedModules[mId] = this.moduleCompletedCounts[mId] === moduleTotalLessons[mId];
      }
    },
  },
  persist: {
    pick: ["completedLessons"],
  },
});
