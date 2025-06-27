<template>
  <div>
    <div class="container">
      <p class="ares__text-red text-mono text-body2 q-mt-xs q-pt-md">{{ ghent }}</p>
      <q-separator class="q-ma-none" />
      <div class="row q-col-gutter-y-lg">
        <div class="col-12 col-md-6 q-pt-xl" :class="{ 'ares__border-right q-pr-xl ': $q.screen.gt.sm }">
          <div :class="{ 'q-pr-xl ': $q.screen.gt.sm }">
            <h3 class="ares__text-headline">{{ event?.full_name }}</h3>
            <p>{{ focusesText }}</p>
            <p>
              Co-located Conference
              <router-link :to="{ name: 'session', params: { sessionSlug: 'ics-csr' } }">ICS-CSR</router-link>.
            </p>
            <div v-if="importantDates.length" class="q-my-xl">
              <h5><strong>Important dates</strong></h5>
              <ul>
                <li v-for="(date, idx) in importantDates" :key="idx">
                  <span :class="{ 'text-strike': date.is_past }">{{ date.formatted }}: {{ date.label }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-img src="~assets/photos/stadshal.jpg" :ratio="$q.screen.gt.xs ? 0.5 : 1.35" />
        </div>
        <div class="col-12 col-sm col-md" :class="{ 'ares__border-left q-pl-xl': $q.screen.gt.xs }">
          <p class="ares__text-red" :class="{ 'q-mt-xl': $q.screen.gt.sm }">{{ welcomeText }}</p>
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
    <div v-if="aboutAresText" class="ares__bg-yellow q-mt-xl">
      <q-separator class="q-ma-none" />
      <div class="container q-py-xl">
        <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between" :class="{ 'q-py-xl': $q.screen.gt.sm }">
          <div class="col-12 col-md-4">
            <h3 class="ares__text-title">About ARES</h3>
            <q-separator />
            <marked-div v-if="aboutAresIntroText" :text="aboutAresIntroText" class="ares__text-red q-mt-xl" />
          </div>
          <div class="col-12 col-md-7">
            <marked-div :text="aboutAresText" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useEventStore } from '@evan/stores/event';
import { dateRange, formatImportantDate, passedImportantDate } from '@evan/utils/dates';

import { iconVenue } from '@/icons';

const eventStore = useEventStore();

const { contentsDict, event } = storeToRefs(eventStore);

const ghent = computed<string>(() => {
  if (!event.value) return '';
  return `${event.value.city}, ${event.value.country.name}, ${dateRange(event.value.start_date, event.value.end_date)}`;
});

const focusesText = computed<string | null>(() => (contentsDict.value['home.ares_focuses']?.value as string) || null);
const welcomeText = computed<string | null>(() => (contentsDict.value['home.welcome']?.value as string) || null);
const aboutAresIntroText = computed<MarkdownText | null>(
  () => (contentsDict.value['ares.intro']?.value as MarkdownText) || null,
);
const aboutAresText = computed<MarkdownText | null>(
  () => (contentsDict.value['ares.about']?.value as MarkdownText) || null,
);
const importantDates = computed<ImportantDate[]>(() => {
  if (!event.value) return [];
  return event.value.extra_data.important_dates.map((d) => ({
    ...d,
    label: d.aoe ? `${d.label} (AoE)` : d.label,
    formatted: formatImportantDate(d, d.aoe),
    is_past: passedImportantDate(d),
  }));
});
</script>
