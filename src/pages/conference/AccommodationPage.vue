<template>
  <div class="q-mt-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Accommodation</h2>
          <q-separator />
        </div>
        <div class="col-12 col-md-7">
          <marked-div :text="accommodationText" class="q-mb-lg" />
        </div>
      </div>
      <div v-if="gmapsEmbedUrl" class="q-my-xl">
        <q-video :src="gmapsEmbedUrl" :ratio="$q.screen.gt.sm ? 2 : 1" />
      </div>
    </div>
    <div v-if="aboutGhentText" class="ares__bg-yellow q-mt-xl">
      <q-separator class="q-ma-none" />
      <div class="container q-py-xl">
        <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between" :class="{ 'q-py-xl': $q.screen.gt.sm }">
          <div class="col-12 col-md-4">
            <h3 class="ares__text-title">About Ghent</h3>
            <q-separator />
            <marked-div v-if="aboutGhentIntroText" :text="aboutGhentIntroText" class="ares__text-red q-mt-xl" />
          </div>
          <div class="col-12 col-md-7">
            <marked-div :text="aboutGhentText" />
          </div>
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

const accommodationText = computed<MarkdownText | null>(() => contentsDict.value['accommodation']?.value || null);
const aboutGhentIntroText = computed<MarkdownText | null>(() => contentsDict.value['ghent.intro']?.value || null);
const aboutGhentText = computed<MarkdownText | null>(() => contentsDict.value['ghent.about']?.value || null);

const gmapsEmbedUrl = computed<Url | null>(() => contentsDict.value['accommodation.gmaps_embed_url']?.value || null);

useMeta(() => {
  return {
    title: 'Accommodation',
  };
});
</script>
