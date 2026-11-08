import type { Lesson } from '../lesson';

export type Theme = 'system' | 'light' | 'dark';

export interface ISettingsState {
    theme: Theme;
    username?: string;
    profilePicture?: string;
    startDate?: Date;
    endDate?: Date;
    starterLesson?: Lesson;
}
