<template>
  <div class="q-my-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Contact us</h2>
          <q-separator />
        </div>
        <div class="col-12 col-md-7">
          <marked-div v-if="contactText" :text="contactText" class="q-mb-lg" />
          <ares-btn :icon="iconEmail" label="Contact us" type="a" :href="`mailto:${contactEmail}`" />
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

const contactText = computed<MarkdownText | null>(() => (contentsDict.value['contact']?.value as MarkdownText) || null);

useMeta(() => {
  return {
    title: 'Contact',
  };
});
</script>
