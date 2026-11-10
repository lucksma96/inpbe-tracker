<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useProgressStore } from "../stores/useProgressStore";
import { useTheme } from "vuetify";
import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import type { ISettingsState } from "@/models/states/ISettingsState";
import type { Module } from "../models/module";
import type { Course } from "../models/course";
import type { Lesson } from "../models/lesson";

const settingsStore = useSettingsStore();
const progressStore = useProgressStore();
const theme = useTheme();

const currentTheme = computed({
    get: () => settingsStore.theme,
    set: (newValue) => {
        settingsStore.theme = newValue;
        theme.change(newValue);
    },
});

const selectCoursesList = computed(() => {
    const selectedModule = starterModule.value;
    if (!selectedModule) return [];

    return selectedModule.courses;
});

const selectLessonsList = computed(() => {
    const selectedCourse = starterCourse.value;
    if (!selectedCourse) return [];

    return selectedCourse.lessons;
});

const profilePictureDialogActive = ref(false);

const isCalculating = ref(false);
const isCalculated = ref(false);
const isValid = ref(false);
const isDirty = ref(false);
const enableStartDate = ref(false);
const enableStarterLesson = ref(false);
const deadlineStartDate = ref<Date>();
const deadlineEndDate = ref<Date>();
const starterModule = ref<Module>();
const starterCourse = ref<Course>();
const starterLesson = ref<Lesson>();

const exportDialogActive = ref(false);
const importDialogActive = ref(false);
const confirmationDialogActive = ref(false);
const uploadedFile = ref<File | undefined>();
const temporaryProfilePictureFile = ref<File | undefined>();
const temporaryProfilePictureData = ref<string>();
const isExporting = ref(false);
const isImporting = ref(false);

const exportCurriculum = ref(false);
const exportSettings = ref(false);

const crpProfilePicture = ref();

onMounted(() => {
    if (settingsStore.startDate) {
        deadlineStartDate.value = settingsStore.startDate;
        enableStartDate.value = true;
    }

    if (settingsStore.endDate) {
        deadlineEndDate.value = settingsStore.endDate;
    }

    const storedStarterLesson = settingsStore.starterLesson;
    if (storedStarterLesson) {
        const [moduleId, courseId, _] = storedStarterLesson.lessonId.split('-');
        starterModule.value = progressStore.curriculum.find(m => m.moduleId === moduleId);
        starterCourse.value = starterModule.value?.courses.find(c => c.courseId === `${moduleId}-${courseId}`);
        starterLesson.value = storedStarterLesson;
        enableStarterLesson.value = true;
    }
});

watch(
    [
        enableStartDate,
        () => deadlineStartDate,
        () => deadlineEndDate,
        enableStarterLesson,
        starterLesson
    ],
    () => {
        isDirty.value = true;
        isCalculated.value = false;

        const validStarterDate = !enableStartDate.value || !!deadlineStartDate.value;
        const validStarterLesson = !enableStarterLesson.value || !!starterLesson.value;
        isValid.value = validStarterDate && validStarterLesson && !!deadlineEndDate.value;
    },
    { deep: true }
);

const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

const uploadProfilePicture = async () => {
    const rawFile = temporaryProfilePictureFile.value;
    const file = Array.isArray(rawFile) ? rawFile[0] : rawFile;
    if (!file) return;

    try {
        const base64Data = await fileToDataURL(file);
        temporaryProfilePictureData.value = base64Data;
    } catch (error) {
        console.error("Erro ao carregar imagem:", error);
    }
}

const saveProfilePicture = () => {
    const { canvas } = crpProfilePicture.value.getResult();

    if (canvas) {
        // Export the cropped canvas as a lightweight WebP Base64 string
        const croppedBase64 = canvas.toDataURL('image/webp', 0.8);
        settingsStore.profilePicture = croppedBase64;

        // Clear temporary data & close dialog
        temporaryProfilePictureData.value = '';
        temporaryProfilePictureFile.value = undefined;
    }

    profilePictureDialogActive.value = false;
}

const removeProfilePicture = () => {
    settingsStore.profilePicture = '';
    profilePictureDialogActive.value = false;
}

const handleCalculate = async () => {
    isCalculating.value = true;

    calculateDeadlines();

    await new Promise(resolve => setTimeout(resolve, 2000));

    settingsStore.startDate = deadlineStartDate.value;
    settingsStore.endDate = deadlineEndDate.value;
    settingsStore.starterLesson = starterLesson.value;

    isCalculating.value = false;
    isCalculated.value = true;
    isDirty.value = false;
};

