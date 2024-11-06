<template>
  <q-layout v-show="_loaded" view="hHh lpr lfr" class="ares__layout">
    <q-header class="ares__header bg-white text-dark">
      <q-toolbar class="ares__toolbar container">
        <router-link :to="{ name: 'home' }">
          <img src="~assets/ares-logo.svg" class="ares__logo" :class="{ 'a-lg': $q.screen.gt.sm }" />
        </router-link>
        <q-space v-if="$q.screen.lt.md" />
        <q-btn-group square flat v-else class="q-ml-xl">
          <q-btn v-for="(item, idx) in menu" :key="idx" no-caps :to="{ name: item[0] }" :label="item[1]" size="lg" />
        </q-btn-group>
        <q-btn
          outline
          round
          v-show="$q.screen.lt.md"
          @click="rightDrawer = !rightDrawer"
          :icon="iconMenu"
          class="q-mr-sm"
        />
      </q-toolbar>
      <q-separator />
    </q-header>

    <q-drawer v-if="!$q.screen.gt.sm" v-model="rightDrawer" :width="280" side="right" class="ares__drawer">
      <q-toolbar class="ares__toolbar">
        <q-space v-if="$q.screen.lt.md" />
        <q-btn
          outline
          round
          v-show="$q.screen.lt.md"
          @click="rightDrawer = !rightDrawer"
          :icon="iconClose"
          class="q-mr-sm"
        />
      </q-toolbar>
      <div class="q-pa-lg">
        <q-list dense class="">
          <q-item
            v-for="(item, idx) in menu"
            :key="idx"
            no-caps
            :to="{ name: item[0] }"
            exact
            active-class="text-weight-bold"
          >
            <q-item-section avatar>
              <q-icon :name="item[2]" />
            </q-item-section>
            <q-item-section>{{ item[1] }}</q-item-section>
          </q-item>
        </q-list>
        <q-separator class="q-mt-lg q-mb-xl" />
        <div class="ares__router-link-menu flex column text-right">
          <router-link v-for="(item, idx) in submenu" :key="idx" :to="{ name: item[0] }">{{ item[1] }}</router-link>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>

    <q-footer class="bg-grey-3 text-grey-9 q-py-xl">
      <div class="container">
        <div class="row q-col-gutter-x-xl q-col-gutter-y-lg justify-between">
          <div class="col-12 col-sm-12 col-md-4">
            <router-link :to="{ name: 'home' }">
              <img src="~assets/ares-logo.svg" class="ares__logo-footer q-mb-lg" />
            </router-link>
            <p class="text-body1 ares__text-red">{{ footerText }}</p>
          </div>
          <div class="col-6 col-sm-3 col-md-2 offset-md-1">
            <div class="ares__router-link-menu flex column">
              <router-link v-for="(item, idx) in menu" :key="idx" :to="{ name: item[0] }">{{ item[1] }}</router-link>
            </div>
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <div class="ares__router-link-menu flex column">
              <router-link v-for="(item, idx) in submenu" :key="idx" :to="{ name: item[0] }">{{ item[1] }}</router-link>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3" :class="{ 'q-mt-lg': $q.screen.lt.md }">
            <div class="row q-col-gutter-xl ares__footer-organizers text-caption q-mb-xl">
              <div class="col">
                Organised by<br />
                <a href="https://www.ugent.be/en" target="_blank" rel="noopener noreferrer">
                  <ugent-logo color="#555" class="q-mt-md" />
                </a>
              </div>
              <div class="col">
                In cooperation with<br />
                <a href="https://www.sba-research.org/" target="_blank" rel="noopener noreferrer">
                  <sba-logo color="#555" class="q-mt-md" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="row q-col-gutter-xl">
          <div class="col-12 col-md-4 text-caption">
            <p class="q-mb-sm">
              <strong><span class="text-helvetica">&copy;</span> 2024 Ghent University</strong>
            </p>
            <span
              >The images on this web site are reproduced with the permission of the copyright owner,
              <a href="https://stad.gent/en">Stad Gent</a>.</span
            >
          </div>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useEventStore } from 'src/evan/stores/event';
import { dateRange } from 'src/evan/utils/dates';

import UgentLogo from 'components/logos/UgentLogo.vue';
import SbaLogo from 'components/logos/SbaLogo.vue';

import { iconClose, iconCommittees, iconMenu, iconVenue } from 'src/icons';

const eventStore = useEventStore();

const { _loaded, event } = storeToRefs(eventStore);

const rightDrawer = ref<boolean>(false);
const menu = [
  ['committees', 'Committees', iconCommittees],
  ['venue', 'Venue and location', iconVenue],
];
const submenu = [
  ['contact', 'Contact'],
  ['codeOfConduct', 'Code of Conduct'],
  ['privacyPolicy', 'Privacy Policy'],
  ['disclaimer', 'Disclaimer'],
];

const footerText = computed<string>(() => {
  if (!event.value) return '';
  const dates = dateRange(event.value.start_date, event.value.end_date);
  return `The ${event.value.full_name} (${event.value.name}), will be held ${dates} in ${event.value.city}, ${event.value.country.name}.`;
});
</script>
