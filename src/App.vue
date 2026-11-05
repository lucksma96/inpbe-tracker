<script setup lang="ts">
import { onMounted } from "vue";
import { useProgressStore } from "./stores/useProgressStore";
import { useSettingsStore } from "./stores/useSettingsStore";

const progressStore = useProgressStore();
const settingsStore = useSettingsStore();

onMounted(() => {
    progressStore.initializeCompletions();
});

const routes = [
    { route: "/", title: "Início" },
    { route: "/settings", title: "Configurações" },
    { route: "/about", title: "Sobre" },
];
</script>

<template>
    <v-app id="inpbe">
        <v-app-bar flat>
            <v-container class="mx-auto d-flex align-center justify-center">
                <v-btn
                    class="mx-1"
                    v-for="r in routes"
                    :key="r.route"
                    :to="r.route"
                    :text="r.title"
                    variant="text"
                ></v-btn>

                <v-spacer></v-spacer>

                <span v-if="settingsStore.username" class="mr-2">Olá, {{ settingsStore.username }}</span>
                <v-avatar size="32" color="purple-lighten-5" class="elevation-2">
                    <v-img
                        v-if="settingsStore.profilePicture"
                        :src="settingsStore.profilePicture"
                        alt="Foto de perfil"
                        cover
                    ></v-img>
                    <v-icon v-else icon="mdi-account" size="32" color="purple"></v-icon>
                </v-avatar>

                <v-responsive max-width="160" v-if="false">
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
        <v-main class="color-background">
            <router-view v-slot="{ Component }">
                <v-fade-transition hide-on-leave>
                    <component :is="Component" />
                </v-fade-transition>
            </router-view>
        </v-main>
    </v-app>
</template>

<style scoped></style>
