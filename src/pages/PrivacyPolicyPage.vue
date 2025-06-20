<template>
  <div class="q-my-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Privacy policy for this website and related services</h2>
          <q-separator />
          <h6 class="ares__text-red">
            Ghent University, Technologiepark 126, 9052 Gent, Belgium, is the data controller (“we” or “us”) for this
            website. This notice describes how we process your personal data on this website and our related services
            such as event registration.
          </h6>
        </div>
        <div class="col-12 col-md-7">
          <marked-div v-if="privacyPolicyText" :text="privacyPolicyText" />
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

const privacyPolicyText = computed<MarkdownText | null>(
  () => (contentsDict.value['privacy_policy']?.value as MarkdownText) || null,
);

useMeta(() => {
  return {
    title: 'Privacy Policy',
  };
});
</script>
