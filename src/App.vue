<template>
  <router-view />
</template>

<script setup lang="ts">
import { Loading, useMeta } from 'quasar';
import { watchEffect } from 'vue';

import { useEventStore } from '@evan/stores/event';

import { notify } from '@/utils/notify';

Loading.show({
  delay: 250,
});

const eventStore = useEventStore();

// Initialize the event store and handle loading completion
eventStore.init().catch(() => {
  // Hide loading even if initialization fails
  Loading.hide();
});

// Hide loading when initial data is loaded
watchEffect(() => {
  if (eventStore._loaded) {
    Loading.hide();
  }
});

useMeta({
  title: 'ARES 2025',
  titleTemplate: (title) => (title == 'ARES 2025' ? title : `${title} - ARES 2025`),
});

window.addEventListener('vite:preloadError', () => {
  notify.reload();
});
</script>
