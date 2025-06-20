<template>
  <div class="q-my-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Code of Conduct</h2>
          <q-separator />
          <h6 class="ares__text-red">
            With the registration participants agree to comply with the code of conduct for ARES.
          </h6>
          <q-space />
          <q-card flat bordered square class="q-pa-sm q-mb-md" :class="{ 'q-pa-lg': $q.screen.gt.sm }">
            <q-card-section>
              <h4 class="ares__text-subtitle2">Reporting</h4>
              <marked-div v-if="reportingText" :text="reportingText" class="q-mb-lg text-body2" />
              <ares-btn :icon="iconEmail" label="Mail a report" type="a" :href="`mailto:${contactEmail}`" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-7">
          <marked-div v-if="codeOfConductText" :text="codeOfConductText" />
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

import { iconEmail } from 'src/icons';

const eventStore = useEventStore();

const { contactEmail, contentsDict } = storeToRefs(eventStore);

const codeOfConductText = computed<MarkdownText | null>(
  () => (contentsDict.value['code_of_conduct']?.value as MarkdownText) || null,
);
const reportingText = computed<MarkdownText | null>(
  () => (contentsDict.value['code_of_conduct.reporting']?.value as MarkdownText) || null,
);

useMeta(() => {
  return {
    title: 'Code of Conduct',
  };
});
</script>
