<template>
  <div class="q-my-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Presenter info</h2>
          <q-separator />
        </div>
        <div class="col-12 col-md-7">
          <marked-div v-if="presenterInfoText" :text="presenterInfoText" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMeta } from 'quasar';

import { useEventStore } from '@evan/stores/event';

const eventStore = useEventStore();

const { contentsDict } = storeToRefs(eventStore);

const presenterInfoText = computed<MarkdownText | null>(
  () => (contentsDict.value['presenter_info']?.value as MarkdownText) || null,
);

useMeta(() => {
  return {
    title: 'Presenter info',
  };
});
</script>
