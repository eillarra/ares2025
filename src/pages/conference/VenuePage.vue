<template>
  <div class="q-mt-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-xl justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Venue and location</h2>
          <q-separator />
        </div>
        <div v-if="mainVenue" class="col-12 col-md-7">
          <marked-div :text="mainVenue.presentation" class="q-mb-lg" />
          <ares-btn
            v-if="mainVenue.gmaps"
            :icon="iconMap"
            label="Show me on map"
            type="a"
            :href="mainVenue.gmaps"
            target="_blank"
            rel="noopener noreferrer"
          />
          <div v-if="howToReachGhent" class="q-mt-xl q-pt-md">
            <h4 class="ares__text-subtitle2">How to reach Ghent</h4>
            <marked-div :text="howToReachGhent" class="q-mb-lg" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="aboutGhentText" class="ares__bg-yellow q-mt-xl">
      <q-separator class="q-ma-none" />
      <div class="container q-py-xl">
        <div class="row q-col-gutter-y-lg q-col-gutter-x-xl justify-between" :class="{ 'q-py-xl': $q.screen.gt.sm }">
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
    <div class="container q-py-xl">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-lg justify-center" :class="{ 'q-py-xl': $q.screen.gt.sm }">
        <div class="col-12 col-md-4" v-for="vId in videoIds" :key="vId">
          <q-video :src="'https://www.youtube.com/embed/' + vId" :ratio="16/9" />
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

import { iconMap } from 'src/icons';

const eventStore = useEventStore();

const { contentsDict, mainVenue } = storeToRefs(eventStore);

const aboutGhentIntroText = computed<MarkdownText | null>(
  () => (contentsDict.value['ghent.intro']?.value as MarkdownText) || null,
);
const aboutGhentText = computed<MarkdownText | null>(
  () => (contentsDict.value['ghent.about']?.value as MarkdownText) || null,
);
const howToReachGhent = computed<MarkdownText | null>(
  () => (contentsDict.value['ghent.how_to_reach']?.value as MarkdownText) || null,
);

const videoIds = [
  'JRd6PVK6E9k',
  'IH0r296JzPc',
  'BWY8vIF5gls',
  'f1evP2DBGB4',
  'Bc39fjh6hnM',
];

useMeta(() => {
  return {
    title: 'Venue',
  };
});
</script>
