<template>
  <div class="q-mb-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between q-mb-lg">
        <div class="col-12 col-md-4 flex column" v-show="$q.screen.gt.xs">
          <ares-separator label="Schedule" />
        </div>
        <div class="col-12 col-md-7">
          <ares-search-bar v-model="searchQuery" placeholder="Search sessions, speakers, or topics...">
            <template #footer>
              <span v-if="filteredSessions.length > 0"
                >{{ filteredSessions.length }} session<span v-if="filteredSessions.length > 1">s</span> found</span
              >
              <span v-if="hasFiltersApplied"> (filtered)</span>
            </template>
          </ares-search-bar>
        </div>
      </div>

      <empty-state
        v-if="!filteredSessions.length"
        icon="event_busy"
        title="No sessions found"
        :description="
          hasFiltersApplied ? 'Try adjusting your search or filters' : 'Sessions will appear here when available'
        "
      />

      <div v-else>
        <div v-if="groupedSessions">
          <div v-for="group in groupedSessions" :key="group.date" class="day-group q-mb-xl">
            <ares-separator :label="group.dateLabel" color="primary" size="md" />
            <div class="row q-col-gutter-md">
              <div v-for="session in group.sessions" :key="session.id" class="col-12 col-md-6 col-lg-4">
                <program-card v-bind="getSessionCardProps(session)" @click="openSessionDetails(session)" />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="session in filteredSessions" :key="session.id" class="col-12 col-md-6 col-lg-4">
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
import { ref, computed, inject, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useEventStore } from '@evan/stores/event';
import AresDialog from '@/components/AresDialog.vue';

import { api } from '@/boot/axios';
import { useFavorites } from '@/composables/useFavorites';
import {
  filterSessions,
  groupSessionsByDayAdvanced as _groupSessionsByDayAdvanced,
  getSessionDisplayTitle,
  sortSessionsAdvanced,
  getKeynoteAvatar,
} from '@evan/utils/program';
import { EVAN_EVENT_TIMEZONE, EVAN_EVENT_IS_VIRTUAL } from '@/constants';

import AresSearchBar from '@/components/AresSearchBar.vue';
import AresSeparator from '@/components/AresSeparator.vue';
import EmptyState from '@/components/program/EmptyState.vue';
import ProgramCard from '@/components/program/ProgramCard.vue';
import SessionDialogContent from './SessionDialogContent.vue';

const eventStore = useEventStore();
const favorites = useFavorites();
const route = useRoute();
const router = useRouter();

const selectedDate = inject<{ value: string }>('selectedDate');

const searchQuery = ref('');

const selectedSession = ref<EvanSession | null>(null);
const showSessionDialog = computed<boolean>({
  get() {
    return !!selectedSession.value;
  },
  set(value) {
    if (!value) {
      selectedSession.value = null;

      if (route.params.sessionSlug) {
        window.history.replaceState({ ...window.history.state, preserveScroll: true }, '');
        router.replace({
          name: 'program',
          query: route.query,
        });
      }
    }
  },
});

const filteredSessions = computed(() => {
  const tracks = eventStore.event?.tracks || [];
  const selectedDateValue = selectedDate?.value || 'all';

  const filtered = filterSessions(eventStore.sessions, searchQuery.value, selectedDateValue, [], tracks);

  if (selectedDateValue !== 'all') {
    return sortSessionsAdvanced(filtered, tracks);
  }

  return filtered;
});

const groupedSessions = computed(() => {
  const selectedDateValue = selectedDate?.value || 'all';
  if (selectedDateValue !== 'all') {
    return null;
  }
  const tracks = eventStore.event?.tracks || [];
  return _groupSessionsByDayAdvanced(filteredSessions.value, tracks, EVAN_EVENT_TIMEZONE, EVAN_EVENT_IS_VIRTUAL);
});

const hasFiltersApplied = computed(() => {
  const selectedDateValue = selectedDate?.value || 'all';
  return searchQuery.value || selectedDateValue !== 'all';
});

