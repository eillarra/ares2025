<template>
  <div class="text-center text-grey-7 q-py-xl">
    <q-icon :name="iconNotFound" size="64px" color="grey-5" />
    <h5 class="q-my-sm">{{ title }}</h5>
    <p v-if="description" class="text-grey-6">{{ description }}</p>
    <ares-btn v-if="showViewAllDaysAction" label="View All Days" outline class="q-mt-md" @click="clearDayFilter" />
    <ares-btn v-else-if="actionLabel" :label="actionLabel" class="q-mt-md" @click="$emit('action')" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { iconNotFound } from '@/icons';

interface Props {
  title: string;
  icon?: string;
  description?: string;
  actionLabel?: string;
  detectDayFilter?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  icon: iconNotFound,
  detectDayFilter: true,
});

defineEmits<{
  action: [];
}>();

const route = useRoute();
const router = useRouter();

const showViewAllDaysAction = computed(() => {
  return props.detectDayFilter && route.query.day && route.query.day !== 'all';
});

const clearDayFilter = () => {
  const query = { ...route.query };
  delete query.day;
  router.replace({ query });
};
</script>
