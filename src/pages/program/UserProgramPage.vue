<template>
  <div class="q-mb-xl q-pb-xl">
    <div class="container">
      <!-- Search -->
      <div class="q-mb-lg">
        <div class="row">
          <!-- Search Input -->
          <div class="col-12">
            <ares-search-bar placeholder="Search your favorited sessions..." @search="searchQuery = $event" />
          </div>
        </div>
      </div>

      <!-- No favorites state -->
      <empty-state
        v-if="!personalCalendarSessions.length"
        icon="star_border"
        title="No sessions in your calendar"
        description="Browse the program and add sessions to your personal calendar by clicking the star icon."
      />

      <!-- No filtered results -->
      <empty-state
        v-else-if="!filteredSessions.length"
        icon="search_off"
        title="No sessions found"
        description="Try adjusting your search or date filter to find your favorited sessions."
      />

      <!-- Personal Calendar Content -->
      <div v-else>
        <!-- Grouped by day (when no specific day is selected) -->
        <div v-if="groupedSessions">
          <div v-for="group in groupedSessions" :key="group.date" class="day-group q-mb-lg">
            <!-- Day Header -->
            <ares-separator :label="group.dateLabel" color="primary" size="md" />
            <!-- Sessions for this day -->
            <div class="row q-col-gutter-md">
              <div v-for="session in group.sessions" :key="session.id" class="col-12">
                <program-card v-bind="getSessionCardProps(session)" @click="openSessionDetails(session)" />
              </div>
            </div>
          </div>
        </div>

        <!-- Ungrouped sessions (when specific day is selected) -->
        <div v-else class="row q-col-gutter-md">
          <div v-for="session in filteredSessions" :key="session.id" class="col-12">
            <program-card v-bind="getSessionCardProps(session)" @click="openSessionDetails(session)" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <ares-dialog v-model="showSessionDialog">
    <session-dialog-content v-if="selectedSession" :session="selectedSession" />
  </ares-dialog>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';

import { useEventStore } from '@evan/stores/event';
import { usePersonalCalendar } from '@evan/composables/usePersonalCalendar';
import {
  groupSessionsByDay as _groupSessionsByDay,
  getTrackName,
  getRoomName,
  getSessionDisplayTitle,
} from '@evan/utils/program';
import { useFavorites } from '@/composables/useFavorites';
import { searchInFields } from '@/utils/search';
import { EVAN_EVENT_TIMEZONE, EVAN_EVENT_IS_VIRTUAL } from '@/constants';

import AresDialog from '@/components//AresDialog.vue';
import AresSeparator from '@/components/AresSeparator.vue';
import AresSearchBar from '@/components/AresSearchBar.vue';
import EmptyState from '@/components/program/EmptyState.vue';
import ProgramCard from '@/components/program/ProgramCard.vue';
import SessionDialogContent from './SessionDialogContent.vue';

const eventStore = useEventStore();
const favorites = useFavorites();
const personalCalendar = usePersonalCalendar();

// Inject selectedDate from parent MainProgramPage for filtering
const selectedDate = inject<{ value: string }>('selectedDate');

const searchQuery = ref('');
const selectedSession = ref<EvanSession | null>(null);
const showSessionDialog = ref(false);

// Get personal calendar sessions
const personalCalendarSessions = computed(() => {
  return personalCalendar.getPersonalCalendarEntries(eventStore.sessions);
});

// Computed properties for filtering
const filteredSessions = computed(() => {
  // Filter calendar entries based on search and day
  let filtered = personalCalendarSessions.value;

  // Apply search filter
  if (searchQuery.value) {
    filtered = filtered.filter((entry) => {
      const session = entry.session;
      return searchInFields(searchQuery.value, session.title, session.description);
    });
  }

  // Apply day filter
  const selectedDateValue = selectedDate?.value || 'all';
  if (selectedDateValue !== 'all') {
    filtered = filtered.filter((entry) => {
      if (!entry.startTime) return false;
      const sessionDate = new Date(entry.startTime).toISOString().split('T')[0];
      return sessionDate === selectedDateValue;
    });
  }

  return filtered.map((entry) => entry.session);
});

const groupedSessions = computed(() => {
  const selectedDateValue = selectedDate?.value || 'all';
  if (selectedDateValue !== 'all') {
    return null;
  }
  return _groupSessionsByDay(filteredSessions.value, EVAN_EVENT_TIMEZONE, EVAN_EVENT_IS_VIRTUAL);
});

// Helper functions
const getTrackNameForSession = (trackId: number | null): string => {
  const tracks = eventStore.event?.tracks || [];
  return getTrackName(tracks, trackId);
};

const getRoomNameForSession = (roomId: number | null): string => {
  return getRoomName(eventStore.rooms, roomId);
};

const getSessionCardProps = (session: EvanSession) => {
  const favoriteState = favorites.getSessionFavoriteState(session);
  const tracks = eventStore.event?.tracks || [];

  return {
    title: getSessionDisplayTitle(session, tracks),
    startTime: session.start_at,
    endTime: session.end_at,
    trackInfo: session.track
      ? {
          label: getTrackNameForSession(session.track),
        }
      : undefined,
    locationInfo: getRoomNameForSession(session.room),
    favoriteState: {
      isFavorite: favoriteState === 'full',
      isPartial: favoriteState === 'partial',
    },
    showTimeHeader: true,
    showEndTime: true,
    showFavorite: true,
    variant: 'session' as const,
  };
};

const openSessionDetails = async (session: EvanSession) => {
  selectedSession.value = session;
  showSessionDialog.value = true;
};
</script>
