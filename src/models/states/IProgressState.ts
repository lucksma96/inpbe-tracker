import type { Module } from "../module";

export interface IProgressState {
    curriculum: Module[];
    completedLessons: Record<string, boolean>;
    completedCourses: Record<string, boolean>;
    completedModules: Record<string, boolean>;
    completedLessonsPerCourse: Record<string, number>;
    completedCoursesPerModule: Record<string, number>;
    lessonsDeadlines: Record<string, Date>;
}
