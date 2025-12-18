<template>
  <div>
    <q-input
      :model-value="searchQuery as unknown as string"
      @update:model-value="updateSearchQuery"
      outlined
      dense
      rounded
      color="ares-red"
      :placeholder="placeholder"
      class="bg-white"
    >
      <template v-slot:prepend>
        <q-icon :name="iconSearch" />
      </template>
      <template v-slot:append>
        <q-btn-dropdown
          v-if="availableTopics.length > 0"
          flat
          round
          dense
          size="sm"
          :dropdown-icon="iconTags"
          class="q-mr-xs"
          menu-class="topic-dropdown-menu"
        >
          <q-list dense>
            <q-item-label header class="text-grey-8 text-weight-medium">Add topic to search</q-item-label>
            <q-separator />
            <q-item
              v-for="topic in availableTopics"
              :key="topic.id"
              clickable
              v-close-popup
              @click="addTopicToSearch(topic.name)"
              class="topic-item"
            >
              <q-item-section>
                <q-item-label>{{ topic.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn v-if="searchQuery" flat round dense :icon="iconClear" @click="updateSearchQuery('')" />
      </template>
    </q-input>
    <div v-if="$slots.footer" class="flex row q-mt-sm text-caption text-grey-6">
      <q-space />
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue';

import { useSearchQuery } from '@/composables/useSearchQuery';
import { useEventStore } from '@evan/stores/event';

import { iconSearch, iconClear, iconTags } from '@/icons';

interface Props {
  placeholder?: string;
  queryParam?: string;
}

const props = withDefaults(defineProps<Props>(), {
  queryParam: 'q',
});

const emit = defineEmits<{
  search: [value: string];
}>();

const { searchQuery } = useSearchQuery(props.queryParam);

// Get available topics from the event store
const eventStore = useEventStore();
const topics = computed(() => eventStore.topics);

const availableTopics = computed(() => {
  return topics.value.slice().sort((a, b) => a.name.localeCompare(b.name));
});

// Emit search events to parent for reactivity
watch(
  searchQuery,
  (newValue) => {
    emit('search', newValue as unknown as string);
  },
  { immediate: true },
);

const updateSearchQuery = (value: string | number | null) => {
  searchQuery.value = String(value || '');
};

const addTopicToSearch = (topicName: string) => {
  const currentQuery = searchQuery.value.trim();
  const newQuery = currentQuery ? `${currentQuery} ${topicName}` : topicName;
  updateSearchQuery(newQuery);
};
</script>

<style scoped>
.topic-dropdown-menu {
  max-width: 300px;
  max-height: 300px;
  overflow-y: auto;
}

.topic-item:hover {
  background-color: rgba(var(--q-primary), 0.1);
}
</style>
