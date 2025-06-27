<template>
  <div class="q-mb-xl q-pb-xl">
    <div class="container">
      <loading-state v-if="eventStore.loading" message="Loading keynotes..." />

      <error-state
        v-else-if="eventStore.error"
        :error-message="eventStore.error"
        @retry="eventStore.fetchProgramData()"
      />

      <empty-state
        v-else-if="!eventStore.keynotes.length"
        icon="mic"
        title="No keynotes available"
        description="Keynotes will appear here when available"
      />

      <template v-else>
        <!-- Show keynotes sections or empty state when filtered by day -->
        <div v-if="filteredMainKeynotes.length > 0" class="q-mb-xl">
          <ares-separator label="ARES Keynotes" />
          <div class="row q-col-gutter-md q-mt-md">
            <div v-for="keynote in filteredMainKeynotes" :key="keynote.id" class="col-12 col-md-6">
              <program-card
                :title="keynote.title"
                :start-time="getKeynoteStartTime(keynote)"
                :end-time="getKeynoteEndTime(keynote)"
                :speaker-info="getKeynoteSpeakerInfo(keynote)"
                :location-info="getKeynoteLocation(keynote)"
                :time-info="getKeynoteTimeInfo(keynote)"
                category-label="ARES - Keynote"
                variant="keynote"
                @click="openKeynoteDetails(keynote)"
              />
            </div>
          </div>
        </div>
        <div v-if="filteredWorkshopKeynotes.length > 0" class="q-mb-xl">
          <ares-separator label="Workshop Keynotes" />
          <div class="row q-col-gutter-md q-mt-md">
            <div v-for="keynote in filteredWorkshopKeynotes" :key="keynote.id" class="col-12 col-md-4">
              <program-card
                :title="keynote.title"
                :start-time="getKeynoteStartTime(keynote)"
                :end-time="getKeynoteEndTime(keynote)"
                :speaker-info="getKeynoteSpeakerInfo(keynote)"
                :location-info="getKeynoteLocation(keynote)"
                :time-info="getKeynoteTimeInfo(keynote)"
                :track-info="getKeynoteTrackInfo(keynote)"
                :category-label="getWorkshopKeynoteCategory(keynote)"
                variant="keynote"
                @click="openKeynoteDetails(keynote)"
              />
            </div>
          </div>
        </div>
        <!-- Empty state when day filter produces no keynotes -->
        <empty-state
          v-if="!filteredMainKeynotes.length && !filteredWorkshopKeynotes.length && eventStore.keynotes.length"
          icon="mic"
          title="No keynotes for this day"
          description="No keynotes are scheduled for the selected day."
        />
      </template>
    </div>
    <keynote-details-dialog v-if="selectedKeynote" ref="keynoteDialog" :keynote="selectedKeynote" hide-button />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, inject } from 'vue';

import { useEventStore } from '@evan/stores/event';
import { formatProgramTime, getRoomName, sortKeynotes } from '@/utils/program';

import AresSeparator from '@/components/AresSeparator.vue';
import KeynoteDetailsDialog from '@/components/program/KeynoteDetailsDialog.vue';
import LoadingState from '@/components/program/LoadingState.vue';
import ErrorState from '@/components/program/ErrorState.vue';
import EmptyState from '@/components/program/EmptyState.vue';
import ProgramCard from '@/components/program/ProgramCard.vue';

const eventStore = useEventStore();

// Inject selectedDate from parent MainProgramPage for filtering
const selectedDate = inject<{ value: string }>('selectedDate');

const selectedKeynote = ref<EvanKeynote | null>(null);
const keynoteDialog = ref<InstanceType<typeof KeynoteDetailsDialog> | null>(null);

const openKeynoteDetails = (keynote: EvanKeynote) => {
  selectedKeynote.value = keynote;
  nextTick(() => {
    keynoteDialog.value?.openDialog();
  });
};

