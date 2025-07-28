<template>
  <div class="q-mb-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between">
        <div class="col-12 col-md-4 flex column" v-show="$q.screen.gt.xs">
          <ares-separator label="Accepted Papers" />
          <h6 class="ares__text-red">
            All accepted Papers at <span class="text-no-wrap">{{ eventStore.event?.name }}</span
            >: ARES papers are listed in no particular order, followed by workshops organized alphabetically, with their
            accepted papers, as well as ICS-CSR.
          </h6>
        </div>
        <div class="col-12 col-md-7">
          <ares-search-bar
            placeholder="Search papers by title, authors, session, or ID"
            class="q-mb-md"
            @search="searchQuery = $event"
          >
            <template #footer>
              <span v-if="!searchQuery">{{ filteredPapers.length }} papers</span>
              <span v-else-if="filteredPapers.length > 0"
                >{{ filteredPapers.length }} paper<span v-if="filteredPapers.length > 1">s</span> found</span
              >
              <span v-else>No papers found</span>
            </template>
          </ares-search-bar>
          <empty-state
            v-if="!allPapers.length"
            icon="article"
            title="No papers available"
            description="Papers will appear here once they are uploaded to the system."
          />
          <empty-state
            v-else-if="!filteredPapers.length"
            title="No papers found"
            description="Try adjusting your search terms or filters."
          />
          <template v-else>
            <div
              v-for="sessionGroup in papersBySession"
              :key="sessionGroup.sessionId || 'unassigned'"
              class="evan__marked q-mb-xl"
            >
              <h3>{{ sessionGroup.sessionTitle }}</h3>
              <ul class="papers-session-list">
                <li v-for="paper in sessionGroup.papers" :key="paper.id" class="paper-item q-mb-sm">
                  <div class="row items-center no-wrap">
                    <div class="col text-wrap-balance">
                      <strong>{{ paper.title }}</strong>
                      <em v-if="getAuthorsDisplay(paper)"> <br />{{ getAuthorsDisplay(paper) }} </em>
                    </div>
                    <div class="col-auto q-ml-sm">
                      <paper-details-dialog
                        :paper="paper"
                        :button-icon="iconAddCircle"
                        :button-label="undefined"
                        button-color="negative"
                        button-size="md"
                        button-flat
                        button-round
                        button-dense
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
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue';

import { useEventStore } from '@evan/stores/event';
import { getSessionDisplayTitle } from '@/utils/program';
import { searchInFields } from '@/utils/search';

import AresSearchBar from '@/components/AresSearchBar.vue';
import AresSeparator from '@/components/AresSeparator.vue';
import PaperDetailsDialog from '@/components/program/PaperDetailsDialog.vue';
import EmptyState from '@/components/program/EmptyState.vue';

import { iconAddCircle } from '@/icons';

const eventStore = useEventStore();

// Inject selectedDate from parent MainProgramPage for filtering
const selectedDate = inject<{ value: string }>('selectedDate');

const searchQuery = ref('');

const allPapers = computed(() => eventStore.papers);

const filteredPapers = computed(() => {
  let papers = allPapers.value;

  // Filter by search query
  if (searchQuery.value) {
    papers = papers.filter((paper) => {
      return searchInFields(
        searchQuery.value,
        paper.title,
        getAuthorsDisplay(paper),
        getSessionDisplay(paper),
        paper.extra_data?.internal_id ? String(paper.extra_data.internal_id) : undefined,
      );
    });
  }

  // Filter by selected day
  const selectedDateValue = selectedDate?.value || 'all';
  if (selectedDateValue !== 'all') {
    papers = papers.filter((paper) => {
      if (!paper.session) return false;
      const session = eventStore.sessions.find((s) => s.id === paper.session);
      if (!session?.start_at) return false;
      const sessionDate = new Date(session.start_at).toISOString().split('T')[0];
      return sessionDate === selectedDateValue;
    });
  }

  return papers;
});

const papersBySession = computed(() => {
  const grouped = new Map<
    string,
    { sessionId: number | null; sessionTitle: string; papers: EvanPaper[]; sortOrder: number }
  >();

  filteredPapers.value.forEach((paper) => {
    let sessionId: number | null = null;
    let sessionTitle = 'Unassigned Papers';
    let sortOrder = 999;

    if (paper.session) {
      const session = eventStore.sessions.find((s) => s.id === paper.session);
      if (session) {
        sessionId = session.id;
        const tracks = eventStore.event?.tracks || [];
        sessionTitle = getSessionDisplayTitle(session, tracks);

        const sessionCodeLower = (session.code || '').toLowerCase();

        if (sessionCodeLower.includes('ares')) {
          sortOrder = 1;
        } else if (sessionCodeLower.includes('ics-csr')) {
          sortOrder = 9;
        } else {
          sortOrder = 5;
        }
      }
    }

    const key = `${sessionId || 'unassigned'}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        sessionId,
        sessionTitle,
        papers: [],
        sortOrder,
      });
    }

    grouped.get(key)!.papers.push(paper);
  });

  const result = Array.from(grouped.values());

  result.forEach((sessionGroup) => {
    sessionGroup.papers.sort((a, b) => a.title.localeCompare(b.title));
  });

  return result.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }

    if (a.sortOrder === 1) {
      const aSession = eventStore.sessions.find((s) => s.id === a.sessionId);
      const bSession = eventStore.sessions.find((s) => s.id === b.sessionId);
      const aCode = aSession?.code || '';
      const bCode = bSession?.code || '';
      return aCode.localeCompare(bCode);
    } else if (a.sortOrder === 3) {
      return a.sessionTitle.localeCompare(b.sessionTitle);
    }

    return a.sessionTitle.localeCompare(b.sessionTitle);
  });
});

const getAuthorsDisplay = (paper: EvanPaper): string => {
  if (paper.extra_data?.authors_str) {
    return paper.extra_data.authors_str;
  }

  if (paper.extra_data?.authors?.length) {
    return paper.extra_data.authors.map((author) => author.name).join(', ');
  }

  return '';
};

const getSessionDisplay = (paper: EvanPaper): string => {
  if (!paper.session) return '';

  const session = eventStore.sessions.find((s) => s.id === paper.session);
  if (!session) return `Session ${paper.session}`;

  const tracks = eventStore.event?.tracks || [];
  return getSessionDisplayTitle(session, tracks);
};
</script>
