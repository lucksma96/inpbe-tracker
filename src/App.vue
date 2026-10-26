<script setup lang="ts">
import { onMounted } from "vue";
import { useProgressStore } from "./stores/useProgressStore";

const store = useProgressStore();

onMounted(() => {
  store.initializeCompletions();
});

const routes = [
  { route: '/', title: 'Início' },
  { route: '/settings', title: 'Configurações' },
  { route: '/about', title: 'Sobre' }
]
</script>

<template>
  <v-app id="inpbe">
    <v-app-bar flat>
      <v-container class="mx-auto d-flex align-center justify-center">
        <v-avatar color="purple" size="32" v-if="false"></v-avatar>

        <v-btn class="mx-1" v-for="r in routes" :to="r.route" :text="r.title" variant="text"></v-btn>

        <v-spacer></v-spacer>

        <v-responsive max-width="160" v-if="false">
          <v-text-field density="compact" label="Pesquisar" rounded="lg" variant="solo-filled" flat hide-details
            single-line></v-text-field>
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
