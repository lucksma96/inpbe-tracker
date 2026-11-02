import { defineStore } from "pinia";
import type { ISettingsState } from "../models/states/ISettingsState";


export const useSettingsStore = defineStore("settings", {
    state: (): ISettingsState => ({
        theme: 'system',
        username: "",
        profilePicture: "",
        startDate: undefined,
        endDate: undefined,
        starterLesson: undefined
    }),
    persist: {
        serializer: {
            serialize: JSON.stringify,
            deserialize: (parseString) => {
                return JSON.parse(parseString, (key, value) => {
                    // Regex to detect standard ISO 8601 date strings
                    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
                    if (typeof value === 'string' && isoDateRegex.test(value)) {
                        return new Date(value);
                    }
                    return value;
                });
            }
        }
    }
})