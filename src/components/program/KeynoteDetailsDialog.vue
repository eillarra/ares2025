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
            <p>
              <strong>{{ keynote.speaker }}</strong>
              <span v-if="keynote.extra_data?.speaker_affiliation" class="text-grey-6">
                <br />{{ keynote.extra_data.speaker_affiliation }}
              </span>
            </p>
          </div>
          <div v-if="sessionDisplay" class="q-mb-lg">
            <div class="text-subtitle2 text-grey-7 q-mb-sm">Session schedule</div>
            <div>
              <strong>Session:</strong> {{ sessionDisplay.title }}<br />
              <span v-if="sessionDisplay.timeInfo"><strong>Time:</strong> {{ sessionDisplay.timeInfo }}</span
              ><br />
              <span v-if="sessionDisplay.roomInfo"><strong>Room:</strong> {{ sessionDisplay.roomInfo }}</span>
            </div>
          </div>
          <div v-else-if="keynote.session" class="q-mb-lg">
            <div class="text-subtitle2 text-grey-7 q-mb-sm">Session schedule</div>
            <div class="text-grey-6">
              <em>Session {{ keynote.session }} not found or missing schedule information</em>
            </div>
          </div>
          <div v-else class="q-mb-lg">
            <div class="text-subtitle2 text-grey-7 q-mb-sm">Session schedule</div>
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
      <template #footer v-if="!hideFooter">
        <div class="full-width q-pa-md">
          <div class="row q-gutter-sm justify-end">
            <ares-btn
              v-if="sessionDisplay"
              :icon="favorites.isSessionFavorited(keynote.session) ? iconStar : iconStarBorder"
              :label="favorites.isSessionFavorited(keynote.session) ? 'Remove session' : 'Add session'"
              outline
              size="md"
              :class="{ 'ares__bg-yellow': favorites.isSessionFavorited(keynote.session) }"
              @click="toggleSessionFavorite"
            />
          </div>
        </div>
      </template>
    </ares-dialog-content>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';

import { useEventStore } from 'src/evan/stores/event';
import { useFavorites } from 'src/composables/useFavorites';
import { formatProgramDate, formatProgramTime, getProgramRoomDisplay } from 'src/utils/program';

import AresDialogContent from 'src/components/AresDialogContent.vue';
import MarkedDiv from 'src/evan/components/MarkedDiv.vue';

import { iconStar, iconStarBorder } from 'src/icons';

interface Props {
  keynote: EvanKeynote;
  buttonLabel?: string;
  buttonIcon?: string;
  buttonColor?: string;
  buttonSize?: string;
  buttonFlat?: boolean;
  buttonOutline?: boolean;
  buttonDense?: boolean;
  hideFooter?: boolean;
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
  hideFooter: false,
  inline: false,
});

const eventStore = useEventStore();
const favorites = useFavorites();
const $q = useQuasar();

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
    title: session.title,
    timeInfo,
    roomInfo,
  };
});

const openDialog = () => {
  dialogOpen.value = true;
};

const toggleSessionFavorite = () => {
  if (!props.keynote.session) return;

  const wasFavorited = favorites.isSessionFavorited(props.keynote.session);
  favorites.toggleSessionFavorite(props.keynote.session);

  $q.notify({
    message: wasFavorited
      ? `Removed "${props.keynote.title}" session from favorites`
      : `Added "${props.keynote.title}" session to favorites`,
    color: wasFavorited ? 'negative' : 'positive',
    position: 'bottom',
  });
};

// Expose methods for programmatic control
defineExpose({
  openDialog,
});
</script>
