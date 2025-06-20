<template>
  <div class="q-mb-xl q-pb-xl">
    <div class="container">
      <!-- Search -->
      <div class="q-mb-lg">
        <div class="row">
          <!-- Search Input -->
          <div class="col-12">
            <ares-search-bar v-model="searchQuery" placeholder="Search your favorited sessions..." />
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

  <!-- Session Details Dialog -->
  <q-dialog v-model="showSessionDialog" square position="bottom" class="ares__dialog">
    <SessionDialog v-if="selectedSession" :session="selectedSession" />
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';

import { useEventStore } from 'src/evan/stores/event';
import { useFavorites } from 'src/composables/useFavorites';
import { usePersonalCalendar } from 'src/composables/usePersonalCalendar';
import { groupSessionsByDay, getTrackName, getRoomName, getSessionDisplayTitle } from 'src/utils/program';
import { searchInFields } from 'src/utils/search';

import ProgramCard from 'src/components/program/ProgramCard.vue';
import SessionDialog from './SessionDialog.vue';
import AresSeparator from 'src/components/AresSeparator.vue';
import AresSearchBar from 'src/components/AresSearchBar.vue';
import EmptyState from 'src/components/program/EmptyState.vue';

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
  return groupSessionsByDay(filteredSessions.value);
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
