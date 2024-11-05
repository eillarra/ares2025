<template>
  <div class="q-my-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-xl justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Contact us</h2>
          <q-separator />
        </div>
        <div class="col-12 col-md-7">
          <marked-div v-if="contactText" :text="contactText" />
          <blockquote class="q-my-xl">
            <marked-div v-if="contactInfo" :text="contactInfo" />
          </blockquote>
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

import { useEventStore } from 'src/evan/stores/event';

import { iconEmail } from 'src/icons';

const eventStore = useEventStore();

const { contactEmail, contentsDict } = storeToRefs(eventStore);

const contactText = computed<MarkdownText | null>(
  () => (contentsDict.value['contact.intro']?.value as MarkdownText) || null,
);
const contactInfo = computed<MarkdownText | null>(
  () => (contentsDict.value['contact.info']?.value as MarkdownText) || null,
);

useMeta(() => {
  return {
    title: 'Contact',
  };
});
</script>