const isMainKeynote = (keynote: EvanKeynote): boolean => {
  if (!keynote.session) return false;
  const session = eventStore.sessions.find((s) => s.id === keynote.session);
  if (!session?.track) return false;
  const track = eventStore.tracks.find((t) => t.id === session.track);
  return track?.name.toLowerCase() === 'keynotes';
};

const filteredMainKeynotes = computed(() => {
  let keynotes = eventStore.keynotes.filter(isMainKeynote);

  const selectedDateValue = selectedDate?.value || 'all';
  if (selectedDateValue !== 'all') {
    keynotes = keynotes.filter((keynote) => {
      if (!keynote.session) return false;
      const session = eventStore.sessions.find((s) => s.id === keynote.session);
      if (!session?.start_at) return false;
      const sessionDate = new Date(session.start_at).toISOString().split('T')[0];
      return sessionDate === selectedDateValue;
    });
  }

  return sortKeynotes(keynotes, eventStore.sessions);
});

const filteredWorkshopKeynotes = computed(() => {
  let keynotes = eventStore.keynotes.filter((keynote) => !isMainKeynote(keynote));

  const selectedDateValue = selectedDate?.value || 'all';
  if (selectedDateValue !== 'all') {
    keynotes = keynotes.filter((keynote) => {
      if (!keynote.session) return false;
      const session = eventStore.sessions.find((s) => s.id === keynote.session);
      if (!session?.start_at) return false;
      const sessionDate = new Date(session.start_at).toISOString().split('T')[0];
      return sessionDate === selectedDateValue;
    });
  }

  return sortKeynotes(keynotes, eventStore.sessions);
});

const getWorkshopKeynoteCategory = (keynote: EvanKeynote): string => {
  if (!keynote.session) return 'KEYNOTE';
  const session = eventStore.sessions.find((s) => s.id === keynote.session);
  return session?.code ? `${session.code} - Keynote` : 'KEYNOTE';
};

const getKeynoteStartTime = (keynote: EvanKeynote): string | undefined => {
  if (keynote.subsession) {
    const session = eventStore.sessions.find((s) => s.id === keynote.session);
    const subsession = session?.subsessions.find((s) => s.id === keynote.subsession);
    if (subsession?.start_at) return subsession.start_at;
  }
  if (!keynote.session) return undefined;
  const session = eventStore.sessions.find((s) => s.id === keynote.session);
  return session?.start_at;
};

const getKeynoteEndTime = (keynote: EvanKeynote): string | undefined => {
  if (keynote.subsession) {
    const session = eventStore.sessions.find((s) => s.id === keynote.session);
    const subsession = session?.subsessions.find((s) => s.id === keynote.subsession);
    if (subsession?.end_at) return subsession.end_at;
  }
  if (!keynote.session) return undefined;
  const session = eventStore.sessions.find((s) => s.id === keynote.session);
  return session?.end_at;
};

const getKeynoteSpeakerInfo = (keynote: EvanKeynote) => {
  return {
    name: keynote.speaker,
    affiliation: keynote.extra_data?.speaker_affiliation,
  };
};

const getKeynoteLocation = (keynote: EvanKeynote): string => {
  if (!keynote.session) return 'No room assigned';
  const session = eventStore.sessions.find((s) => s.id === keynote.session);
  return getRoomName(eventStore.rooms, session?.room || null);
};

const getKeynoteTimeInfo = (keynote: EvanKeynote): string => {
  const startTime = getKeynoteStartTime(keynote);
  const endTime = getKeynoteEndTime(keynote);
  if (!startTime) return 'TBA';

  let timeStr = formatProgramTime(startTime);
  if (endTime) {
    timeStr += ` - ${formatProgramTime(endTime)}`;
  }
  return timeStr;
};

const getKeynoteTrackInfo = (keynote: EvanKeynote) => {
  if (!keynote.session) return undefined;
  const session = eventStore.sessions.find((s) => s.id === keynote.session);
  if (!session?.track) return undefined;
  const track = eventStore.tracks.find((t) => t.id === session.track);
  if (!track || track.name.toLowerCase() === 'keynotes') return undefined;

  return {
    label: track.name,
    color: 'primary',
  };
};
</script>
