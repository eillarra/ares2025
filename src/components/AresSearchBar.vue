<template>
  <div>
    <q-input
      :model-value="searchQuery"
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
import { watch } from 'vue';
import { iconSearch, iconClear } from '@/icons';
import { useSearchQuery } from '@/composables/useSearchQuery';

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

// Emit search events to parent for reactivity
watch(
  searchQuery,
  (newValue) => {
    emit('search', newValue);
  },
  { immediate: true },
);

const updateSearchQuery = (value: string | number | null) => {
  searchQuery.value = String(value || '');
};
</script>
