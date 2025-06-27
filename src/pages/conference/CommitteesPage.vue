<template>
  <div class="q-my-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Organizing Committees</h2>
          <q-separator />
          <h6 class="ares__text-red">
            The success of ARES is fundamentally driven by its dedicated and engaged organizing committees.
          </h6>
        </div>
        <div class="col-12 col-md-7">
          <marked-div v-if="committeesText" :text="committeesText" />
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

const committeesText = computed<MarkdownText | null>(
  () => (contentsDict.value['committees']?.value as MarkdownText) || null,
);

useMeta(() => {
  return {
    title: 'Committees',
  };
});
</script>
