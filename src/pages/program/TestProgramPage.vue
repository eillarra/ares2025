<template>
  <div class="q-pt-xl q-mb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-xl justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Conference program</h2>
          <q-separator />
          <h6 class="ares__text-red">Browse all sessions or build your personal schedule.</h6>
        </div>
        <div class="col-12 col-md-7">
          <q-input
            v-model="searchQuery"
            outlined
            dense
            placeholder="Search sessions, speakers, or topics..."
            class="bg-white"
          >
            <template v-slot:prepend>
              <q-icon :name="iconSearch" />
            </template>
            <template v-slot:append>
              <q-btn v-if="searchQuery" flat round dense :icon="iconClear" @click="searchQuery = ''" />
            </template>
          </q-input>
        </div>
      </div>
    </div>
  </div>
  <div class="bg-grey-1 q-py-md">
    <div class="container">
      <div class="row q-col-gutter-md items-center">
        <!-- View Toggle -->
        <div class="col-12 col-sm-auto">
          <q-btn-toggle
            v-model="viewMode"
            toggle-color="primary"
            :options="[
              { label: 'List', value: 'sessions', icon: iconViewList },
              {
                label: `My Calendar (${personalCalendarEntries.length})`,
                value: 'personal',
                icon: iconStar,
              },
            ]"
            class="shadow-1"
          />
        </div>

        <!-- Date Filter -->
        <div class="col-12 col-sm-auto">
          <q-select
            v-model="selectedDay"
            :options="dayOptions"
            outlined
            dense
            emit-value
            map-options
            class="bg-white"
            style="min-width: 120px"
          />
        </div>

        <!-- Track Filter -->
        <div class="col-12 col-sm-auto">
          <q-select
            v-model="selectedTrack"
            :options="trackOptions"
            outlined
            dense
            emit-value
            map-options
            :label="`Track`"
            placeholder="All tracks"
            class="bg-white"
            style="min-width: 150px"
          />
        </div>

        <!-- More Filters -->
        <div class="col-12 col-sm-auto">
          <q-btn outline :icon="iconTune" label="Filters" @click="showFilters = !showFilters" />
        </div>

        <!-- Paper Search -->
        <div class="col-12 col-sm-auto">
          <q-btn outline :icon="iconArticle" label="Search Papers" @click="paperSearchDialog = true" />
        </div>

        <q-space />
      </div>

      <!-- Advanced Filters (Collapsible) -->
      <q-slide-transition>
        <div v-show="showFilters" class="q-mt-md">
          <q-card flat bordered class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input v-model="speakerSearch" outlined dense label="Speaker Name" clearable />
              </div>
              <div class="col-12 col-md-4">
                <q-btn outline label="Clear Filters" @click="clearFilters" class="full-width" />
              </div>
            </div>
          </q-card>
        </div>
      </q-slide-transition>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="container q-py-lg">
    <!-- Loading State -->
    <div v-if="eventStore.loading" class="text-center q-py-xl">
      <q-spinner-dots size="40px" color="primary" />
      <div class="q-mt-md text-grey-6">Loading program data...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="eventStore.error" class="text-center q-py-xl">
      <q-icon :name="iconError" size="64px" color="negative" />
      <h5 class="text-negative q-mt-md">{{ eventStore.error }}</h5>
      <q-btn color="primary" label="Retry" @click="loadData" class="q-mt-md" />
    </div>

    <!-- Content -->
    <div v-else-if="eventStore.sessions.length > 0">
      <!-- Sessions List View -->
      <div v-if="viewMode === 'sessions'" class="sessions-view">
        <!-- Grouped by day (when no specific day is selected) -->
        <div v-if="groupedSessions">
          <div v-for="group in groupedSessions" :key="group.date" class="day-group q-mb-lg">
            <!-- Day Header -->
            <ares-separator :label="group.dateLabel" color="primary" size="md" />
            <!-- Sessions for this day -->
            <div class="row q-col-gutter-md">
              <div v-for="session in group.sessions" :key="session.id" class="col-12 col-md-6 col-lg-4">
                <session-card
                  :session="session"
                  :show-time="true"
                  :show-end-time="true"
                  :get-track-name="getTrackNameForSession"
                  :get-room-name="getRoomNameForSession"
                  :favorite-state="favorites.getSessionFavoriteState(session)"
                  @click="openSessionDetails(session)"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- Ungrouped (when specific day is selected) -->
        <div v-else class="row q-col-gutter-md">
          <div v-for="session in filteredSessions" :key="session.id" class="col-12 col-md-6 col-lg-4">
            <session-card
              :session="session"
              :show-time="true"
              :show-end-time="true"
              :get-track-name="getTrackNameForSession"
              :get-room-name="getRoomNameForSession"
              :favorite-state="favorites.getSessionFavoriteState(session)"
              @click="openSessionDetails(session)"
            />
          </div>
        </div>
      </div>

      <!-- Personal Schedule View -->
      <div v-else-if="viewMode === 'personal'" class="personal-view">
        <div class="text-center q-py-xl" v-if="!personalCalendarEntries.length">
          <q-icon :name="iconStarBorder" size="64px" color="grey-5" />
          <h5 class="text-grey-6 q-mt-md">No sessions added yet</h5>
          <p class="text-grey-6">Start building your personal schedule by favoriting sessions that interest you.</p>
          <q-btn color="primary" label="Browse Sessions" @click="viewMode = 'sessions'" />
        </div>
        <div v-else>
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <q-banner class="bg-blue-1 text-primary">
                <template v-slot:avatar>
                  <q-icon :name="iconInfo" />
                </template>
                You have {{ personalCalendarEntries.length }} time slots in your personal schedule.
                <template v-slot:action>
                  <q-btn flat label="Clear All" @click="clearAllFavorites" color="negative" />
                </template>
              </q-banner>
            </div>
          </div>
          <!-- Personal schedule list -->
          <div class="personal-calendar">
            <!-- Grouped by day (when no specific day is selected) -->
            <div v-if="groupedCalendarEntries">
              <div v-for="group in groupedCalendarEntries" :key="group.date" class="day-group q-mb-lg">
                <!-- Day Header -->
                <ares-separator :label="group.dateLabel" color="primary" size="md" />
                <!-- Calendar entries for this day -->
                <div class="row q-col-gutter-md">
                  <div v-for="entry in group.entries" :key="entry.id" class="col-12 col-md-6 col-lg-4">
                    <session-card
                      :session="entry.session"
                      :show-time="true"
                      :show-end-time="true"
                      :show-date="true"
                      :get-track-name="getTrackNameForSession"
                      :get-room-name="getRoomNameForSession"
                      :favorite-state="favorites.getSessionFavoriteState(entry.session)"
                      @click="openSessionDetails(entry.session)"
                      :title="getCalendarEntryDisplayTitle(entry)"
                    />
                  </div>
                </div>
              </div>
            </div>
            <!-- Ungrouped (when specific day is selected) -->
            <div v-else class="row q-col-gutter-md">
              <div v-for="entry in personalCalendarEntries" :key="entry.id" class="col-12 col-md-6 col-lg-4">
                <session-card
                  :session="entry.session"
                  :show-time="true"
                  :show-end-time="true"
                  :show-date="true"
                  :get-track-name="getTrackNameForSession"
                  :get-room-name="getRoomNameForSession"
                  :favorite-state="favorites.getSessionFavoriteState(entry.session)"
                  @click="openSessionDetails(entry.session)"
                  :title="getCalendarEntryDisplayTitle(entry)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center q-py-xl">
      <q-icon :name="iconEventBusy" size="64px" color="grey-5" />
      <h5 class="text-grey-6 q-mt-md">No sessions found</h5>
      <p class="text-grey-6">Try adjusting your filters or check back later for updated program information.</p>
    </div>
  </div>

  <!-- Session Details Dialog -->
  <q-dialog v-model="sessionDialog" square position="bottom" class="ares__dialog">
    <SessionDialog v-if="selectedSession" :session="selectedSession" />
  </q-dialog>

  <!-- Paper Search Dialog -->
  <q-dialog v-model="paperSearchDialog" square position="bottom" class="ares__dialog">
    <PaperSearchDialog />
  </q-dialog>

  <!-- Floating Action Button (Mobile) -->
  <q-page-sticky v-if="$q.screen.lt.md" position="bottom-right" :offset="[18, 18]">
    <q-btn fab :icon="iconTune" color="primary" @click="showMobileFilters = true" />
  </q-page-sticky>

  <!-- Mobile Filters Dialog -->
  <q-dialog v-model="showMobileFilters" position="bottom">
    <q-card class="full-width">
      <q-card-section>
        <div class="row items-center">
          <div class="col">
            <h6 class="q-my-none">Filters</h6>
          </div>
          <div class="col-auto">
            <q-btn flat round dense :icon="iconClear" @click="showMobileFilters = false" />
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="q-gutter-md">
          <q-select
            v-model="selectedDay"
            :options="dayOptions"
            outlined
            dense
            emit-value
            map-options
            label="Day"
            class="full-width"
          />
          <q-select
            v-model="selectedTrack"
            :options="trackOptions"
            outlined
            dense
            emit-value
            map-options
            label="Track"
            class="full-width"
          />
          <q-input v-model="speakerSearch" outlined dense label="Speaker Name" clearable class="full-width" />
          <div class="row q-gutter-sm">
            <q-btn color="primary" label="Apply" @click="showMobileFilters = false" class="col" />
            <q-btn outline label="Clear" @click="clearFilters" class="col" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';