const calculateDeadlines = () => {
    const startDate = settingsStore.startDate || new Date();
    const endDate = settingsStore.endDate || new Date();

    let lessons = progressStore.allLessonsFlat;
    if (enableStarterLesson.value && starterLesson.value) {
        const startIndex = lessons.findIndex(l => l.lessonId == starterLesson.value?.lessonId);
        if (startIndex !== -1) {
            lessons = lessons.slice(startIndex);
        }
    }

    if (lessons.length === 0) {
        isCalculating.value = false;
        return;
    }

    const totalDurationMinutes = lessons.map(l => l.durationMinutes).reduce((t, v) => t + v, 0);
    const millisBetweenStartEndDates = Math.abs(endDate.getTime() - startDate.getTime());
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const daysBetweenStartEndDates = Math.max(1, Math.ceil(millisBetweenStartEndDates / ONE_DAY_MS));
    const maxMinutesPerDay = totalDurationMinutes / daysBetweenStartEndDates;

    let minutesAccumulator = 0;
    for (const lesson of lessons) {
        minutesAccumulator += lesson.durationMinutes;
        const daysRequired = maxMinutesPerDay > 0 ? Math.ceil(minutesAccumulator / maxMinutesPerDay) : 0;
        const deadlineMillis = startDate.getTime() + (daysRequired * ONE_DAY_MS);
        const lessonDeadline = new Date(deadlineMillis);
        lessonDeadline.setHours(23, 59, 59, 999);
        progressStore.lessonsDeadlines[lesson.lessonId] = lessonDeadline;
    }
}

const clearStarterSelections = (module: boolean = true, course: boolean = true, lesson: boolean = true) => {
    if (module) starterModule.value = undefined;
    if (course) starterCourse.value = undefined;
    if (lesson) starterLesson.value = undefined;
}

const importFile = async () => {
    const file = uploadedFile.value as File;
    if (!file) return;

    isImporting.value = true;

    try {
        const content = await file.text();

        const fileExtension = file.name.split(".").pop();

        switch (fileExtension) {
            case "csv":
                const exportedLessonsIds = content.split(/\r?\n/);
                if (!exportedLessonsIds[0]?.match(/m\d+-c\d+-l\d+/)) exportedLessonsIds.shift();
                const completedLessonsIds = exportedLessonsIds.reduce(
                    (record, lessonId) => {
                        record[lessonId] = true;
                        return record;
                    },
                    {} as Record<string, boolean>,
                );
                progressStore.completedLessons = completedLessonsIds;
                progressStore.initializeCompletions();
                break;
            case "json":
                const dataToImport = JSON.parse(content);
                if (Object.keys(dataToImport.completedLessons).length > 0) {
                    progressStore.completedLessons = dataToImport.completedLessons;
                }
                if (Object.keys(dataToImport.settings).length > 0) {
                    const settings = dataToImport.settings;
                    settingsStore.profilePicture = settings.profilePicture;
                    settingsStore.username = settings.username;
                    settingsStore.theme = settings.theme;
                    theme.change(settings.theme);
                }
                break;
            default:
                throw new Error(`Arquivo com extensão não aceitável (${fileExtension}).`);
        }

        confirmationDialogActive.value = true;
    } catch (error) {
        console.error("Erro ao ler o arquivo de importação:", error);
    } finally {
        isImporting.value = false;
        uploadedFile.value = undefined;
    }

    importDialogActive.value = false;
};

