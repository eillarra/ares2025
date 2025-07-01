<style scoped>
.avatar-display {
  flex-shrink: 0;
}
</style>

<template>
  <q-avatar :size="size" :class="avatarClasses" class="bg-grey-2">
    <q-img v-if="file" :src="file.file" :alt="altText" loading="lazy" :title="altText">
      <template #loading>
        <q-icon :name="iconPerson" :size="iconSize" color="grey-6" />
      </template>
      <template #error>
        <q-icon :name="iconPerson" :size="iconSize" color="grey-6" />
      </template>
    </q-img>
    <q-icon v-else :name="iconPerson" :size="iconSize" color="grey-6" />
  </q-avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { iconPerson } from '@/icons';

interface Props {
  file?: EvanFile | null;
  size?: string;
  altText?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  file: null,
  size: '32px',
  altText: 'Avatar',
  class: '',
});

const avatarClasses = computed(() => ['avatar-display', props.class]);

const iconSize = computed(() => {
  // Calculate icon size based on avatar size
  const sizeNum = parseInt(props.size);
  if (sizeNum >= 64) return '48px';
  if (sizeNum >= 48) return '36px';
  if (sizeNum >= 32) return '24px';
  return '16px';
});
</script>
