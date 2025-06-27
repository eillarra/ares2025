<template>
  <ares-btn
    v-if="shouldShow"
    :icon="isFavorited ? iconStarFull : iconStar"
    :label="hideLabel ? undefined : favoriteLabel"
    :size="size == 'lg' ? undefined : 'md'"
    outline
    class="q-ml-lg"
    :class="{ 'ares__bg-yellow': isFavorited }"
    @click="toggleFavorite"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';

import { useFavorites } from '@/composables/useFavorites';

import { iconStar, iconStarFull } from '@/icons';

type FavoriteType = 'session' | 'subsession';

interface Props {
  type: FavoriteType;
  id: number | null | undefined;
  hideLabel?: boolean;
  title?: string;
  size?: 'md' | 'lg';
}

const props = defineProps<Props>();

const $q = useQuasar();
const favorites = useFavorites();

const shouldShow = computed(() => {
  return props.id !== null && props.id !== undefined;
});

const isFavorited = computed(() => {
  if (!props.id) return false;

  if (props.type === 'session') {
    return favorites.isSessionFavorited(props.id);
  } else {
    return favorites.isSubsessionFavorited(props.id);
  }
});

const favoriteLabel = computed(() => {
  const isCurrentlyFavorited = isFavorited.value;

  if (props.type === 'session') {
    return isCurrentlyFavorited ? 'Remove session' : 'Add session';
  } else {
    return isCurrentlyFavorited ? 'Remove time slot' : 'Add time slot';
  }
});

const toggleFavorite = () => {
  if (!props.id) return;

  if (props.type === 'session') {
    favorites.toggleSessionFavorite(props.id);
    const action = favorites.isSessionFavorited(props.id) ? 'added to' : 'removed from';
    $q.notify({
      message: `Session ${action} your favorites`,
      color: 'positive',
      position: 'bottom',
      timeout: 1500,
    });
  } else if (props.type === 'subsession') {
    favorites.toggleSubsessionFavorite(props.id);
    const action = favorites.isSubsessionFavorited(props.id) ? 'added to' : 'removed from';
    $q.notify({
      message: `Time slot ${action} your favorites`,
      color: 'positive',
      position: 'bottom',
      timeout: 1500,
    });
  }
};
</script>
