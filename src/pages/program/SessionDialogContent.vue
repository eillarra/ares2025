<template>
  <ares-dialog-content :title="$q.screen.gt.sm ? titles[0] : titles[1]" hide-drawer>
    <template #tabs>
      <q-tabs v-if="!isSpecialSessionType" v-model="tab" shrink inline-label no-caps>
        <q-tab v-if="hasProgramContent" name="program" label="Program" />
        <q-tab v-if="hasGeneralInfo" name="info" label="General information" />
        <q-tab v-if="hasCommittees" name="committees" label="Committees" />
      </q-tabs>
    </template>
    <template #page>
      <!-- Consistent timing info for all session types -->
      <div v-if="session.start_at" class="bg-grey-2 q-py-sm q-px-lg q-mb-lg">
        <div class="row items-center justify-between">
          <div class="col">
            <div class="text-h6 text-weight-bold">
              {{ formatProgramDate(session.start_at, 'short') }}
              <q-chip v-if="session.start_at" size="md" color="grey-4" class="q-ml-sm q-mb-sm">
                {{ formatProgramTime(session.start_at) }} - {{ formatProgramTime(session.end_at) }}
              </q-chip>
            </div>
            <strong class="ares__text-red">Room: {{ getRoomName(eventStore.rooms, session.room) }}</strong>
          </div>
          <div v-if="sessionType !== 'catering'" class="col-auto">
            <favorite-btn type="session" :id="session.id" :hide-label="!$q.screen.gt.sm" size="lg" class="q-ml-md" />
          </div>
        </div>
      </div>

      <!-- Special session types: simplified single view -->
      <div v-if="isSpecialSessionType" class="q-px-lg q-mb-xl">
        <div class="row reverse justify-between q-col-gutter-xl">
          <div class="col-12 col-md-5">
            <!-- Location info prominently displayed for social events and catering -->
            <q-card
              v-if="session.room && getVenueAndRoomInfo"
              flat
              bordered
              square
              class="q-pa-sm q-mb-lg"
              :class="{ 'q-pa-md': $q.screen.gt.sm }"
            >
              <q-card-section>
                <h4 class="ares__text-subtitle2">Location</h4>
                <div v-if="getVenueAndRoomInfo.venue" class="q-mb-sm">
                  <div class="text-body1 text-weight-medium">Venue: {{ getVenueAndRoomInfo.venue.name }}</div>
                  <div class="text-h6">Location: {{ getVenueAndRoomInfo.room.name }}</div>
                </div>
                <div v-else class="text-h6">{{ getVenueAndRoomInfo.room.name }}</div>
                <div v-if="getVenueAndRoomInfo.venueDescription" class="text-body2 q-mt-md">
                  <marked-div :text="getVenueAndRoomInfo.venueDescription" />
                </div>
              </q-card-section>
            </q-card>

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
            <!-- Location info for mobile/smaller screens -->
            <div v-if="session.room && getVenueAndRoomInfo && !$q.screen.gt.sm" class="q-mb-md">
              <div v-if="getVenueAndRoomInfo.venue">
                <div class="text-body1 text-weight-medium">Venue: {{ getVenueAndRoomInfo.venue.name }}</div>
                <div class="text-h6 text-weight-bold">Location: {{ getVenueAndRoomInfo.room.name }}</div>
              </div>
              <div v-else class="text-h6 text-weight-bold">{{ getVenueAndRoomInfo.room.name }}</div>
              <div v-if="getVenueAndRoomInfo.venueDescription" class="text-body2 q-mt-sm">
                <marked-div :text="getVenueAndRoomInfo.venueDescription" />
              </div>
            </div>

            <marked-div :text="session.description" />
          </div>
        </div>
      </div>

      <!-- Regular sessions: tabbed view -->
      <q-tab-panels v-else v-model="tab" class="q-px-sm q-mb-xl">
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
        <q-tab-panel name="program">
          <div v-if="sessionProgramContent && sessionProgramContent.trim()" class="q-my-lg">
            <program-marked-div :text="sessionProgramContent" hide-favorite-btn />
          </div>
          <div v-if="hasSubsessions">
            <h5 v-if="sessionProgramContent && sessionProgramContent.trim()" class="q-mt-xl q-mb-md">Time slots</h5>
            <div v-for="(subsession, index) in session.subsessions" :key="subsession.id">
              <q-separator v-if="index > 0" class="q-mt-lg q-mb-md" />
              <favorite-btn
                type="subsession"
                :id="subsession.id"
                :hide-label="!$q.screen.gt.sm"
                class="q-mt-sm float-right"
              />
              <h4 class="ares__text-subtitle3 q-mb-none">
                {{ getSubsessionDisplayTitle(subsession, index, session.code) }}
                <q-chip v-if="subsession.start_at" size="md" color="grey-3" class="q-ml-sm">
                  {{ formatProgramTime(subsession.start_at) }} - {{ formatProgramTime(subsession.end_at) }}
                </q-chip>
              </h4>
              <program-marked-div
                v-if="subsessionProgramContent.get(subsession.id)"
                :text="subsessionProgramContent.get(subsession.id)"
                hide-favorite-btn
                class="q-py-md"
              />
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
// Types are now globally available - no import needed!

