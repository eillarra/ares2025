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
    <ares-dialog-content title="Keynote details" hide-drawer compact>
      <template #tabs>
        <h6 class="q-mt-none q-mb-md ares__text-red">{{ keynote.title }}</h6>
      </template>
      <template #page>
        <div class="q-px-lg q-mb-xl">
          <div v-if="keynote.speaker" class="q-mb-md">
            <div class="text-subtitle2 text-grey-7 q-mb-xs">Speaker</div>
            <ares-btn
              v-if="keynote.extra_data?.speaker_website"
              :href="keynote.extra_data.speaker_website"
              target="_blank"
              :icon="iconOpenInNew"
              label="Visit website"
              size="md"
              class="float-right q-ml-xl"
            />
            <p>
              <strong>{{ keynote.speaker }}</strong>
              <span v-if="keynote.extra_data?.speaker_affiliation" class="text-grey-8">
                <br />{{ keynote.extra_data.speaker_affiliation }}
              </span>
            </p>
          </div>
          <div v-if="sessionDisplay || subsessionDisplay" class="q-mb-lg">
            <div class="text-subtitle2 text-grey-7 q-mb-sm">Presentation schedule</div>
            <div v-if="!hideFavoriteBtn" class="float-right q-ml-xl">
              <favorite-btn v-if="subsessionDisplay" type="subsession" :id="keynote.subsession" />
              <favorite-btn v-else-if="sessionDisplay" type="session" :id="keynote.session" />
            </div>
            <div v-if="subsessionDisplay">
              <strong>Session:</strong> {{ subsessionDisplay.title }}<br />
              <span v-if="subsessionDisplay.timeInfo"><strong>Time:</strong> {{ subsessionDisplay.timeInfo }}</span
              ><br />
              <span v-if="subsessionDisplay.roomInfo"><strong>Room:</strong> {{ subsessionDisplay.roomInfo }}</span>
            </div>
            <div v-else-if="sessionDisplay">
              <strong>Session:</strong> {{ sessionDisplay.title }}<br />
              <span v-if="sessionDisplay.timeInfo"><strong>Time:</strong> {{ sessionDisplay.timeInfo }}</span
              ><br />
              <span v-if="sessionDisplay.roomInfo"><strong>Room:</strong> {{ sessionDisplay.roomInfo }}</span>
            </div>
          </div>
          <div v-else-if="keynote.session" class="q-mb-lg">
            <div class="text-subtitle2 text-grey-7 q-mb-sm">Presentation schedule</div>
            <div class="text-grey-6">
              <em>Session {{ keynote.session }} not found or missing schedule information</em>
            </div>
          </div>
          <div v-else class="q-mb-lg">
            <div class="text-subtitle2 text-grey-7 q-mb-sm">Presentation schedule</div>
            <div class="text-grey-6">
              <em>This keynote is not assigned to a session</em>
            </div>
          </div>
          <div v-if="keynote.abstract" class="q-mb-md">
            <div class="text-subtitle2 text-grey-7 q-mb-xs">Abstract</div>
            <marked-div :text="keynote.abstract" />
          </div>
          <div v-if="keynote.extra_data?.speaker_bio" class="q-mb-md">
            <div class="text-subtitle2 text-grey-7 q-mb-xs">About the Speaker</div>
            <marked-div :text="keynote.extra_data.speaker_bio" />
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
  formatProgramDate,
  formatProgramTime,
  getProgramRoomDisplay,
  getSubsessionDisplayTitle,
} from 'src/utils/program';

import AresDialogContent from 'src/components/AresDialogContent.vue';
import FavoriteBtn from 'src/components/program/FavoriteBtn.vue';
import MarkedDiv from 'src/evan/components/MarkedDiv.vue';

import { iconOpenInNew } from 'src/icons';

interface Props {
  keynote: EvanKeynote;
  buttonLabel?: string;
  buttonIcon?: string;
  buttonColor?: string;
  buttonSize?: string;
  buttonFlat?: boolean;
  buttonOutline?: boolean;
  buttonDense?: boolean;
  hideFavoriteBtn?: boolean;
  inline?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  buttonLabel: 'Details',
  buttonIcon: 'info',
  buttonColor: 'primary',
  buttonSize: 'md',
  buttonFlat: false,
  buttonOutline: false,
  buttonDense: false,
  hideFavoriteBtn: false,
  inline: false,
});

const eventStore = useEventStore();

const dialogOpen = ref(false);

const sessionDisplay = computed(() => {
  if (!props.keynote.session) return null;

  const session = eventStore.sessions.find((s) => s.id === props.keynote.session);
  if (!session) return null;

  const startTime = session.start_at ? formatProgramTime(session.start_at) : null;
  const endTime = session.end_at ? formatProgramTime(session.end_at) : null;
  const date = session.start_at ? formatProgramDate(session.start_at) : null;

  let timeInfo = '';
  if (date) {
    timeInfo = date;
    if (startTime) {
      timeInfo += ` at ${startTime}`;
      if (endTime) {
        timeInfo += ` - ${endTime}`;
      }
    }
  }

  const roomInfo = session.room ? getProgramRoomDisplay(session.room, eventStore.rooms) : null;

  return {
    title: `${session.code ? session.code + ': ' : ''}${session.title}`,
    timeInfo,
    roomInfo,
  };
});

const subsessionDisplay = computed(() => {
  if (!props.keynote.subsession) return null;
  const session = eventStore.sessions.find((s) => s.id === props.keynote.session);
  if (!session?.subsessions) return null;
  const subsession = session.subsessions.find((sub) => sub.id === props.keynote.subsession);
  if (!subsession) return null;

  // Find the index of this subsession to generate the proper title
  const subsessionIndex = session.subsessions.findIndex((sub) => sub.id === props.keynote.subsession);
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

const openDialog = () => {
  dialogOpen.value = true;
};

// Expose methods for programmatic control
defineExpose({
  openDialog,
});
</script>
