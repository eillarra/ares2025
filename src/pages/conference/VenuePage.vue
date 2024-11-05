<template>
  <div class="q-my-xl q-pb-xl">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useMeta } from 'quasar';

import { useEventStore } from 'src/evan/stores/event';

import { iconMap } from 'src/icons';

const eventStore = useEventStore();

const { mainVenue } = storeToRefs(eventStore);

useMeta(() => {
  return {
    title: 'Venue',
  };
});
</script>
