<script setup lang="ts">
import { computed } from 'vue';
import { useDate } from 'vuetify';
import type { LessonDeadlineProps } from '../models/components/lessonDeadlineProps';

const props = defineProps<LessonDeadlineProps>();

const date = useDate();

const states = {
    completed: { color: 'success', variant: 'text', icon: 'mdi-calendar-check' },
    overdue: { color: 'error', variant: 'tonal', icon: 'mdi-alert' },
    due: { color: 'warning', variant: 'text', icon: 'mdi-clock-alert' },
    ontime: { color: 'default', variant: 'text', icon: 'mdi-calendar-question' }
} as const;

const chipConfig = computed(() => {
    if (!props.deadline) return null;

    if (props.isCompleted) return states.completed;

    const now = new Date();
    const target = new Date(props.deadline);

    // normalize both dates to midnight
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();

    if (todayMidnight > targetMidnight) return states.overdue;
    if (todayMidnight === targetMidnight) return states.due;

    return states.ontime;
});
</script>
<template>
    <v-chip v-if="chipConfig && deadline" size="small" :color="chipConfig.color" :variant="chipConfig.variant"
        class="font-weight-medium px-2">
        <template v-slot:prepend>
            <v-icon :icon="chipConfig.icon" start size="small"></v-icon>
        </template>

        {{ date.format(props.deadline, 'keyboardDate') }}
    </v-chip>
</template>