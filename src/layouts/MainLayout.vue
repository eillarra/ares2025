<template>
  <q-layout v-show="_loaded" view="hHh lpr lfr" class="ares__layout">
    <q-header class="ares__header bg-white text-dark">
      <q-toolbar class="ares__toolbar container">
        <router-link :to="{ name: 'home' }">
          <img src="~assets/ares-logo.svg" class="ares__logo" :class="{ 'a-lg': $q.screen.gt.md }" />
        </router-link>
        <q-space />
        <q-btn-group square flat v-if="$q.screen.gt.sm" class="q-ml-xl">
          <template v-for="(item, idx) in menu" :key="idx">
            <q-btn v-if="!item.children" no-caps :to="{ name: item.route }" size="lg">
              <apan
                >{{ item.label
                }}<q-chip v-if="item.closed" color="grey-4" size="sm" class="q-ml-sm q-mb-xs text-dark"
                  >CLOSED</q-chip
                ></apan
              >
            </q-btn>
            <q-btn v-else no-caps size="lg" :menu="true" :items="item.children">
              <apan
                >{{ item.label
                }}<q-chip v-if="item.closed" color="grey-4" size="sm" class="q-ml-sm q-mb-xs text-dark"
                  >CLOSED</q-chip
                ></apan
              >
              <q-menu class="ares__bg-yellow">
                <q-list style="min-width: 150px">
                  <q-item
                    v-for="(child, idx) in item.children"
                    :key="idx"
                    no-caps
                    :to="{ name: child.route }"
                    exact
                    active-class="text-weight-bold"
                  >
                    <q-item-section>{{ child.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </template>
        </q-btn-group>
        <q-space />
        <ares-btn
          :icon="iconRegister"
          label="Register"
          type="router-link"
          :to="{ name: 'registration' }"
          class="q-ml-xl"
        />
        <q-btn
          outline
          round
          v-show="$q.screen.lt.md"
          @click="rightDrawer = !rightDrawer"
          :icon="iconMenu"
          class="q-mx-sm"
        />
      </q-toolbar>
      <q-separator />
    </q-header>

    <q-drawer v-if="!$q.screen.gt.md" v-model="rightDrawer" :width="280" side="right" class="ares__drawer">
      <q-toolbar class="ares__toolbar">
        <div class="q-pl-sm q-pt-sm"><img src="~assets/ares-icon.svg" class="ares__logo-footer q-ml-xs" /></div>
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
        <q-list dense>
          <template v-for="(item, idx) in menu" :key="idx">
            <q-item v-if="!item.children" no-caps :to="{ name: item.route }" exact active-class="text-weight-bold">
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section
                >{{ item.label
                }}<q-chip v-if="item.closed" color="grey-4" size="sm" class="q-ml-sm q-mb-xs text-dark"
                  >CLOSED</q-chip
                ></q-item-section
              >
            </q-item>
            <q-item v-else no-caps>
              <q-item-section avatar top>
                <q-icon :name="item.icon" class="q-mt-xs" />
              </q-item-section>
              <q-item-section>
                <span
                  >{{ item.label
                  }}<q-chip v-if="item.closed" color="grey-4" size="sm" class="q-ml-sm q-mb-xs text-dark"
                    >CLOSED</q-chip
                  ></span
                >
                <ul class="q-pl-none ares__router-link-menu">
                  <li v-for="(child, idx) in item.children" :key="idx">
                    <router-link :to="{ name: child.route }" class="inherit">{{ child.label }}</router-link>
                  </li>
                </ul></q-item-section
              >
            </q-item>
          </template>
        </q-list>
        <q-separator class="q-mt-lg q-mb-xl" />
        <div class="ares__router-link-menu flex column text-right">
          <router-link v-for="(item, idx) in submenu" :key="idx" :to="{ name: item.route }">{{
            item.label
          }}</router-link>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="bg-white">
      <q-page>
        <router-view />
        <div class="bg-grey-3 text-grey-9 q-py-xl">
          <div class="container">
            <div class="row q-col-gutter-x-md q-col-gutter-y-lg justify-between">
              <div class="col-12 col-sm-12 col-md-4">
                <div class="q-gutter-x-lg flex items-center">
                  <router-link :to="{ name: 'home' }" class="q-pt-xs">
                    <img src="~assets/ares-icon.svg" class="ares__logo-footer" />
                  </router-link>
                  <a
                    :href="submissionsUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="EasyChair"
                    aria-label="EasyChair"
                  >
                    <q-icon :name="iconEasyChair" size="sm" />
                  </a>
                  <a
                    href="https://x.com/ARES_Conference"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="X / Twitter"
                    aria-label="X / Twitter"
                  >
                    <q-icon :name="iconX" size="sm" />
                  </a>
                </div>
                <p class="text-body1 ares__text-red q-mt-lg">{{ footerText }}</p>
              </div>
              <div class="col-12 col-sm-6 col-md-4 offset-md-1">
                <div class="ares__router-link-menu flex column">
                  <template v-for="(item, idx) in menu" :key="idx">
                    <router-link v-if="!item.children" :to="{ name: item.route }">{{ item.label }}</router-link>
                    <div v-else>
                      <span class="text-grey-7">{{ item.label }}</span>
                      <ul class="q-pl-lg">
                        <li v-for="(child, idx) in item.children" :key="idx">
                          <router-link :to="{ name: child.route }">{{ child.label }}</router-link>
                        </li>
                      </ul>
                    </div>
                  </template>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="ares__router-link-menu flex column">
                  <a href="https://www.ares-conference.eu/archive" target="_blank">Archive</a>
                  <router-link v-for="(item, idx) in submenu" :key="idx" :to="{ name: item.route }">{{
                    item.label
                  }}</router-link>
                </div>
              </div>
            </div>
            <div class="row q-col-gutter-x-md q-pt-xl">
              <div class="col-12 col-md-4 text-caption">
                <p class="q-mb-sm">
                  <strong><span class="text-helvetica">&copy;</span> 2024 Ghent University</strong>
                </p>
                <span
                  >The images on this web site are reproduced with the permission of the copyright owner,
                  <a href="https://stad.gent/en">Stad Gent</a>.</span
                >
              </div>
              <div class="col-12 col-md-6 offset-md-1" :class="{ 'q-mt-lg': $q.screen.lt.sm }">
                <div class="row q-col-gutter-md ares__footer-organizers text-caption q-mb-xl">
                  <div class="col">
                    Organised by<br />
                    <a href="https://www.ugent.be/en" target="_blank" rel="noopener noreferrer">
                      <ugent-logo color="#555" class="q-mt-md" />
                    </a>
                  </div>
                  <div class="col col-md-4">
                    In cooperation with<br />
                    <a href="https://www.sba-research.org/" target="_blank" rel="noopener noreferrer">
                      <sba-logo color="#555" class="q-mt-md" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useEventStore } from 'src/evan/stores/event';
import { dateRange } from 'src/evan/utils/dates';

import UgentLogo from 'components/logos/UgentLogo.vue';
import SbaLogo from 'components/logos/SbaLogo.vue';

import {
  iconAccommodation,
  iconClose,
  iconCommittees,
  iconEasyChair,
  iconMenu,
  iconProgram,
  iconRegister,
  iconSend,
  iconVenue,
  iconX,
} from 'src/icons';

const eventStore = useEventStore();

const { _loaded, event, contentsDict } = storeToRefs(eventStore);

const rightDrawer = ref<boolean>(false);
const menu: MenuItem[] = [
  { route: 'program', label: 'Program', icon: iconProgram },
  { route: 'venue', label: 'Venue and location', icon: iconVenue },
  { route: 'accommodation', label: 'Accommodation', icon: iconAccommodation },
  {
    route: 'committees',
    label: 'Committees',
    icon: iconCommittees,
    children: [
      { route: 'committees', label: 'Organizing Committees & Chairs' },
      { route: 'programCommittee', label: 'Program Committee' },
    ],
  },
  {
    route: 'callForPapers',
    label: 'Calls',
    icon: iconSend,
    children: [
      { route: 'callForWorkshopPapers', label: 'Call for Workshop Papers' },
      { route: 'callForPapers', label: 'Call for Papers' },
      { route: 'callForEUWorkshops', label: 'Call for EU Workshops' },
      { route: 'callForWorkshops', label: 'Call for Workshops' },
    ],
    closed: true,
  },
];
const submenu: MenuItem[] = [
  { route: 'contact', label: 'Contact' },
  { route: 'codeOfConduct', label: 'Code of Conduct' },
  { route: 'privacyPolicy', label: 'Privacy Policy' },
  { route: 'disclaimer', label: 'Disclaimer' },
];

const footerText = computed<string>(() => {
  if (!event.value) return '';
  const dates = dateRange(event.value.start_date, event.value.end_date);
  return `The ${event.value.full_name} (${event.value.name}), will be held ${dates} in ${event.value.city}, ${event.value.country.name}.`;
});

const submissionsUrl = computed<Url | null>(() => (contentsDict.value['call_for_papers.url']?.value as string) || null);
</script>
