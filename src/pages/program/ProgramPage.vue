<template>
  <div class="q-mb-xl q-pb-xl">
    <div v-if="scheduleText" class="ares__bg-yellow q-pt-xl q-mb-xl">
      <div class="container">
        <div class="row q-col-gutter-y-lg q-col-gutter-x-xl justify-between q-mb-xl">
          <div class="col-12 col-md-4 flex column">
            <h2 class="ares__text-title">Schedule</h2>
            <q-separator />
          </div>
          <div class="col-12 col-md-7">
            <marked-div :text="scheduleText" class="q-mb-xl" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="event" class="container q-pt-lg">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-xl justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Program</h2>
          <q-separator />
          <h6 class="ares__text-red">
            Take a look at the schedule and program of <span class="text-no-wrap">{{ event.name }}.</span>
          </h6>
        </div>
        <div class="col-12 col-md-7">
          <div v-if="!event.sessions.length">There are no sessions available yet. We will update the program soon.</div>
          <template v-else>
            <template v-for="(ts, idx) in tracksAndSessions" :key="idx">
              <template v-if="ts.sessions.length">
                <h4 v-if="ts.track" class="ares__text-subtitle2">{{ ts.track.name }}</h4>
                <h4 v-else class="ares__text-subtitle2">No track</h4>
                <ul class="q-mb-xl">
                  <li v-for="session in ts.sessions" :key="session.code">
                    <router-link :to="{ name: 'program', params: { sessionSlug: session.slug } }">
                      <strong v-if="ts.track.name.toLocaleLowerCase() != 'keynotes'">{{ session.code }}:&nbsp;</strong>
                      <span>{{ session.title }}</span>
                    </router-link>
                  </li>
                </ul>
              </template>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
  <q-dialog v-model="dialogVisible" square position="bottom" class="ares__dialog">
    <session-dialog :session="selectedSession" />
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

import { api } from 'boot/axios';
import { useEventStore } from 'src/evan/stores/event';

import SessionDialog from './SessionDialog.vue';

interface TrackWithSessions {
  track: EvanTrack | null;
  sessions: EvanSession[];
}

const eventStore = useEventStore();
const route = useRoute();
const router = useRouter();

const { contentsDict, event } = storeToRefs(eventStore);

const scheduleText = computed<MarkdownText | null>(
  () => (contentsDict.value['program.schedule']?.value as MarkdownText) || null,
);

const sessionSlug = computed<string | string[] | null>(() => (route.params.sessionSlug as string) || null);
const selectedSession = ref(null);

const dialogVisible = computed<boolean>({
  get() {
    return !!selectedSession.value;
  },
  set(value) {
    if (!value) {
      selectedSession.value = null;
      router.push({ name: 'program' });
    }
  },
});

const orderedSessions = computed<EvanSession[]>(() => {
  return [...(event.value?.sessions || [])]
    .filter((s) => !s.is_social_event && s.track !== null)
    .sort((a, b) => (a.code || '').localeCompare(b.code || ''));
});

const tracksAndSessions = computed<TrackWithSessions[]>(() => {
  if (!event.value?.tracks.length) {
    return [{ track: null, sessions: orderedSessions.value }];
  }

  const tracksWithSessions = event.value.tracks.map((track) => {
    return {
      track,
      sessions: orderedSessions.value.filter((session) => session.track === track.id),
    };
  });

  return tracksWithSessions.sort((a, b) => a.track.position - b.track.position);
});

const loadData = async () => {
  await Promise.all([eventStore.init(), eventStore.fetchProgramData()]);
};

const fetchSessionInfo = async () => {
  if (route.params.sessionSlug) {
    if (!event.value) {
      setTimeout(fetchSessionInfo, 100);
      return;
    }

    const session = event.value.sessions.find((s) => s.slug === route.params.sessionSlug);

    if (!session) {
      router.push({ name: 'program' });
      return;
    }

    api.get(session.self).then((response) => {
      selectedSession.value = response.data;
    });
  }
};

watch(sessionSlug, (newSlug) => {
  if (newSlug) {
    fetchSessionInfo();
  }
});

onMounted(async () => {
  await loadData();
  if (route.params.sessionSlug) {
    fetchSessionInfo();
  }
});
</script>
