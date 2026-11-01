import type { Module } from "../module";

export interface IProgressState {
    curriculum: Module[];
    completedLessons: Record<string, boolean>;
    completedCourses: Record<string, boolean>;
    completedModules: Record<string, boolean>;
    courseCompletedCounts: Record<string, number>;
    moduleCompletedCounts: Record<string, number>;
}
