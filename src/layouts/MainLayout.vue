<template>
  <q-layout view="hHh LpR lff" class="ares__layout">
    <q-dialog v-model="visibleDialogMenu" position="top" full-width full-height>
      <q-card>
        <q-card-section>
          <q-btn unelevated round icon="close" color="white" text-color="dark" v-close-popup />
          <div class="q-gutter-y-md text-center q-pt-none q-pb-xl">
            <router-link :to="{ name: 'home' }">
              <img src="~assets/ares-logo.svg" class="ares__logo" />
            </router-link>
            <p v-for="(item, idx) in menu" :key="idx" class="text-h4 text-grey-8 text-weight-light">
              <router-link :to="{ name: item[1] }" class="text-body1 text-inherit">{{ item[0] }}</router-link>
            </p>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-header bordered class="ares__header bg-white text-dark">
      <q-toolbar class="ares__toolbar container">
        <q-btn
          flat
          round
          v-show="$q.screen.lt.md"
          @click="visibleDialogMenu = !visibleDialogMenu"
          icon="menu"
          class="q-mr-sm"
        ></q-btn>
        <q-space v-if="$q.screen.lt.md" />
        <router-link :to="{ name: 'home' }">
          <img src="~assets/ares-logo.svg" class="ares__logo q-my-xl" />
        </router-link>
        <q-btn-group square flat v-if="$q.screen.gt.sm" class="q-ml-xl">
          <q-btn v-for="(item, idx) in menu" :key="idx" no-caps :to="{ name: item[1] }" :label="item[0]" size="lg" />
        </q-btn-group>
      </q-toolbar>
    </q-header>

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
            <p class="text-body1 ares__text-red">
              The 20th International Conference on Availability, Reliability and Security (ARES 2025), will be held in
              2025 in Ghent, Belgium.
              <!-- TODO: use event dates from Evan once confirmed -->
            </p>
          </div>
          <div class="col-12 col-sm-3 col-md-4 offset-md-1">
            <div class="ares__footer-menu flex column">
              <router-link :to="{ name: 'venue' }">Venue and location</router-link>
              <router-link :to="{ name: 'contact' }" class="q-mt-md">Contact</router-link>
              <router-link :to="{ name: 'codeOfConduct' }">Code of Conduct</router-link>
              <router-link :to="{ name: 'privacyPolicy' }">Privacy Policy</router-link>
              <router-link :to="{ name: 'imprint' }">Imprint</router-link>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
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
import { ref } from 'vue';

import UgentLogo from 'src/components/logos/UgentLogo.vue';
import SbaLogo from 'src/components/logos/SbaLogo.vue';

const visibleDialogMenu = ref(false);
const menu = [['Venue and location', 'venue']];
</script>
