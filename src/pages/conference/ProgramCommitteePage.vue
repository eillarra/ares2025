<template>
  <div class="q-my-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Program Committee</h2>
          <q-separator />
          <h6 class="ares__text-red">
            The success of ARES is fundamentally driven by its dedicated and engaged organizing committees.
          </h6>
        </div>
        <div class="col-12 col-md-7">
          <marked-div v-if="committeeText" :text="committeeText" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMeta } from 'quasar';

import { useEventStore } from 'src/evan/stores/event';

const eventStore = useEventStore();

const { contentsDict } = storeToRefs(eventStore);

const committeeText = computed<MarkdownText | null>(
  () => (contentsDict.value['program_committee']?.value as MarkdownText) || null,
);

useMeta(() => {
  return {
    title: 'Program Committee',
  };
});
</script>
