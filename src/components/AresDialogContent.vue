<style lang="scss">
.ares__full-dialog-layout {
  height: 800px;

  .q-dialog__inner--minimized > & {
    width: 100% !important;
    max-width: 1300px;
  }

  .q-stepper--vertical .q-stepper__tab {
    padding: 12px 24px 12px 20px;
  }
}

.ares__full-dialog-layout__small {
  height: 710px;

  .q-dialog__inner--minimized > & {
    width: 100% !important;
    max-width: 800px;
  }
}
</style>

<template>
  <q-layout
    view="hHh LpR lFf"
    container
    class="bg-white"
    :class="{ 'ares__full-dialog-layout': !compact, 'ares__full-dialog-layout__small': compact }"
  >
    <q-header class="bg-white q-pt-sm" :class="{ 'q-pa-md': $q.screen.gt.sm }">
      <q-toolbar class="text-primary q-pl-lg q-pr-sm use-default-q-btn">
        <q-toolbar-title v-if="title" class="col-10">
          <span class="text-mono text-dark">{{ title }}</span
          ><span v-if="subtitle" class="text-caption q-pl-md">{{ subtitle }}</span>
        </q-toolbar-title>
        <q-space />
        <q-btn flat round v-close-popup :icon="iconClose" color="ares-red" />
      </q-toolbar>
      <q-toolbar class="text-dark text-body1 q-px-lg" style="min-height: auto">
        <slot name="tabs"></slot>
      </q-toolbar>
    </q-header>
    <q-drawer v-if="!hideDrawer" v-model="drawer" :width="205">
      <q-scroll-area class="fit q-pl-lg">
        <div class="q-pb-xl">
          <slot name="menu"></slot>
        </div>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <q-page :class="{ 'q-px-md': $q.screen.gt.sm }">
        <slot name="page"></slot>
      </q-page>
    </q-page-container>
    <q-footer class="bg-white">
      <slot name="footer"></slot>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { iconClose } from 'src/icons';

defineProps<{
  title: string | undefined;
  subtitle?: string | undefined;
  hideDrawer?: boolean;
  compact?: boolean;
}>();

const drawer = ref(true);
</script>
