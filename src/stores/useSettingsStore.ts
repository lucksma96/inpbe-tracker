import { defineStore } from 'pinia';
import { dateSerializer } from '@/utils/serializer';
import type { ISettingsState } from '@/models/states/ISettingsState';

export const useSettingsStore = defineStore('settings', {
    state: (): ISettingsState => ({
        theme: 'system',
        username: '',
        profilePicture: '',
        startDate: undefined,
        endDate: undefined,
        starterLesson: undefined,
    }),
    persist: {
        serializer: dateSerializer,
    },
});
