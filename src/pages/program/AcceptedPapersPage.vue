<template>
  <div class="q-my-xl q-pb-xl">
    <div v-if="event" class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-xl justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Accepted Papers</h2>
          <q-separator />
          <h6 class="ares__text-red">
            All accepted Papers at <span class="text-no-wrap">{{ event.name }}</span>: Full Papers, Short Papers, System of Knowledge. ARES papers are listed in no particular order, followed by workshops organized alphabetically, with their accepted papers, as well as ICS-CSR.
          </h6>
        </div>
        <div class="col-12 col-md-7">
          <marked-div v-if="papersText" :text="papersText" class="q-mb-lg" />
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

const { contentsDict, event } = storeToRefs(eventStore);

const papersText = computed<MarkdownText | null>(() => (contentsDict.value['program.accepted_papers']?.value as MarkdownText) || null);

useMeta(() => {
  return {
    title: 'Accepted Papers',
  };
});
</script>
