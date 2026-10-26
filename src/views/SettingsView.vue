<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useTheme } from 'vuetify';

const store = useSettingsStore();
const theme = useTheme();

const currentTheme = computed({
    get: () => store.theme,
    set: (newValue) => {
        store.theme = newValue;
        theme.change(newValue);
    }
})
</script>

<template>
    <v-container class="py-6">
        <v-card max-width="800" class="mx-auto" elevation="2" rounded="xl">
            <v-card-item class="text-center pt-8 pb-4">
                <v-avatar v-model="store.profilePicture" color="surface-variant" size="128" rounded="lg"
                    :badge="{ color: 'primary', location: 'bottom end' }">
                    <template v-slot:badge>
                        <v-icon-btn icon="mdi-pencil" size="x-small" variant="plain"></v-icon-btn>
                    </template>
                </v-avatar>
                <v-text-field v-model="store.username" clearable label="Nome"></v-text-field>
            </v-card-item>
            <v-card-item class="pb-4">
                <v-radio-group v-model="currentTheme" label="Tema">
                    <v-radio value="system">
                        <template v-slot:label>
                            <v-icon icon="mdi-desktop-tower-monitor" class="mr-1"></v-icon>
                            Sistema
                        </template>
                    </v-radio>
                    <v-radio value="light">
                        <template v-slot:label>
                            <v-icon icon="mdi-white-balance-sunny" class="mr-1"></v-icon>
                            Claro
                        </template>
                    </v-radio>
                    <v-radio value="dark">
                        <template v-slot:label>
                            <v-icon icon="mdi-weather-night" class="mr-1"></v-icon>
                            Escuro
                        </template>
                    </v-radio>
                </v-radio-group>
            </v-card-item>
        </v-card>
    </v-container>
</template>