const exportFile = () => {
    isExporting.value = true;

    try {
        const dataToExport = {
            completedLessons: {} as Record<string, boolean>,
            settings: {} as ISettingsState
        };

        if (exportCurriculum.value) {
            dataToExport.completedLessons = progressStore.completedLessons;
        }

        if (exportSettings.value) {
            dataToExport.settings = settingsStore.$state;
        }

        const jsonString = JSON.stringify(dataToExport, null, 4);
        const blob = new Blob([jsonString], { type: "application/json" });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const today = new Date().toISOString().split("T")[0];
        link.download = `inpbe-tracker-export-${today}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        confirmationDialogActive.value = true;
    } catch (error) {
        console.error("Falha ao exportar dados:", error);
    } finally {
        isExporting.value = false;
    }

    exportDialogActive.value = false;
}
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
                                <v-img v-if="settingsStore.profilePicture" :src="settingsStore.profilePicture"
                                    alt="Foto de perfil" cover></v-img>
                                <v-icon v-else icon="mdi-account" size="56" color="purple"></v-icon>
                            </v-avatar>

                            <v-btn id="btnUpdatePfp" icon="mdi-camera" size="x-small" color="primary"
                                class="position-absolute" style="bottom: 0; right: -4px" elevation="3"></v-btn>
                        </div>
                        <span class="text-caption text-medium-emphasis mt-2">Foto de perfil</span>
                    </div>

                    <v-text-field v-model="settingsStore.username" label="Nome de Usuário"
                        placeholder="Como você quer ser chamado(a)?" variant="outlined" density="comfortable"
                        prepend-inner-icon="mdi-account-circle-outline" clearable hide-details="auto"></v-text-field>
                </div>

                <v-divider class="my-2"></v-divider>

                <!-- Section 2: Appearance / Theme -->
                <div>
                    <div class="d-flex align-center">
                        <v-icon icon="mdi-palette-outline" color="primary" class="mr-2"></v-icon>
                        <h3 class="text-h6 font-weight-medium">Aparência</h3>
                    </div>

                    <p class="text-body-2 text-medium-emphasis mb-4">Escolha o tema visual do aplicativo:</p>

                    <v-btn-toggle v-model="currentTheme" mandatory color="primary" variant="outlined" divided
                        class="w-100 d-flex flex-wrap flex-sm-nowrap h-auto" rounded="lg">
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
                        <v-icon icon="mdi-calendar-range" color="primary" class="mr-2"></v-icon>
                        <h3 class="text-h6 font-weight-medium">Prazo</h3>
                    </div>

                    <p class="text-body-2 text-medium-emphasis mb-4">Defina uma data para calcular prazos para
                        finalização das
                        aulas:</p>

                    <v-container>
                        <v-row>
                            <v-col v-if="enableStartDate">
                                <v-date-input v-model="deadlineStartDate" clearable label="Data de início"
                                    class="mr-3"></v-date-input>
                            </v-col>
                            <v-col>
                                <v-date-input v-model="deadlineEndDate" clearable label="Data de fim"></v-date-input>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-checkbox-btn v-model="enableStartDate" label="Configurar data de início"></v-checkbox-btn>
                    <v-checkbox-btn v-model="enableStarterLesson" label="Mudar aula inicial"></v-checkbox-btn>
                    <v-container v-if="enableStarterLesson">
                        <v-row>
                            <v-col>
                                <v-select v-model="starterModule" clearable label="Módulo"
                                    :items="progressStore.curriculum" item-title="title" item-value="moduleId"
                                    return-object @click:clear="clearStarterSelections()"></v-select>
                            </v-col>
                            <v-col>
                                <v-select v-model="starterCourse" :disabled="!starterModule" clearable label="Curso"
                                    :items="selectCoursesList" item-title="title" item-value="courseId" return-object
                                    @click:clear="clearStarterSelections(false)"></v-select>
                            </v-col>
                            <v-col>
                                <v-select v-model="starterLesson" :disabled="!starterCourse" clearable label="Aula"
                                    :items="selectLessonsList" item-title="title" item-value="lessonId" return-object
                                    @click:clear="clearStarterSelections(false, false)"></v-select>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-btn :loading="isCalculating" :disabled="!isDirty || !isValid"
                        :color="isCalculated && !isDirty ? 'success' : 'primary'" @click="handleCalculate"
                        class="transition-swing">
                        <v-fade-transition mode="out-in">
                            <!-- SUCCESS STATE -->
                            <span v-if="isCalculated && !isDirty" key="success">
                                <v-icon icon="mdi-check-circle"></v-icon>
                            </span>

                            <!-- DEFAULT STATE -->
                            <span v-else key="default">
                                Calcular
                            </span>
                        </v-fade-transition>
                    </v-btn>
                </div>

                <v-divider class="my-2"></v-divider>

                <div>
                    <div class="d-flex align-center">
                        <v-icon icon="mdi-palette-outline" color="primary" class="mr-2"></v-icon>
                        <h3 class="text-h6 font-weight-medium">Dados</h3>
                    </div>

                    <p class="text-body-2 text-medium-emphasis mb-4">Exporte ou importe seus dados:</p>

                    <div class="d-flex">
                        <v-btn id="btnExport" prepend-icon="mdi-export" variant="tonal" class="mr-2">Exportar</v-btn>
                        <v-btn id="btnImport" prepend-icon="mdi-import" variant="tonal">Importar</v-btn>
                        <v-spacer></v-spacer>
                        <!-- <v-btn text="Clear Data" color="secondary" @click="progressStore.clearProgress"></v-btn> -->
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </v-container>

    <v-dialog v-model="profilePictureDialogActive" activator="#btnUpdatePfp" max-width="512">
        <template v-slot:default="{ isActive }">
            <v-card title="Foto de perfil">
                <v-card-text>
                    <v-file-input v-model="temporaryProfilePictureFile" clearable accept="image/*" label="Enviar foto"
                        variant="outlined" @update:model-value="uploadProfilePicture"
                        @click:clear="temporaryProfilePictureData = ''"></v-file-input>
                    <cropper ref="crpProfilePicture" :src="temporaryProfilePictureData"
                        v-show="temporaryProfilePictureData" :stencil-component="CircleStencil" :stencil-props="{
                            aspectRatio: 1 / 1
                        }" :auto-zoom="true" :stencil-size="{
                            width: 256,
                            height: 256
                        }" :canvas="{
                            width: 256,
                            height: 256
                        }" image-restriction="stencil" class="cropper"></cropper>
                </v-card-text>

                <v-card-actions>
                    <v-btn text="Cancelar" color="secondary" @click="isActive.value = false"></v-btn>
                    <v-spacer></v-spacer>
                    <v-dialog max-width="256">
                        <template v-slot:activator="{ props: activatorProps }">
                            <v-btn v-bind="activatorProps" text="Remover foto" color="secondary"></v-btn>
                        </template>
                        <template v-slot:default="{ isActive }">
                            <v-card title="Confirmação">
                                <v-card-text>Tem certeza?</v-card-text>
                                <v-card-actions>
                                    <v-btn text="Não" @click="isActive.value = false"></v-btn>
                                    <v-btn text="Sim" @click="removeProfilePicture"></v-btn>
                                </v-card-actions>
                            </v-card>
                        </template>
                    </v-dialog>
                    <v-spacer></v-spacer>
                    <v-btn text="Salvar" color="primary" @click="saveProfilePicture"></v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>

    <v-dialog v-model="exportDialogActive" activator="#btnExport" max-width="512">
        <template v-slot:default="{ isActive }">
            <v-card title="Exportar dados">
                <v-card-text>
                    <span>Escolha abaixo o você quer exportar:</span>
                    <v-checkbox-btn v-model="exportCurriculum" label="Currículo"
                        description="Lista de aulas finalizadas"></v-checkbox-btn>
                    <v-checkbox-btn v-model="exportSettings" label="Configurações"
                        description="Nome, foto, tema, etc"></v-checkbox-btn>
                </v-card-text>

                <v-card-actions>
                    <v-btn text="Cancelar" color="secondary" @click="isActive.value = false"></v-btn>
                    <v-spacer></v-spacer>
                    <v-btn text="Exportar" color="primary" :disabled="!exportCurriculum && !exportSettings"
                        @click="exportFile"></v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>

    <v-dialog v-model="importDialogActive" activator="#btnImport" max-width="512">
        <template v-slot:default="{ isActive }">
            <v-card title="Importar dados">
                <v-card-text>
                    <v-file-upload v-model="uploadedFile" density="default" icon="mdi-upload"
                        title="Arraste o arquivo com os dados a importar" divider-text="ou busque localmente"
                        browse-text="Buscar arquivo" clearable filter-by-type=".csv,.json"></v-file-upload>
                </v-card-text>

                <v-card-actions>
                    <v-btn text="Cancelar" color="secondary" @click="isActive.value = false"></v-btn>
                    <v-spacer></v-spacer>
                    <v-btn text="Importar" color="primary" @click="importFile"></v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>

    <v-dialog v-model="confirmationDialogActive" max-width="256">
        <template v-slot:default="{ isActive }">
            <v-card title="Sucesso">
                <v-card-actions>
                    <v-btn text="Fechar" @click="isActive.value = false"></v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>
<style>
.cropper {
    height: 400px;
    background: #DDD;
}
</style>