import { computed, ref, watchEffect } from 'vue';
import { useQuasar } from 'quasar';

import { formatImportantDate, passedImportantDate } from '@evan/utils/dates';
import { useProgramTemplate } from '@evan/composables/useProgramTemplate';
import { useEventStore } from '@evan/stores/event';
import {
  getSessionDisplayTitle,
  getSubsessionDisplayTitle,
  formatProgramDate,
  formatProgramTime,
  getRoomName,
} from '@/utils/program';

import AresDialogContent from '@/components/AresDialogContent.vue';
import FavoriteBtn from '@/components/program/FavoriteBtn.vue';
import MarkedDiv from '@evan/components/MarkedDiv.vue';
import ProgramMarkedDiv from '@/components/program/ProgramMarkedDiv.vue';

import { iconEmail, iconPerson } from '@/icons';

const $q = useQuasar();
const eventStore = useEventStore();
const { renderTemplate } = useProgramTemplate();

const props = defineProps<{
  session: EvanSession;
}>();

// Reactive program content
const sessionProgramContent = ref<string>('');
const subsessionProgramContent = ref<Map<number, string>>(new Map());

watchEffect(() => {
  if (props.session.program && eventStore.programDataLoaded) {
    renderTemplate(props.session.program)
      .then((content) => {
        sessionProgramContent.value = content;
      })
      .catch((err) => {
        console.error('Failed to render session template:', err);
        sessionProgramContent.value = '';
      });
  } else {
    sessionProgramContent.value = '';
  }
});

watchEffect(() => {
  const contentMap = new Map<number, string>();

  if (props.session.subsessions && eventStore.programDataLoaded) {
    const promises = props.session.subsessions.map(async (subsession) => {
      if (subsession.program) {
        try {
          const content = await renderTemplate(subsession.program);
          contentMap.set(subsession.id, content);
        } catch (err) {
          console.error(`Failed to render subsession ${subsession.id} template:`, err);
        }
      }
    });

    Promise.all(promises)
      .then(() => {
        subsessionProgramContent.value = contentMap;
      })
      .catch((err) => {
        console.error('Error rendering subsession templates:', err);
      });
  } else {
    subsessionProgramContent.value = contentMap;
  }
});

const sessionType = computed<'regular' | 'social' | 'catering'>(() => {
  if (!props.session) return 'regular';

  if (props.session.is_social_event) return 'social';

  if (props.session.track && eventStore.event?.tracks) {
    const track = eventStore.event.tracks.find((t) => t.id === props.session.track);
    if (track && track.name.toLowerCase().includes('catering')) {
      return 'catering';
    }
  }

  return 'regular';
});

const isSpecialSessionType = computed(() => {
  return sessionType.value === 'social' || sessionType.value === 'catering';
});

const hasSubsessions = computed(() => {
  return props.session.subsessions && props.session.subsessions.length > 0;
});

const hasProgramContent = computed(() => {
  if (!props.session) return false;

  const hasSubsessions = props.session.subsessions && props.session.subsessions.length > 0;
  const hasProgram = props.session.program && props.session.program.trim() !== '';

  return hasSubsessions || hasProgram;
});

const hasGeneralInfo = computed(() => {
  if (!props.session) return false;
  return props.session.description && props.session.description.trim() !== '';
});

const titles = computed<[string, string]>(() => {
  const tracks = eventStore.event?.tracks || [];
  return props.session.track == 53
    ? [props.session.title, 'Keynote']
    : [getSessionDisplayTitle(props.session, tracks), props.session.code || props.session.title];
});

// Helper functions for venue and room information
const getVenueAndRoomInfo = computed(() => {
  if (!props.session.room || !eventStore.event?.venues) return null;

  // Find the room in the flattened rooms array from eventStore
  const room = eventStore.rooms.find((r) => r.id === props.session.room);
  if (!room) return null;

  // Find the venue that contains this room
  const venue = eventStore.event.venues.find((v) => v.rooms.some((vr) => vr.id === props.session.room));

  return {
    room,
    venue,
    venueDescription: venue?.presentation && venue.presentation.trim() ? venue.presentation : null,
  };
});

const mainCommittees = computed<Committee[]>(
  () => props.session.extra_data.committees?.filter((c) => c.display === 'full') || [],
);

const secondaryCommittees = computed<Committee[]>(
  () => props.session.extra_data.committees?.filter((c) => c.display === 'list') || [],
);

const hasCommittees = computed(() => {
  return mainCommittees.value.length > 0 || secondaryCommittees.value.length > 0;
});

const tab = ref<string>('');

watchEffect(() => {
  // Special session types don't use tabs, so only set tab for regular sessions
  if (!isSpecialSessionType.value) {
    if (hasProgramContent.value) {
      tab.value = 'program';
    } else if (hasGeneralInfo.value) {
      tab.value = 'info';
    } else if (hasCommittees.value) {
      tab.value = 'committees';
    } else {
      tab.value = 'info';
    }
  }
});

const importantDates = computed<ImportantDate[]>(() => {
  return (
    props.session.extra_data?.important_dates?.map((d) => ({
      ...d,
      label: d.aoe ? `${d.label} (AoE)` : d.label,
      formatted: formatImportantDate(d, d.aoe),
      is_past: passedImportantDate(d),
    })) || []
  );
});
</script>
