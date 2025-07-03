<template>
  <div class="q-my-xl q-pb-xl">
    <div v-if="event" class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Workshop Paper Submission</h2>
          <q-separator />
          <h6 class="ares__text-red">
            Authors are invited to submit workshop papers for
            <span class="text-no-wrap">{{ event.name }}</span> workshops. The submission guidelines can be found in the
            <router-link :to="{ name: 'callForPapers' }">main conference submission guidelines</router-link>.
          </h6>
          <div class="q-mb-lg">
            <ares-btn
              v-if="submissionsUrl"
              :icon="iconSend"
              label="Submit your paper"
              type="a"
              :href="submissionsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="ares__bg-yellow"
              :class="{ 'full-width': $q.screen.lt.sm }"
            />
          </div>
        </div>
        <div class="col-12 col-md-7">
          <template v-for="(ts, idx) in tracksAndSessions" :key="idx">
            <template v-if="ts.sessions.length">
              <h4 v-if="ts.track" class="ares__text-subtitle2">{{ ts.track.name }}</h4>
              <h4 v-else class="ares__text-subtitle2">No track</h4>
              <ul class="q-mb-xl">
                <li v-for="session in ts.sessions" :key="session.code" class="q-pb-md">
                  <strong>{{ session.code }}:&nbsp;</strong><span>{{ session.title }}</span>
                  <br />
                  <span v-if="session.submission_deadline" class="text-body2">
                    {{ `${session.submission_deadline.label}: ${session.submission_deadline.formatted}` }}
                  </span>
                </li>
              </ul>
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

import { api } from '@/boot/axios';
import { useEventStore } from '@evan/stores/event';
import { formatImportantDate, passedImportantDate } from '@evan/utils/dates';

import SessionDialog from '@/pages/program/SessionDialog.vue';

import { iconSend } from '@/icons';

interface TrackWithSessions {
  track: EvanTrack | null;
  sessions: EvanSession[];
}

const eventStore = useEventStore();
const route = useRoute();
const router = useRouter();

const { contentsDict, event } = storeToRefs(eventStore);

const sessionSlug = computed<string | string[] | null>(() => (route.params.sessionSlug as string) || null);
const selectedSession = ref(null);

const submissionsUrl = computed<Url | null>(() => (contentsDict.value['call_for_papers.url']?.value as string) || null);

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
    .map((session) => {
      const matches = (session.extra_data.important_dates || []).filter((date) =>
        date.label.toLowerCase().includes('submission'),
      );
      const submissionDeadline = matches.length ? matches[0] : null;
      session.submission_deadline = submissionDeadline
        ? {
            ...submissionDeadline,
            label: submissionDeadline.aoe ? `${submissionDeadline.label} (AoE)` : submissionDeadline.label,
            formatted: formatImportantDate(submissionDeadline, submissionDeadline.aoe),
            is_past: passedImportantDate(submissionDeadline),
          }
        : null;
      return session;
    })
    .filter((s) => !s.is_social_event && s.track !== null && s.submission_deadline)
    .sort(
      (a, b) =>
        a.submission_deadline.start_date.localeCompare(b.submission_deadline.start_date) ||
        (a.code || '').localeCompare(b.code || ''),
    );
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

  return tracksWithSessions.sort((a, b) => {
    // Handle null tracks by placing them at the end
    if (!a.track) return 1;
    if (!b.track) return -1;
    return a.track.position - b.track.position;
  });
});

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

onMounted(() => {
  if (route.params.sessionSlug) {
    fetchSessionInfo();
  }
});
</script>
