export type Theme = 'system' | 'light' | 'dark';

export interface ISettingsState {
    theme: Theme,
    username: string,
    profilePicture: string,
    startDate: Date | undefined,
    endDate: Date | undefined,
    starterLessonId: string
}