const getSessionTrackInfo = (session: EvanSession) => {
  if (!session.track) return undefined;
  const tracks = eventStore.event?.tracks || [];
  const track = tracks.find((t) => t.id === session.track);
  return track ? { label: track.name, color: 'primary' } : undefined;
};

const getSessionLocationInfo = (session: EvanSession): string => {
  if (!session.room) return 'TBA';
  const rooms = eventStore.rooms || [];
  const room = rooms.find((r) => r.id === session.room);
  return room?.name || 'TBA';
};

const getSessionPaperCount = (session: EvanSession): number | undefined => {
  const paperCount = eventStore.papers.filter((paper) => paper.session === session.id).length;
  return paperCount > 0 ? paperCount : undefined;
};

const getSessionFavoriteState = (session: EvanSession) => {
  const state = favorites.getSessionFavoriteState(session);
  return {
    isFavorite: state === 'full',
    isPartial: state === 'partial',
  };
};

const getSessionVariant = (session: EvanSession): 'session' | 'keynote' | 'paper' | 'social' => {
  if (session.is_social_event) return 'social';
  if (!session.track) return 'session';

  const tracks = eventStore.event?.tracks || [];
  const track = tracks.find((t) => t.id === session.track);
  if (!track) return 'session';

  const trackName = track.name.toLowerCase();
  if (trackName.includes('keynote')) return 'keynote';
  if (trackName.includes('paper')) return 'paper';
  return 'session';
};

const getKeynoteSpeakerInfo = (session: EvanSession) => {
  // Find keynote that corresponds to this session
  const keynote = eventStore.keynotes.find((k) => k.session === session.id);
  if (!keynote) return undefined;

  const avatar = getKeynoteAvatar(keynote);
  return {
    name: keynote.speaker,
    affiliation: keynote.extra_data?.speaker_affiliation,
    avatar,
  };
};

const getSessionCardProps = (session: EvanSession) => {
  const tracks = eventStore.event?.tracks || [];
  const variant = getSessionVariant(session);

  // Add speaker info for keynote sessions
  const speakerInfo = variant === 'keynote' ? getKeynoteSpeakerInfo(session) : undefined;

  return {
    title: getSessionDisplayTitle(session, tracks),
    startTime: session.start_at,
    endTime: session.end_at,
    trackInfo: getSessionTrackInfo(session),
    speakerInfo,
    locationInfo: getSessionLocationInfo(session),
    paperCount: getSessionPaperCount(session),
    favoriteState: getSessionFavoriteState(session),
    variant,
  };
};

const openSessionDetails = async (session: EvanSession) => {
  if (session.slug && route.params.sessionSlug !== session.slug) {
    await router.push({
      name: 'session',
      params: { sessionSlug: session.slug },
      query: route.query,
    });
  }

  selectedSession.value = session;
};

const sessionSlug = computed<string | null>(() => (route.params.sessionSlug as string) || null);

const fetchSessionBySlug = async (slug: string) => {
  if (!eventStore.programDataLoaded) {
    await eventStore.fetchProgramData();
  }

  const session = eventStore.sessions.find((s) => s.slug === slug);

  if (!session) {
    router.push({ name: 'program', query: route.query });
    return;
  }

  try {
    const response = await api.get(session.self);
    selectedSession.value = response.data;
  } catch (error) {
    console.error('Failed to fetch session details:', error);
    router.push({ name: 'program', query: route.query });
  }
};

watch(sessionSlug, (newSlug) => {
  if (newSlug) {
    if (!selectedSession.value || selectedSession.value.slug !== newSlug) {
      fetchSessionBySlug(newSlug);
    }
  } else {
    selectedSession.value = null;
  }
});

onMounted(() => {
  if (route.params.sessionSlug) {
    fetchSessionBySlug(route.params.sessionSlug as string);
  }
});
</script>
