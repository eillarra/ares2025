<template>
  <div class="q-mb-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between">
        <div class="col-12 col-md-4 flex column" v-show="$q.screen.gt.xs">
          <ares-separator label="Workshops" />
          <h6 class="ares__text-red">
            All workshop sessions at <span class="text-no-wrap">{{ eventStore.event?.name }}</span
            >.
          </h6>
        </div>
        <div class="col-12 col-md-7">
          <ares-search-bar placeholder="Search workshops by name" class="q-mb-md" @search="searchQuery = $event">
            <template #footer>
              <span v-if="!searchQuery">{{ filteredWorkshops.length }} workshop sessions</span>
              <span v-else-if="filteredWorkshops.length > 0"
                >{{ filteredWorkshops.length }} workshop session<span v-if="filteredWorkshops.length > 1">s</span>
                found</span
              >
              <span v-else>No workshop sessions found</span>
            </template>
          </ares-search-bar>
          <empty-state
            v-if="!allWorkshops.length"
            icon="code"
            title="No workshop sessions available"
            description="Workshop sessions will appear here once they are available."
          />
          <empty-state
            v-else-if="!filteredWorkshops.length"
            title="No workshop sessions found"
            description="Try adjusting your search terms or filters."
          />
          <template v-else>
            <div
              v-for="trackGroup in workshopsByTrack"
              :key="trackGroup.trackId || 'unassigned'"
              class="evan__marked q-mb-xl"
            >
              <h3>{{ trackGroup.trackTitle }}</h3>
              <ul>
                <li v-for="workshop in trackGroup.workshops" :key="workshop.id" class="q-mb-sm">
                  <div class="row items-center no-wrap">
                    <div class="col text-wrap-balance">
                      <strong>{{ getSessionDisplayTitle(workshop, eventStore.event?.tracks) }}</strong>
                    </div>
                    <div class="col-auto q-ml-sm">
                      <q-btn
                        :icon="iconAddCircle"
                        color="negative"
                        size="md"
                        flat
                        round
                        dense
                        @click="openSessionDetails(workshop)"
                      />
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <ares-dialog v-model="showSessionDialog">
    <session-dialog-content v-if="selectedSession" :session="selectedSession" />
  </ares-dialog>
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue';

import { useEventStore } from '@evan/stores/event';
import { getSessionDisplayTitle } from '@/utils/program';
import { searchInFields } from '@/utils/search';

import AresDialog from '@/components//AresDialog.vue';
import AresSearchBar from '@/components/AresSearchBar.vue';
import AresSeparator from '@/components/AresSeparator.vue';
import EmptyState from '@/components/program/EmptyState.vue';
import SessionDialogContent from './SessionDialogContent.vue';

import { iconAddCircle } from '@/icons';

const eventStore = useEventStore();

// Inject selectedDate from parent MainProgramPage for filtering
const selectedDate = inject<{ value: string }>('selectedDate');

const searchQuery = ref('');
const selectedSession = ref<EvanSession | null>(null);
const showSessionDialog = ref(false);

const allWorkshops = computed(() => {
  const excludedTrackNames = ['keynotes', 'paper track'];

  return eventStore.sessions.filter((session) => {
    const track = eventStore.event?.tracks?.find((t) => t.id === session.track);
    const trackName = track?.name?.toLowerCase() || '';

    if (!track || session.is_social_event) {
      return false;
    }

    if (excludedTrackNames.some((excluded) => trackName.toLowerCase().includes(excluded))) {
      return false;
    }

    return true;
  });
});

const filteredWorkshops = computed(() => {
  let workshops = allWorkshops.value;

  // Filter by search query
  if (searchQuery.value) {
    workshops = workshops.filter((workshop) => {
      return searchInFields(searchQuery.value, getSessionDisplayTitle(workshop, eventStore.event?.tracks));
    });
  }

  // Filter by selected day
  const selectedDateValue = selectedDate?.value || 'all';
  if (selectedDateValue !== 'all') {
    workshops = workshops.filter((workshop) => {
      if (!workshop.start_at) return false;
      const workshopDate = new Date(workshop.start_at).toISOString().split('T')[0];
      return workshopDate === selectedDateValue;
    });
  }

  return workshops;
});

const workshopsByTrack = computed(() => {
  const grouped = new Map<string, { trackId: number | null; trackTitle: string; workshops: EvanSession[] }>();

  filteredWorkshops.value.forEach((workshop) => {
    let trackId: number | null = null;
    let trackTitle = 'Other Workshops';

    if (workshop.track) {
      const track = eventStore.event?.tracks?.find((t) => t.id === workshop.track);
      if (track) {
        trackId = track.id;
        trackTitle = track.name;
      }
    }

    const key = `${trackId || 'unassigned'}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        trackId,
        trackTitle,
        workshops: [],
      });
    }

    grouped.get(key)!.workshops.push(workshop);
  });

  const result = Array.from(grouped.values());

  // Sort workshops within each track by code
  result.forEach((trackGroup) => {
    trackGroup.workshops.sort((a, b) => {
      const codeA = getSessionDisplayTitle(a, eventStore.event?.tracks);
      const codeB = getSessionDisplayTitle(b, eventStore.event?.tracks);
      return codeA.localeCompare(codeB);
    });
  });

  // Sort tracks alphabetically
  return result.sort((a, b) => a.trackTitle.localeCompare(b.trackTitle));
});

const openSessionDetails = (session: EvanSession) => {
  selectedSession.value = session;
  showSessionDialog.value = true;
};
</script>
