<template>
  <ares-dialog-content :title="$q.screen.gt.sm ? `${session.code}: ${session.title}` : session.code" hide-drawer>
    <template #tabs>
      <q-tabs v-model="tab" shrink inline-label no-caps>
        <q-tab name="info" label="General information" />
        <q-tab v-if="mainCommittees.length || secondaryCommittees.length" name="committees" label="Committees" />
      </q-tabs>
    </template>
    <template #page>
      <q-tab-panels v-model="tab" class="q-px-sm q-mb-xl">
        <q-tab-panel name="info">
          <div class="row reverse justify-between q-col-gutter-xl">
            <div class="col-12 col-md-5">
              <q-card
                v-if="importantDates.length"
                flat
                bordered
                square
                class="q-pa-sm"
                :class="{ 'q-pa-md': $q.screen.gt.sm }"
              >
                <q-card-section>
                  <h4 class="ares__text-subtitle2">Important dates</h4>
                  <ul class="q-ma-none">
                    <li v-for="(date, idx) in importantDates" :key="idx">
                      <span :class="{ 'text-strike': date.is_past }">{{ date.formatted }}: {{ date.label }}</span>
                    </li>
                  </ul>
                </q-card-section>
              </q-card>
              <div v-if="mainCommittees.length && $q.screen.gt.sm">
                <div v-for="(committee, idx) in mainCommittees" :key="idx" class="q-mt-xl">
                  <h4 class="ares__text-subtitle3">{{ committee.name }}</h4>
                  <q-list>
                    <q-item v-for="(member, idx) in committee.members" :key="idx">
                      <q-item-section avatar>
                        <q-icon :name="iconPerson" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ member.first_name }} {{ member.last_name }}</q-item-label>
                        <q-item-label v-if="member.affiliation" class="text-grey-8 text-body2">{{
                          member.affiliation
                        }}</q-item-label>
                      </q-item-section>
                      <q-item-section v-if="member.email" side>
                        <a :href="`mailto:${member.email}`"><q-icon :name="iconEmail" /></a>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <h6 class="q-mt-none ares__text-red">{{ session.title }}.</h6>
              <marked-div :text="session.description" />
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="committees">
          <div class="row justify-between q-col-gutter-xl">
            <div v-if="mainCommittees.length" class="col-12 col-md-5">
              <div v-for="(committee, idx) in mainCommittees" :key="idx" class="q-mb-xl">
                <h4 class="ares__text-subtitle3">{{ committee.name }}</h4>
                <q-list>
                  <q-item v-for="(member, idx) in committee.members" :key="idx">
                    <q-item-section avatar>
                      <q-icon :name="iconPerson" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ member.first_name }} {{ member.last_name }}</q-item-label>
                      <q-item-label v-if="member.affiliation" class="text-grey-8 text-body2">{{
                        member.affiliation
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section v-if="member.email" side>
                      <a :href="`mailto:${member.email}`"><q-icon :name="iconEmail" /></a>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
            <div v-if="secondaryCommittees.length" class="col-12 col-md-6">
              <div v-for="(committee, idx) in secondaryCommittees" :key="idx" class="q-mb-xl">
                <h4 class="ares__text-subtitle3">{{ committee.name }}</h4>
                <ul>
                  <li v-for="(member, idx) in committee.members" :key="idx">
                    {{ member.first_name }} {{ member.last_name
                    }}<span v-if="member.affiliation" class="text-grey-8 text-body2">, {{ member.affiliation }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </ares-dialog-content>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { formatImportantDate, passedImportantDate } from 'src/evan/utils/dates';

import AresDialogContent from 'src/components/AresDialogContent.vue';

import { iconEmail, iconPerson } from 'src/icons';

const props = defineProps<{
  session: EvanSession;
}>();

const tab = ref<string>('info');

const mainCommittees = computed<Committee[]>(
  () => props.session.extra_data.committees?.filter((c) => c.display === 'full') || [],
);
const secondaryCommittees = computed<Committee[]>(
  () => props.session.extra_data.committees?.filter((c) => c.display === 'list') || [],
);

const importantDates = computed<ImportantDate[]>(() => {
  return (
    props.session.extra_data?.important_dates?.map((d) => ({
      ...d,
      label: d.aoe ? `${d.label} (AoE)` : d.label,
      formatted: formatImportantDate(d),
      is_past: passedImportantDate(d),
    })) || []
  );
});
</script>