import { api } from 'boot/axios';

import SessionCard from 'src/components/program/SessionCard.vue';
import SessionDialog from './SessionDialog.vue';
import PaperSearchDialog from 'src/components/program/PaperSearchDialog.vue';
import AresSeparator from 'src/components/AresSeparator.vue';
import { useEventStore } from 'src/evan/stores/event';
import { useFavorites } from 'src/composables/useFavorites';
import { usePersonalCalendar, CalendarSessionEntry } from 'src/composables/usePersonalCalendar';
import {
  getAvailableDates,
  createDayOptions,
  createTrackOptions,
  getSessionDisplayTitle,
  getSubsessionDisplayTitle,
  getTrackName,
  getRoomName,
  groupSessionsByDay,
  filterSessions,
} from 'src/utils/program';
import {
  iconSearch,
  iconClear,
  iconViewList,
  iconStar,
  iconTune,
  iconError,
  iconStarBorder,
  iconInfo,
  iconEventBusy,
  iconArticle,
} from 'src/icons';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const eventStore = useEventStore();
const favorites = useFavorites();
const personalCalendar = usePersonalCalendar();

// State
const searchQuery = ref('');
const viewMode = ref('sessions');
const selectedDay = ref('all');
const selectedTrack = ref<number | 'all'>('all');
const speakerSearch = ref('');
const showFilters = ref(false);
const showMobileFilters = ref(false);
const selectedSession = ref<EvanSession | null>(null);
const paperSearchDialog = ref(false);

