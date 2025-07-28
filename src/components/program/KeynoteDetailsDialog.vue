<template>
  <div style="display: inline">
    <q-btn
      v-if="!hideButton"
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
    <ares-dialog v-model="dialogOpen">
      <ares-dialog-content title="Keynote details" hide-drawer compact>
        <template #tabs>
          <h6 class="q-mt-none q-mb-md ares__text-red text-wrap-balance">{{ keynote.title }}</h6>
        </template>
        <template #page>
          <div class="q-px-lg q-pb-xl">
            <div v-if="keynote.speaker" class="q-mb-md">
              <div class="text-subtitle2 text-grey-7 q-mb-sm">Speaker</div>
              <div class="row items-start q-col-gutter-lg q-mb-lg">
                <div class="col-shrink">
                  <avatar-display :file="keynoteAvatar" size="128px" :alt-text="keynote.speaker" />
                </div>
                <div class="col">
                  <p class="q-mb-none text-wrap-balance">
                    <strong>{{ keynote.speaker }}</strong>
                    <span v-if="keynote.extra_data?.speaker_affiliation" class="text-grey-8">
                      <br />{{ keynote.extra_data.speaker_affiliation }}
                    </span>
                  </p>
                  <div v-if="keynote.extra_data?.speaker_website" class="float-right q-mt-md lt-md">
                    <ares-btn
                      :href="keynote.extra_data.speaker_website"
                      target="_blank"
                      :icon="iconOpenInNew"
                      label="Visit website"
                      size="md"
                    />
                  </div>
                </div>
                <div v-if="keynote.extra_data?.speaker_website" class="col-auto gt-sm">
                  <ares-btn
                    :href="keynote.extra_data.speaker_website"
                    target="_blank"
                    :icon="iconOpenInNew"
                    label="Visit website"
                    size="md"
                  />
                </div>
              </div>
            </div>
            <div v-if="sessionDisplay || subsessionDisplay" class="q-mb-lg">
              <div class="text-subtitle2 text-grey-7 q-mb-sm">Presentation schedule</div>
              <div v-if="!hideFavoriteBtn" class="float-right q-ml-lg">
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
            <div v-if="keynote.bio" class="q-mb-lg">
              <div class="text-subtitle2 text-grey-7 q-mb-sm">Speaker Bio</div>
              <marked-div :text="keynote.bio" />
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
    </ares-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { useEventStore } from '@evan/stores/event';
import { createSessionDisplayInfo, createSubsessionDisplayInfo, getKeynoteAvatar } from '@/utils/program';

import MarkedDiv from '@evan/components/MarkedDiv.vue';
import AresDialogContent from '@/components/AresDialogContent.vue';
import AresDialog from '@/components/AresDialog.vue';
import FavoriteBtn from '@/components/program/FavoriteBtn.vue';
import AvatarDisplay from '@/components/AvatarDisplay.vue';

import { iconOpenInNew } from '@/icons';

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
  hideButton?: boolean;
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
  hideButton: false,
});

const eventStore = useEventStore();

const dialogOpen = ref(false);

const keynoteAvatar = computed(() => getKeynoteAvatar(props.keynote));

const sessionDisplay = computed(() => {
  if (!props.keynote.session) return null;

  const session = eventStore.sessions.find((s) => s.id === props.keynote.session);
  if (!session) return null;

  return createSessionDisplayInfo(session, eventStore.rooms);
});

const subsessionDisplay = computed(() => {
  if (!props.keynote.subsession) return null;
  const session = eventStore.sessions.find((s) => s.id === props.keynote.session);
  if (!session?.subsessions) return null;
  const subsession = session.subsessions.find((sub) => sub.id === props.keynote.subsession);
  if (!subsession) return null;

  const subsessionIndex = session.subsessions.findIndex((sub) => sub.id === props.keynote.subsession);
  return createSubsessionDisplayInfo(subsession, subsessionIndex, session.code, session.room, eventStore.rooms);
});

const openDialog = () => {
  dialogOpen.value = true;
};

// Expose methods for programmatic control
defineExpose({
  openDialog,
});
</script>
