<template>
  <ares-dialog-content title="Paper search" hide-drawer>
    <template #page>
      <div class="q-pa-sm">
        <!-- Search Input -->
        <div class="q-mb-lg">
          <q-input
            v-model="searchQuery"
            outlined
            placeholder="Search papers by title, author, or keyword..."
            :loading="isSearching"
            clearable
          >
            <template v-slot:prepend>
              <q-icon :name="iconSearch" />
            </template>
          </q-input>
          <div v-if="!searchQuery.trim() && allPapers.length > 0" class="q-mt-sm">
            <q-banner class="bg-blue-1 text-primary" dense>
              <template v-slot:avatar>
                <q-icon :name="iconStar" />
              </template>
              Find and favorite papers. Favoriting a paper will also favorite its session or time slot.
            </q-banner>
          </div>
        </div>
        <div v-if="searchQuery.trim() && searchResults.length === 0" class="text-center q-py-xl">
          <q-icon :name="iconArticle" size="48px" color="grey-5" />
          <div class="text-h6 text-grey-6 q-mt-md">No papers found</div>
          <div class="text-body2 text-grey-6">Try different search terms</div>
        </div>
        <div v-else-if="searchResults.length > 0" class="search-results">
          <div class="text-subtitle2 q-mb-md text-grey-7">
            {{ searchResults.length }} paper{{ searchResults.length !== 1 ? 's' : '' }} found
            <span v-if="!searchQuery.trim()">(showing first 50)</span>
          </div>
          <div class="papers-list">
            <div
              v-for="(paper, index) in searchResults"
              :key="paper.id"
              class="paper-item"
              :class="{ 'q-mb-md': index !== searchResults.length - 1 }"
            >
              <div class="row items-center q-py-sm">
                <div class="col">
                  <div class="text-weight-medium q-mb-xs">{{ paper.title }}</div>

                  <div class="row items-center q-gutter-sm text-body2 text-grey-7">
                    <span v-if="getAuthorsDisplay(paper)">
                      {{ getAuthorsDisplay(paper) }}
                    </span>

                    <span v-if="getSessionDisplay(paper)" class="text-primary text-weight-medium">
                      {{ getSessionDisplay(paper) }}
                    </span>

                    <span v-if="getSubsessionDisplay(paper)" class="text-secondary">
                      {{ getSubsessionDisplay(paper) }}
                    </span>
                  </div>
                </div>

                <div class="col-auto">
                  <div class="row q-gutter-xs">
                    <PaperDetailsDialog
                      :paper="paper"
                      button-label=""
                      :button-icon="iconInfo"
                      button-color="grey-6"
                      :button-flat="true"
                      :button-dense="true"
                      button-size="sm"
                    />
                    <PaperDetailsDialog
                      :paper="paper"
                      button-label=""
                      :button-icon="getStarIcon(paper)"
                      :button-color="getStarColor(paper)"
                      :button-flat="true"
                      :button-dense="true"
                      button-size="sm"
                    />
                  </div>
                </div>
              </div>

              <q-separator v-if="index !== searchResults.length - 1" />
            </div>
          </div>
        </div>
        <!-- Empty State for No Papers in System -->
        <div v-if="allPapers.length === 0" class="text-center q-py-xl">
          <q-icon :name="iconArticle" size="64px" color="grey-5" />
          <div class="text-h6 text-grey-6 q-mt-md">No Papers Available</div>
          <div class="text-body2 text-grey-6">Papers will appear here once they are uploaded to the system.</div>
        </div>
      </div>
    </template>
  </ares-dialog-content>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { useEventStore } from 'src/evan/stores/event';
import { useFavorites } from 'src/composables/useFavorites';

import AresDialogContent from 'src/components/AresDialogContent.vue';
import PaperDetailsDialog from './PaperDetailsDialog.vue';

import { iconSearch, iconArticle, iconStar, iconStarBorder, iconInfo } from 'src/icons';

const eventStore = useEventStore();
const favorites = useFavorites();

const searchQuery = ref('');
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) {
    return allPapers.value.slice(0, 50); // Show first 50 papers when no search query
  }

  const query = searchQuery.value.toLowerCase();
  const results = allPapers.value.filter((paper) => {
    return (
      paper.title.toLowerCase().includes(query) ||
      getAuthorsDisplay(paper).toLowerCase().includes(query) ||
      getSessionDisplay(paper).toLowerCase().includes(query) ||
      (paper.extra_data?.internal_id && String(paper.extra_data.internal_id).toLowerCase().includes(query))
    );
  });

  return results.slice(0, 50); // Limit results for performance
});
const isSearching = ref(false);

const allPapers = computed(() => eventStore.papers);

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

  return session.code ? `${session.code}: ${session.title}` : session.title;
};

const getSubsessionDisplay = (paper: EvanPaper): string => {
  if (!paper.subsession) return '';

  const session = eventStore.sessions.find((s) => s.id === paper.session);
  if (!session?.subsessions) return `Time slot ${paper.subsession}`;

  const subsession = session.subsessions.find((sub) => sub.id === paper.subsession);
  if (!subsession) return `Time slot ${paper.subsession}`;

  const index = session.subsessions.findIndex((sub) => sub.id === paper.subsession);
  const romanNumeral = toRomanNumeral(index + 1);

  if (session.code) {
    const baseTitle = `${session.code} ${romanNumeral}`;
    if (subsession.title && subsession.title.trim()) {
      return `${baseTitle} - ${subsession.title}`;
    }
    return baseTitle;
  }

  return `${romanNumeral}. ${subsession.title || 'Untitled'}`;
};

const getStarIcon = (paper: EvanPaper) => {
  if (paper.subsession) {
    return favorites.isSubsessionFavorited(paper.subsession) ? iconStar : iconStarBorder;
  }
  if (paper.session) {
    return favorites.isSessionFavorited(paper.session) ? iconStar : iconStarBorder;
  }
  return iconStarBorder;
};

const getStarColor = (paper: EvanPaper) => {
  if (paper.subsession) {
    return favorites.isSubsessionFavorited(paper.subsession) ? 'orange' : 'primary';
  }
  if (paper.session) {
    return favorites.isSessionFavorited(paper.session) ? 'orange' : 'primary';
  }
  return 'primary';
};

const toRomanNumeral = (num: number): string => {
  if (num <= 0 || num >= 4000) return num.toString();

  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

  let result = '';
  let remaining = num;

  for (let i = 0; i < values.length; i++) {
    while (remaining >= values[i]) {
      result += symbols[i];
      remaining -= values[i];
    }
  }

  return result;
};
</script>

<style lang="scss" scoped>
.papers-list {
  max-height: 60vh;
  overflow-y: auto;
}

.paper-item {
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
}
</style>