const sessionSlug = computed<string | null>(() => (route.params.sessionSlug as string) || null);

const sessionDialog = computed<boolean>({
  get() {
    return !!selectedSession.value;
  },
  set(value) {
    if (!value) {
      selectedSession.value = null;
      router.push({ name: 'testProgram' });
    }
  },
});

const getTrackNameForSession = (trackId: number | null): string => {
  const tracks = eventStore.event?.tracks || [];
  return getTrackName(tracks, trackId);
};

const getRoomNameForSession = (roomId: number | null): string => {
  return getRoomName(eventStore.rooms, roomId);
};

const dayOptions = computed(() => {
  const availableDates = getAvailableDates(eventStore.sessions);
  return createDayOptions(availableDates);
});

const trackOptions = computed(() => {
  const tracks = createTrackOptions(eventStore.event?.tracks || []);
  return [{ label: 'All tracks', value: 'all' }, ...tracks];
});

const filteredSessions = computed(() => {
  const tracks = eventStore.event?.tracks || [];
  const selectedTracks = selectedTrack.value !== 'all' ? [selectedTrack.value] : [];

  return filterSessions(eventStore.sessions, searchQuery.value, selectedDay.value, selectedTracks, tracks);
});

const personalCalendarEntries = computed(() => {
  return personalCalendar.getPersonalCalendarEntries(eventStore.sessions);
});

const groupedSessions = computed(() => {
  if (selectedDay.value !== 'all') {
    return null;
  }
  return groupSessionsByDay(filteredSessions.value);
});

const groupedCalendarEntries = computed(() => {
  if (selectedDay.value !== 'all') {
    return null;
  }
  return personalCalendar.groupCalendarEntriesByDay(personalCalendarEntries.value);
});

const openSessionDetails = async (session: EvanSession) => {
  try {
    router.push({ name: 'testProgram', params: { sessionSlug: session.slug } });
  } catch (error) {
    console.error('Error loading session details:', error);
    $q.notify({
      message: 'Failed to load session details',
      color: 'negative',
      position: 'bottom',
    });
  }
};

const clearFilters = () => {
  selectedTrack.value = 'all';
  speakerSearch.value = '';
  searchQuery.value = '';
};

const clearAllFavorites = () => {
  $q.dialog({
    title: 'Clear All Favorites',
    message: 'Are you sure you want to remove all sessions from your personal schedule?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    favorites.clearAllFavorites();
    $q.notify({
      message: 'All sessions removed from your schedule',
      color: 'info',
      position: 'bottom',
    });
  });
};

const getCalendarEntryDisplayTitle = (entry: CalendarSessionEntry): string => {
  if (entry.subsessionIds && entry.subsessionIds.length > 0) {
    const subsessionTitles = entry.subsessionIds
      .map((id) => {
        const subsession = entry.session.subsessions?.find((s) => s.id === id);
        return getSubsessionDisplayTitle(subsession, entry.subsessionIds.indexOf(id), entry.session.code);
      })
      .filter((title) => title !== null);

    if (subsessionTitles.length > 0) {
      return subsessionTitles.join(', ');
    }
  }

  return getSessionDisplayTitle(entry.session);
};

// Helper function to load initial data
const loadData = async () => {
  // Load both event data (which includes tracks) and program data
  await Promise.all([eventStore.init(), eventStore.fetchProgramData()]);
};

// Fetch session info based on route parameter
const fetchSessionInfo = async () => {
  if (route.params.sessionSlug) {
    if (!eventStore.event) {
      setTimeout(fetchSessionInfo, 100);
      return;
    }

    const session = eventStore.sessions.find((s) => s.slug === route.params.sessionSlug);

    if (!session) {
      router.push({ name: 'testProgram' });
      return;
    }

    api.get(session.self).then((response) => {
      selectedSession.value = response.data;
    });
  }
};

// Watch for changes in sessionSlug param to fetch session info
watch(sessionSlug, (newSlug) => {
  if (newSlug) {
    fetchSessionInfo();
  }
});

// On component mount, load data and fetch session info if sessionSlug is present
onMounted(async () => {
  await loadData();
  if (route.params.sessionSlug) {
    fetchSessionInfo();
  }
});
</script>
