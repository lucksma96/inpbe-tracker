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
    },
});
</script>

<template>
    <v-container class="py-6">
        <v-card max-width="800" class="mx-auto pa-2 pa-sm-4" elevation="2" rounded="xl">
            <v-card-item class="pb-2">
                <template v-slot:prepend>
                    <v-icon icon="mdi-cog-outline" color="primary" size="32" class="mr-2"></v-icon>
                </template>
                <v-card-title class="text-h5 font-weight-bold">Configurações</v-card-title>
                <v-card-subtitle>Personalize seu perfil e a aparência do aplicativo</v-card-subtitle>
            </v-card-item>

            <v-divider class="mt-4"></v-divider>

            <v-card-text>
                <!-- Section 1: User Profile -->
                <div class="mb-8">
                    <div class="d-flex align-center">
                        <v-icon icon="mdi-account-outline" color="primary" class="mr-2"></v-icon>
                        <h3 class="text-h6 font-weight-medium">Perfil</h3>
                    </div>

                    <div class="d-flex flex-column align-center mb-6">
                        <div class="position-relative">
                            <v-avatar size="100" color="purple-lighten-5" class="elevation-2">
                                <v-img
                                    v-if="store.profilePicture"
                                    :src="store.profilePicture"
                                    alt="Foto de perfil"
                                    cover
                                ></v-img>
                                <v-icon v-else icon="mdi-account" size="56" color="purple"></v-icon>
                            </v-avatar>

                            <v-btn
                                icon="mdi-camera"
                                size="x-small"
                                color="primary"
                                class="position-absolute"
                                style="bottom: 0; right: -4px"
                                elevation="3"
                            ></v-btn>
                        </div>
                        <span class="text-caption text-medium-emphasis mt-2">Foto de perfil</span>
                    </div>

                    <v-text-field
                        v-model="store.username"
                        label="Nome de Usuário"
                        placeholder="Como você quer ser chamado(a)?"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-account-circle-outline"
                        clearable
                        hide-details="auto"
                    ></v-text-field>
                </div>

                <v-divider class="my-2"></v-divider>

                <!-- Section 2: Appearance / Theme -->
                <div>
                    <div class="d-flex align-center">
                        <v-icon icon="mdi-palette-outline" color="primary" class="mr-2"></v-icon>
                        <h3 class="text-h6 font-weight-medium">Aparência</h3>
                    </div>

                    <p class="text-body-2 text-medium-emphasis mb-4">
                        Escolha o tema visual do aplicativo:
                    </p>

                    <v-btn-toggle
                        v-model="currentTheme"
                        mandatory
                        color="primary"
                        variant="outlined"
                        divided
                        class="w-100 d-flex flex-wrap flex-sm-nowrap h-auto"
                        rounded="lg"
                    >
                        <v-btn value="system" class="flex-grow-1 py-3 h-auto" stack>
                            <v-icon icon="mdi-desktop-tower-monitor" class="mr-1"></v-icon>
                            <span>Sistema</span>
                        </v-btn>

                        <v-btn value="light" class="flex-grow-1 py-3 h-auto" stack>
                            <v-icon icon="mdi-white-balance-sunny" class="mr-1"></v-icon>
                            <span>Claro</span>
                        </v-btn>

                        <v-btn value="dark" class="flex-grow-1 py-3 h-auto" stack>
                            <v-icon icon="mdi-weather-night" class="mr-1"></v-icon>
                            <span>Escuro</span>
                        </v-btn>
                    </v-btn-toggle>
                </div>

                <v-divider class="my-2"></v-divider>

                <div>
                    <div class="d-flex align-center">
                        <v-icon icon="mdi-palette-outline" color="primary" class="mr-2"></v-icon>
                        <h3 class="text-h6 font-weight-medium">Dados</h3>
                    </div>

                    <p class="text-body-2 text-medium-emphasis mb-4">
                        Exporte ou importe seus dados:
                    </p>

                    <div>
                        <v-btn
                            id="btnExport"
                            prepend-icon="mdi-export"
                            variant="tonal"
                            class="mr-2"
                        >
                            Exportar
                        </v-btn>
                        <v-btn id="btnImport" prepend-icon="mdi-import" variant="tonal"
                            >Importar</v-btn
                        >
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </v-container>

    <v-dialog activator="#btnExport" max-width="512">
        <template v-slot:default="{ isActive }">
            <v-card title="Exportar dados">
                <v-card-text>
                    <span>Escolha abaixo o você quer exportar:</span>
                    <v-checkbox-btn
                        label="Currículo"
                        description="Lista de aulas finalizadas"
                    ></v-checkbox-btn>
                    <v-checkbox-btn
                        label="Configurações"
                        description="Nome, foto, tema, etc"
                    ></v-checkbox-btn>
                </v-card-text>

                <v-card-actions>
                    <v-btn
                        text="Cancelar"
                        color="secondary"
                        @click="isActive.value = false"
                    ></v-btn>
                    <v-spacer></v-spacer>
                    <v-btn text="Exportar" color="primary"></v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>

    <v-dialog activator="#btnImport" max-width="512">
        <template v-slot:default="{ isActive }">
            <v-card title="Importar dados">
                <v-card-text>
                    <v-file-upload
                        density="default"
                        title="Arraste o arquivo com os dados a importar"
                        divider-text="ou busque localmente"
                        browse-text="Buscar arquivo"
                    ></v-file-upload>
                </v-card-text>

                <v-card-actions>
                    <v-btn
                        text="Cancelar"
                        color="secondary"
                        @click="isActive.value = false"
                    ></v-btn>
                    <v-spacer></v-spacer>
                    <v-btn text="Importar" color="primary"></v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>
