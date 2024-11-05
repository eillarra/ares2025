<template>
  <div>
    <div class="container">
      <p class="ares__text-red text-mono text-caption q-pt-md">Ghent, Belgium, August 11-14, 2025</p>
      <q-separator class="q-ma-none" />
      <div class="row q-col-gutter-y-lg">
        <div class="col-12 col-md-6 q-pt-xl" :class="{ 'ares__border-right q-pr-xl ': $q.screen.gt.sm }">
          <div :class="{ 'q-pr-xl ': $q.screen.gt.sm }">
            <h3 class="text-mono" :class="{ 'text-h4': $q.screen.lt.md }">
              The International Conference on Availability, Reliability and Security
            </h3>
            <p>
              focuses since 2006 on rigorous and novel research in the field of dependability, computer and information
              security. In cooperation with the conference several workshops are held covering a huge variety of
              security topics.
            </p>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-img src="~assets/photos/stadshal.jpg" :ratio="$q.screen.gt.xs ? 0.7 : 1.35" />
        </div>
        <div class="col-12 col-sm col-md" :class="{ 'ares__border-left q-pl-xl': $q.screen.gt.xs }">
          <p class="ares__text-red" :class="{ 'q-mt-xl': $q.screen.gt.sm }">
            {{ welcomeText }}
          </p>
          <ares-btn
            :icon="iconVenue"
            label="More information"
            type="router-link"
            :to="{ name: 'venue' }"
            class="q-mt-lg q-mb-xl"
          />
        </div>
      </div>
    </div>
    <div v-if="aboutAresText" class="ares__bg_yellow">
      <q-separator class="q-ma-none" />
      <div class="container q-py-xl">
        <div class="row q-col-gutter-y-lg q-col-gutter-x-xl justify-between" :class="{ 'q-py-xl': $q.screen.gt.sm }">
          <div class="col-12 col-md-4">
            <h3 class="text-mono q-mt-none">About ARES</h3>
            <q-separator />
            <marked-div v-if="aboutAresIntroText" :text="aboutAresIntroText" class="ares__text-red q-mt-xl" />
          </div>
          <div class="col-12 col-md-7">
            <marked-div :text="aboutAresText" class="text-body2" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useEventStore } from 'src/evan/stores/event';

import MarkedDiv from 'components/MarkedDiv.vue';

import { iconVenue } from 'src/icons';

const eventStore = useEventStore();

const { contentsDict } = storeToRefs(eventStore);

const welcomeText = computed<string | null>(() => (contentsDict.value['home.welcome']?.value as string) || null);
const aboutAresIntroText = computed<MarkdownText | null>(
  () => (contentsDict.value['ares.intro']?.value as MarkdownText) || null,
);
const aboutAresText = computed<MarkdownText | null>(
  () => (contentsDict.value['ares.about']?.value as MarkdownText) || null,
);
</script>
