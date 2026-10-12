import {
    useProgressStore,
    moduleTotalLessons,
    courseTotalLessons,
} from "../stores/useProgressStore";

import type { Module } from "../models/module";
import type { Course } from "../models/course";

export function useCurriculumMetrics() {

    const store = useProgressStore();

    // Helper to format minutes into a readable string
    const formatTime = (minutes: number): string => {
        if (minutes <= 0) return "Concluído";
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m restantes` : `${m}m restantes`;
    };

    const getModulePercentage = (moduleId: string): number => {
        if (store.completedModules[moduleId]) return 100;

        const completed = store.moduleCompletedCounts[moduleId] || 0;
        const total = moduleTotalLessons[moduleId] || 1; // fallback to 1 to prevent divide-by-zero

        return Math.round((completed / total) * 100);
    };

    const getCoursePercentage = (courseId: string): number => {
        if (store.completedCourses[courseId]) return 100;

        const completed = store.courseCompletedCounts[courseId] || 0;
        const total = courseTotalLessons[courseId] || 1;

        return Math.round((completed / total) * 100);
    };

    const getGlobalTimeLeft = (): number => {
        let minutesLeft = 0;
        store.curriculum.forEach((m) => {
            minutesLeft += getModuleTimeLeft(m);
        });
        return minutesLeft;
    };

    const getModuleTimeLeft = (module: Module): number => {
        let minutesLeft = 0;
        module.courses.forEach((c) => {
            minutesLeft += getCourseTimeLeft(c);
        });
        return minutesLeft;
    };

    const getCourseTimeLeft = (course: Course): number => {
        let minutesLeft = 0;
        course.lessons.forEach((l) => {
            if (!store.completedLessons[l.lessonId]) {
                minutesLeft += l.durationMinutes;
            }
        });
        return minutesLeft;
    };

    return {
        formatTime,
        getModulePercentage,
        getCoursePercentage,
        getGlobalTimeLeft,
        getModuleTimeLeft,
        getCourseTimeLeft,
    }
}