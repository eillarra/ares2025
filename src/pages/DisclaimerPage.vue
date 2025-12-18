<template>
  <div class="q-my-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Disclaimer</h2>
          <q-separator />
        </div>
        <div class="col-12 col-md-7">
          <marked-div v-if="legalNoticeText" :text="legalNoticeText" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMeta } from 'quasar';

import { useEventStore } from '@evan/stores/event';

const eventStore = useEventStore();

const contentsDict = computed(() => eventStore.contentsDict);

const legalNoticeText = computed<MarkdownText | null>(() => contentsDict.value['disclaimer']?.value || null);

useMeta(() => {
  return {
    title: 'Disclaimer',
  };
});
</script>
