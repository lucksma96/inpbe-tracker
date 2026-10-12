<script setup lang="ts">

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf4E_KB-gw22jIYqMPdytoP8ahedf6H1MbAlbrVk31bUM_p5g/viewform?usp=publish-editor"
</script>

<template>
    <v-container class="py-6">
        <v-card max-width="800" class="mx-auto" elevation="2" rounded="xl">
            <!-- Header Section -->
            <v-card-item class="text-center pt-8 pb-4">
                <v-avatar color="purple-lighten-5" size="80" class="mb-4">
                    <v-icon icon="mdi-heart" color="purple" size="40"></v-icon>
                </v-avatar>
                <v-card-title class="text-h4 font-weight-bold text-primary">
                    InPBE Tracker
                </v-card-title>
                <v-card-subtitle class="text-subtitle-1 mt-2 text-medium-emphasis">
                    Feito com carinho para minha amada Ana 💜
                </v-card-subtitle>
            </v-card-item>

            <v-divider class="mx-8 mb-4"></v-divider>

            <!-- Content Section -->
            <v-card-text class="px-sm-8 px-4 pb-8 text-body-1 text-medium-emphasis">
                <p class="mb-4">
                    Originalmente, eu havia criado uma planilha no Google Sheets para que ela pudesse registrar o seu
                    progresso na pós, marcando as aulas assistidas e visualizando métricas como porcentagem de conclusão
                    e horas restantes. Mas eu decidi criar uma aplicação que fosse mais fácil de usar e muito mais
                    bonita.
                </p>

                <p class="mb-8">
                    Assim surgiu o <strong class="text-primary font-weight-bold">InPBE Tracker</strong>. Não é
                    necessário criar conta, e todas as informações
                    são armazenadas localmente no navegador. Basta entrar e marcar as aulas.
                </p>

                <h3 class="text-h6 font-weight-regular mb-3 text-high-emphasis">
                    Funcionalidades planejadas:
                </h3>

                <!-- Planned Features List -->
                <v-list density="compact" class="mb-8 bg-transparent pa-0">
                    <v-list-item prepend-icon="mdi-swap-horizontal" title="Exportar/importar progresso"></v-list-item>
                    <v-list-item prepend-icon="mdi-magnify" title="Pesquisa rápida de aulas"></v-list-item>
                    <v-list-item prepend-icon="mdi-palette-outline"
                        title="Personalizações (foto e nome de perfil)"></v-list-item>
                </v-list>

                <!-- Feedback Action Area -->
                <v-sheet color="grey-lighten-4" rounded="lg" class="pa-5 mb-8 text-center">
                    <p class="text-body-2 mt-0 mb-4 text-high-emphasis">
                        Sinta-se à vontade para reportar problemas ou fazer sugestões:
                    </p>
                    <div class="d-flex flex-wrap ga-4 justify-center">
                        <v-btn :href="FORM_URL" target="_blank" prepend-icon="mdi-message-text" color="primary"
                            variant="flat">
                            Formulário
                        </v-btn>
                        <v-btn href="mailto:lz.magnanimous@gmail.com" prepend-icon="mdi-email" color="primary"
                            variant="outlined">
                            Enviar Email
                        </v-btn>
                    </div>
                </v-sheet>

                <!-- GitHub Repository Link -->
                <div class="d-flex justify-center mb-10">
                    <v-btn href="https://github.com/lucksma96/inpbe-tracker" target="_blank" prepend-icon="mdi-github"
                        color="black" variant="tonal">
                        Código Fonte no GitHub
                    </v-btn>
                </div>

                <!-- Tech Stack Footer -->
                <div class="d-flex flex-wrap align-center justify-center ga-3">
                    <v-chip size="small" variant="tonal" color="success" prepend-icon="mdi-vuejs">
                        Vue 3
                    </v-chip>
                    <v-chip size="small" variant="tonal" color="blue-darken-2" prepend-icon="mdi-language-typescript">
                        TypeScript
                    </v-chip>
                    <v-chip size="small" variant="tonal" color="light-blue" prepend-icon="mdi-vuetify">
                        Vuetify
                    </v-chip>
                </div>
            </v-card-text>
        </v-card>
    </v-container>
</template>