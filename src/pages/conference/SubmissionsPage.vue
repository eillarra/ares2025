<template>
  <div class="q-my-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-xl justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Submission guidelines</h2>
          <q-separator />
          <h6 class="ares__text-red">
            Authors are invited to submit research and application papers according to the following guidelines.
          </h6>
          <div class="q-mb-lg">
            <ares-btn
              :icon="iconEasyChair"
              label="Submit your paper to EasyChair"
              type="a"
              href="https://easychair.org/conferences/?conf=ares2025"
              target="_blank"
              rel="noopener noreferrer"
              :class="{ 'full-width': $q.screen.lt.sm }"
            />
          </div>
          <q-space />
          <q-card flat bordered square class="q-pa-sm q-mb-md" :class="{ 'q-pa-lg': $q.screen.gt.sm }">
            <q-card-section>
              <h4 class="ares__text-subtitle2">If you need any assistance, do not hesitate to contact us</h4>
              <ares-btn :icon="iconEmail" label="Ask a question" type="a" href="mailto:ares@sba-research.org" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-7">
          <marked-div v-if="submissionsText" :text="submissionsText" />
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

import { iconEasyChair, iconEmail } from 'src/icons';

const eventStore = useEventStore();

const { contentsDict } = storeToRefs(eventStore);

const submissionsText = computed<MarkdownText | null>(
  () => (contentsDict.value['submissions']?.value as MarkdownText) || null,
);

useMeta(() => {
  return {
    title: 'Submission guidelines',
  };
});
</script>
