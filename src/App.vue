<template>
  <router-view />
</template>

<script setup lang="ts">
import { Loading, useMeta } from 'quasar';

import { useEventStore } from 'src/evan/stores/event';
import { notify } from 'src/utils/notify';

Loading.show({
  delay: 250,
});

useEventStore().init();

useMeta({
  title: 'ARES 2025',
  titleTemplate: (title) => (title == 'ARES 2025' ? title : `${title} - ARES 2025`),
});

window.addEventListener('vite:preloadError', () => {
  notify.reload();
});
</script>
