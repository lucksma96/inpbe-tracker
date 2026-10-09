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
  m.courses.forEach((c) => {
    const cTotal = c.lessons.length;
    courseTotalLessons[c.courseId] = cTotal;
    mTotal += cTotal;
  });
  moduleTotalLessons[m.moduleId] = mTotal;
});

export const useProgressStore = defineStore("progress", {
  state: () => ({
    curriculum: curriculum as Module[],
    completedLessons: {} as Record<string, boolean>,

    // Track booleans for the checkmark UI
    completedCourses: {} as Record<string, boolean>,
    completedModules: {} as Record<string, boolean>,

    // Track raw numbers for the progress bars
    courseCompletedCounts: {} as Record<string, number>,
    moduleCompletedCounts: {} as Record<string, number>,
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
