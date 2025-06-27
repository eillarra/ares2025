<template>
  <div class="q-my-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Call for Workshops</h2>
          <q-separator />
          <q-space />
          <q-card flat bordered square class="q-pa-sm q-mb-md" :class="{ 'q-pa-lg': $q.screen.gt.sm }">
            <q-card-section>
              <h4 class="ares__text-subtitle2">If you need any assistance, do not hesitate to contact us</h4>
              <ares-btn :icon="iconEmail" label="Ask a question" type="a" :href="`mailto:${contactEmail}`" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-7">
          <marked-div v-if="callText" :text="callText" />
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

import { iconEmail } from '@/icons';

const eventStore = useEventStore();

const { contactEmail, contentsDict } = storeToRefs(eventStore);

const callText = computed<MarkdownText | null>(
  () => (contentsDict.value['call_for_workshops']?.value as MarkdownText) || null,
);

useMeta(() => {
  return {
    title: 'Call for Workshops',
  };
});
</script>
