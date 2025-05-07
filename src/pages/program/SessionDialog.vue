<template>
  <ares-dialog-content :title="$q.screen.gt.sm ? titles[0] : titles[1]" hide-drawer>
    <template #tabs>
      <q-tabs v-model="tab" shrink inline-label no-caps>
        <q-tab v-if="hasProgramContent" name="program" label="Program" />
        <q-tab v-if="hasGeneralInfo" name="info" label="General information" />
        <q-tab v-if="hasCommittees" name="committees" label="Committees" />
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
        <q-tab-panel name="program">
          <div class="q-mb-lg">
            <ares-btn
              :icon="favorites.isSessionFavorited(session.id) ? iconStar : iconStarBorder"
              :label="
                $q.screen.gt.sm
                  ? favorites.isSessionFavorited(session.id)
                    ? 'Remove full session'
                    : 'Add full session'
                  : undefined
              "
              outline
              class="q-mt-sm float-right"
              :class="{ 'ares__bg-yellow': favorites.isSessionFavorited(session.id) }"
              @click="toggleSessionFavorite"
            />
            <h6 class="q-mt-none q-mb-md ares__text-red">{{ session.title }}.</h6>
            <div class="text-h6 text-weight-bold">
              {{ formatProgramDate(session.start_at, 'long') }}
              <q-chip v-if="session.start_at" size="md" color="grey-3" class="q-ml-md q-mb-sm">
                {{ formatProgramTime(session.start_at) }} - {{ formatProgramTime(session.end_at) }}
              </q-chip>
            </div>
            <div class="text-body2 text-grey-7">{{ getProgramRoomDisplay(session.room, eventStore.rooms) }}</div>
          </div>
          <div v-if="sessionProgramContent && sessionProgramContent.trim()" class="q-mb-lg">
            <program-marked-div :text="sessionProgramContent" hide-footer />
          </div>
          <div v-if="hasSubsessions" class="q-mb-lg">
            <h5 v-if="sessionProgramContent && sessionProgramContent.trim()" class="q-mt-xl q-mb-md">Time slots</h5>
            <div v-for="(subsession, index) in session.subsessions" :key="subsession.id" class="q-mb-md">
              <q-separator class="q-mt-lg q-mb-md" />
              <ares-btn
                :icon="favorites.isSubsessionFavorited(subsession.id) ? iconStar : iconStarBorder"
                :label="
                  $q.screen.gt.sm
                    ? favorites.isSubsessionFavorited(subsession.id)
                      ? 'Remove time slot'
                      : 'Add time slot'
                    : undefined
                "
                outline
                size="md"
                class="q-mt-sm float-right"
                :class="{ 'ares__bg-yellow': favorites.isSubsessionFavorited(subsession.id) }"
                @click="toggleSubsessionFavorite(subsession.id)"
              />
              <h4 class="ares__text-subtitle3 q-mb-none">
                {{ getSubsessionDisplayTitle(subsession, index, session.code) }}
                <q-chip v-if="subsession.start_at" size="md" color="grey-3" class="q-ml-md q-mb-xs">
                  {{ formatProgramTime(subsession.start_at) }} - {{ formatProgramTime(subsession.end_at) }}
                </q-chip>
              </h4>
              <div v-if="subsessionProgramContent.get(subsession.id)" class="q-pb-xs">
                <program-marked-div :text="subsessionProgramContent.get(subsession.id)" hide-footer />
              </div>
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
import { computed, ref, watchEffect } from 'vue';
import { useQuasar } from 'quasar';

import { formatImportantDate, passedImportantDate } from 'src/evan/utils/dates';
import { useFavorites } from 'src/composables/useFavorites';
import { useProgramTemplate } from 'src/evan/composables/useProgramTemplate';
import { useEventStore } from 'src/evan/stores/event';
import {
  getSessionDisplayTitle,
  getSubsessionDisplayTitle,
  formatProgramDate,
  formatProgramTime,
  getProgramRoomDisplay,
} from 'src/utils/program';

import AresDialogContent from 'src/components/AresDialogContent.vue';
import AresBtn from 'src/components/AresBtn.vue';
import MarkedDiv from 'src/evan/components/MarkedDiv.vue';
import ProgramMarkedDiv from 'src/components/program/ProgramMarkedDiv.vue';

import { iconEmail, iconPerson, iconStar, iconStarBorder } from 'src/icons';

const $q = useQuasar();
const eventStore = useEventStore();
const favorites = useFavorites();
const { renderTemplate } = useProgramTemplate();

const props = defineProps<{
  session: EvanSession;
}>();

// Reactive program content
const sessionProgramContent = ref<string>('');
const subsessionProgramContent = ref<Map<number, string>>(new Map());

watchEffect(async () => {
  if (props.session.program) {
    sessionProgramContent.value = await renderTemplate(props.session.program);
  } else {
    sessionProgramContent.value = '';
  }
});

watchEffect(async () => {
  const contentMap = new Map<number, string>();

  if (props.session.subsessions) {
    for (const subsession of props.session.subsessions) {
      if (subsession.program) {
        contentMap.set(subsession.id, await renderTemplate(subsession.program));
      }
    }
  }

  subsessionProgramContent.value = contentMap;
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
  return props.session.track == 53
    ? [props.session.title, 'Keynote']
    : [getSessionDisplayTitle(props.session), props.session.code || props.session.title];
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
  if (hasProgramContent.value) {
    tab.value = 'program';
  } else if (hasGeneralInfo.value) {
    tab.value = 'info';
  } else if (hasCommittees.value) {
    tab.value = 'committees';
  } else {
    tab.value = 'info';
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

const toggleSessionFavorite = () => {
  favorites.toggleSessionWithSubsessions(props.session);

  const action = favorites.isSessionFavorited(props.session.id) ? 'added to' : 'removed from';
  $q.notify({
    message: `Session ${action} your favorites`,
    color: 'positive',
    position: 'bottom',
    timeout: 1500,
  });
};

const toggleSubsessionFavorite = (subsessionId: number) => {
  favorites.toggleSubsessionWithSync(subsessionId, props.session);

  const action = favorites.isSubsessionFavorited(subsessionId) ? 'added to' : 'removed from';
  $q.notify({
    message: `Time slot ${action} your favorites`,
    color: 'positive',
    position: 'bottom',
    timeout: 1500,
  });
};
</script>
