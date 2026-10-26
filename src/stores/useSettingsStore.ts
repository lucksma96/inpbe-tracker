import { defineStore } from "pinia";
import type { ISettingsState } from "../models/states/ISettingsState";


export const useSettingsStore = defineStore("settings", {
    state: (): ISettingsState => ({
        theme: 'system',
        username: "",
        profilePicture: ""
    }),
    persist: true
})