<template>
  <router-view />
</template>

<script setup lang="ts">
import { Loading, useMeta } from 'quasar';
import { watchEffect } from 'vue';

import { useEventStore } from '@evan/stores/event';

import { EVAN_EVENT_CODE } from '@/constants';
import { notify } from '@/utils/notify';

Loading.show({
  delay: 250,
});

const eventStore = useEventStore();

if (process.env.ARCHIVED) {
  eventStore.setArchived(true);
}

eventStore.init(EVAN_EVENT_CODE).catch(() => {
  Loading.hide();
});

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
