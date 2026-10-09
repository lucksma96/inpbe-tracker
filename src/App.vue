<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  useProgressStore,
  moduleTotalLessons,
  courseTotalLessons,
} from "./stores/useProgressStore";

import type { Module } from "./models/module";
import type { Course } from "./models/course";

const store = useProgressStore();

onMounted(() => {
  store.initializeCompletions();
});

const links: Array<string> = ["Início"];

// Navigation State
const currentDepth = ref<0 | 1 | 2>(0);
const selectedModule = ref<Module | null>(null);
const selectedCourse = ref<Course | null>(null);

// Navigation Methods
const openModule = (module: Module) => {
  selectedModule.value = module;
  currentDepth.value = 1;
};

const openCourse = (course: Course) => {
  selectedCourse.value = course;
  currentDepth.value = 2;
};

const goBack = () => {
  if (currentDepth.value === 2) currentDepth.value = 1;
  else if (currentDepth.value === 1) currentDepth.value = 0;
};

const completeAll = () => {
  if (!selectedCourse.value || !selectedModule.value) return;

  // Pass the raw array of lesson IDs
  const lessonIds = selectedCourse.value.lessons.map(l => l.lessonId);

  store.completeCourse(
    selectedCourse.value.courseId,
    selectedModule.value.moduleId,
    lessonIds
  );
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

const isSelectedCourseIncomplete = computed((): boolean => {
  if (!selectedCourse.value) return false;

  return !store.completedCourses[selectedCourse.value.courseId];
});

// Helper to format minutes into a readable string
const formatTime = (minutes: number): string => {
  if (minutes <= 0) return "Concluído";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m restantes` : `${m}m restantes`;
};

// Calculate remaining time for a specific Course
const getCourseTimeLeft = (course: Course): number => {
  let minutesLeft = 0;
  course.lessons.forEach((l) => {
    if (!store.completedLessons[l.lessonId]) {
      minutesLeft += l.durationMinutes;
    }
  });
  return minutesLeft;
};

// Calculate remaining time for a specific Module
const getModuleTimeLeft = (module: Module): number => {
  let minutesLeft = 0;
  module.courses.forEach((c) => {
    minutesLeft += getCourseTimeLeft(c);
  });
  return minutesLeft;
};

// Calculate total remaining time for the entire Curriculum
const getGlobalTimeLeft = (): number => {
  let minutesLeft = 0;
  store.curriculum.forEach((m) => {
    minutesLeft += getModuleTimeLeft(m);
  });
  return minutesLeft;
};
</script>

<template>
  <v-app id="inpbe">
    <v-app-bar flat v-if="false">
      <v-container class="mx-auto d-flex align-center justify-center">
        <v-avatar color="purple" size="32"></v-avatar>

        <v-btn v-for="link in links" :key="link" :text="link" variant="text"></v-btn>

        <v-spacer></v-spacer>

        <v-responsive max-width="160">
          <v-text-field
            density="compact"
            label="Pesquisar"
            rounded="lg"
            variant="solo-filled"
            flat
            hide-details
            single-line
          ></v-text-field>
        </v-responsive>
      </v-container>
    </v-app-bar>

    <v-main class="bg-grey-lighten-3">
      <v-container>
        <v-card max-width="800" class="mx-auto">
          <!-- Dynamic Header with Back Button -->
          <v-toolbar color="primary">
            <v-btn v-if="currentDepth > 0" icon="mdi-arrow-left" @click="goBack"></v-btn>
            <v-toolbar-title>
              {{
                currentDepth === 0
                  ? "Currículo"
                  : currentDepth === 1
                    ? selectedModule?.title
                    : selectedCourse?.title
              }}
            </v-toolbar-title>
            <template v-slot:append>
              <v-chip
                class="mr-2 font-weight-bold"
                color="white"
                variant="outlined"
                size="small"
              >
                {{
                  currentDepth === 0
                    ? formatTime(getGlobalTimeLeft())
                    : currentDepth === 1
                    ? formatTime(getModuleTimeLeft(selectedModule!))
                    : formatTime(getCourseTimeLeft(selectedCourse!))
                }}
              </v-chip>
              <v-btn v-if="currentDepth === 2 && isSelectedCourseIncomplete" icon="mdi-check-all" @click="completeAll"></v-btn>
            </template>
          </v-toolbar>

          <!-- v-window handles the left/right sliding animation automatically -->
          <v-window v-model="currentDepth">
            <!-- DEPTH 0: MODULES -->
            <v-window-item :value="0">
              <v-list>
                <v-list-item
                  v-for="(m, i) in store.curriculum"
                  :key="m.moduleId"
                  :title="`Módulo ${i + 1} - ${m.title}`"
                  :subtitle="formatTime(getModuleTimeLeft(m))"
                  :prepend-icon="
                    store.completedModules[m.moduleId] ? 'mdi-check-circle' : 'mdi-folder'
                  "
                  :base-color="store.completedModules[m.moduleId] ? 'success' : undefined"
                  append-icon="mdi-chevron-right"
                  @click="openModule(m)"
                >
                  <v-progress-linear
                    :model-value="getModulePercentage(m.moduleId)"
                    :chunk-count="m.courses.length"
                    chunk-gap="2"
                    color="primary"
                    height="15"
                    rounded="sm"
                  >
                    <template v-slot:default="{ value }">
                      <small class="text-white">{{ Math.round(value) }}%</small>
                    </template>
                  </v-progress-linear>
                </v-list-item>
              </v-list>
            </v-window-item>

            <!-- DEPTH 1: COURSES -->
            <v-window-item :value="1">
              <v-list>
                <v-list-item
                  v-for="(c, i) in selectedModule?.courses"
                  :key="c.courseId"
                  :title="`Curso ${i + 1} - ${c.title}`"
                  :subtitle="formatTime(getCourseTimeLeft(c))"
                  :prepend-icon="
                    store.completedCourses[c.courseId]
                      ? 'mdi-check-circle-outline'
                      : 'mdi-play-box-outline'
                  "
                  :base-color="store.completedCourses[c.courseId] ? 'success' : undefined"
                  append-icon="mdi-chevron-right"
                  @click="openCourse(c)"
                >
                  <v-progress-linear
                    :model-value="getCoursePercentage(c.courseId)"
                    :chunk-count="c.lessons.length"
                    chunk-gap="2"
                    color="primary"
                    height="15"
                    rounded="sm"
                  >
                    <template v-slot:default="{ value }">
                      <small class="text-white">{{ Math.round(value) }}%</small>
                    </template>
                  </v-progress-linear>
                </v-list-item>
              </v-list>
            </v-window-item>

            <!-- DEPTH 2: LESSONS -->
            <v-window-item :value="2">
              <v-list>
                <v-list-item
                  v-for="(l, i) in selectedCourse?.lessons"
                  :key="l.lessonId"
                  :title="`Aula ${i + 1} - ${l.title}`"
                  :subtitle="`${l.durationMinutes} min`"
                >
                  <template v-slot:prepend>
                    <v-checkbox-btn
                      :model-value="!!store.completedLessons[l.lessonId]"
                      @update:model-value="
                        store.toggleLesson(
                          l.lessonId,
                          selectedCourse!.courseId,
                          selectedModule!.moduleId,
                        )
                      "
                      color="success"
                      class="mr-4"
                    ></v-checkbox-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-window-item>
          </v-window>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped></style>
