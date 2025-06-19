<template>
  <q-btn
    :label="inline ? undefined : buttonLabel"
    :icon="buttonIcon"
    :color="buttonColor"
    :size="inline ? '8px' : buttonSize"
    :flat="buttonFlat"
    :outline="buttonOutline"
    :dense="buttonDense"
    :round="inline"
    :class="{ 'flex-inline': inline }"
    @click="openDialog"
  />
  <q-dialog v-model="dialogOpen" square position="bottom" class="ares__dialog">
    <ares-dialog-content title="Paper details" hide-drawer compact>
      <template #tabs>
        <h6 class="q-mt-none q-mb-md ares__text-red">{{ paper.title }}</h6>
      </template>
      <template #page>
        <div class="q-px-lg q-mb-xl">
          <div v-if="authorsDisplay" class="q-mb-md">
            <div class="text-subtitle2 text-grey-7 q-mb-xs">Authors</div>
            <p>
              <em>{{ authorsDisplay }}</em>
            </p>
          </div>
          <div v-if="paper.doi" class="q-mb-md">
            <div class="text-subtitle2 text-grey-7 q-mb-xs">DOI</div>
            <q-btn
              :label="paper.doi"
              :href="`https://doi.org/${paper.doi}`"
              target="_blank"
              color="primary"
              flat
              dense
              no-caps
              :icon="iconOpenInNew"
              class="q-pl-none"
            />
          </div>
          <div v-if="sessionDisplay || subsessionDisplay" class="q-mb-lg">
            <div class="text-subtitle2 text-grey-7 q-mb-sm">Presentation schedule</div>
            <div v-if="!hideFavoriteBtn" class="float-right q-ml-xl">
              <favorite-btn v-if="subsessionDisplay" type="subsession" :id="paper.subsession" />
              <favorite-btn v-else-if="sessionDisplay" type="session" :id="paper.session" />
            </div>
            <div v-if="subsessionDisplay">
              <strong>Session:</strong> {{ subsessionDisplay.title }}<br />
              <span v-if="subsessionDisplay.timeInfo"><strong>Time:</strong> {{ subsessionDisplay.timeInfo }}</span
              ><br />
              <span v-if="subsessionDisplay.roomInfo"><strong>Room:</strong> {{ subsessionDisplay.roomInfo }}</span>
            </div>
            <p v-else-if="sessionDisplay">
              <strong>Session:</strong> {{ sessionDisplay.title }}<br />
              <span v-if="sessionDisplay.timeInfo"><strong>Time:</strong> {{ sessionDisplay.timeInfo }}</span
              ><br />
              <span v-if="sessionDisplay.roomInfo"><strong>Room:</strong> {{ sessionDisplay.roomInfo }}</span>
            </p>
          </div>
          <div v-if="paper.abstract" class="q-mb-md">
            <div class="text-subtitle2 text-grey-7 q-mb-xs">Abstract</div>
            <marked-div :text="paper.abstract" />
          </div>
        </div>
      </template>
    </ares-dialog-content>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { useEventStore } from 'src/evan/stores/event';
import {
  getSubsessionDisplayTitle,
  formatProgramDate,
  formatProgramTime,
  getProgramRoomDisplay,
} from 'src/utils/program';

import AresDialogContent from 'src/components/AresDialogContent.vue';
import FavoriteBtn from 'src/components/program/FavoriteBtn.vue';
import MarkedDiv from 'src/evan/components/MarkedDiv.vue';

import { iconCalendar, iconOpenInNew } from 'src/icons';

const props = withDefaults(
  defineProps<{
    paper: EvanPaper;
    buttonLabel?: string;
    buttonIcon?: string;
    buttonColor?: string;
    buttonSize?: string;
    buttonFlat?: boolean;
    buttonOutline?: boolean;
    buttonDense?: boolean;
    inline?: boolean;
    hideFavoriteBtn?: boolean;
  }>(),
  {
    buttonLabel: 'More info',
    buttonIcon: iconCalendar,
    buttonColor: 'primary',
    buttonSize: 'sm',
    buttonFlat: true,
    buttonOutline: false,
    buttonDense: true,
    inline: false,
    hideFavoriteBtn: false,
  },
);

const eventStore = useEventStore();

const dialogOpen = ref(false);

const openDialog = () => {
  dialogOpen.value = true;
};

const authorsDisplay = computed(() => {
  if (props.paper.extra_data?.authors_str) {
    return props.paper.extra_data.authors_str;
  }
  if (props.paper.extra_data?.authors && props.paper.extra_data.authors.length > 0) {
    return props.paper.extra_data.authors.map((author) => author.name).join(', ');
  }
  return null;
});

const sessionDisplay = computed(() => {
  if (!props.paper.session) return null;
  const session = eventStore.sessions.find((s) => s.id === props.paper.session);
  if (!session) return null;

  return {
    title: `${session.code ? session.code + ': ' : ''}${session.title}`,
    timeInfo:
      session.start_at && session.end_at
        ? `${formatProgramDate(session.start_at)}, ${formatProgramTime(session.start_at)} - ${formatProgramTime(session.end_at)}`
        : null,
    roomInfo: getProgramRoomDisplay(session.room, eventStore.rooms),
  };
});

const subsessionDisplay = computed(() => {
  if (!props.paper.subsession) return null;
  const session = eventStore.sessions.find((s) => s.id === props.paper.session);
  if (!session?.subsessions) return null;
  const subsession = session.subsessions.find((sub) => sub.id === props.paper.subsession);
  if (!subsession) return null;

  // Find the index of this subsession to generate the proper title
  const subsessionIndex = session.subsessions.findIndex((sub) => sub.id === props.paper.subsession);
  const displayTitle = getSubsessionDisplayTitle(subsession, subsessionIndex, session.code);

  return {
    title: displayTitle,
    timeInfo:
      subsession.start_at && subsession.end_at
        ? `${formatProgramDate(subsession.start_at)}, ${formatProgramTime(subsession.start_at)} - ${formatProgramTime(subsession.end_at)}`
        : null,
    roomInfo: getProgramRoomDisplay(session.room, eventStore.rooms),
  };
});
</script>

<style scoped>
.inline-paper-btn {
  margin-left: 4px;
  vertical-align: middle;
}
</style>
