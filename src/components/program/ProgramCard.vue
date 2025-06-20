<template>
  <q-card flat square bordered :class="cardClasses" @click="$emit('click')">
    <q-card-section>
      <q-icon v-if="showFavorite" size="xs" :name="favoriteIcon" color="grey-7" class="float-right q-ml-lg" />
      <div v-if="categoryLabel" class="text-weight-bold text-caption">
        {{ categoryLabel }}
      </div>
      <div v-else-if="trackInfo" class="text-caption">
        {{ trackInfo.label }}
      </div>
    </q-card-section>
    <q-card-section class="q-py-none">
      <div class="text-ares-red text-weight-bold">
        <span class="text-caption">
          {{ formatDate(startTime) }}
        </span>
        <div class="row items-center q-gutter-xs">
          <span>{{ formatTime(startTime) }}</span>
          <span v-if="showEndTime && endTime" class="text-grey-6"> - {{ formatTime(endTime) }} </span>
        </div>
      </div>
    </q-card-section>
    <q-card-section>
      <h6 class="q-mt-none q-mb-sm">
        {{ displayTitle }}
      </h6>

      <!-- Speaker/Presenter Info -->
      <div v-if="speakerInfo" class="row items-center q-mb-sm">
        <q-icon :name="iconPerson" size="16px" class="q-mr-xs text-grey-6" />
        <span class="text-body2 text-grey-8 text-weight-medium">{{ speakerInfo.name }}</span>
      </div>

      <!-- Papers count -->
      <div v-if="paperCount" class="text-caption text-grey-6 q-mb-xs">
        {{ paperCount }} paper{{ paperCount !== 1 ? 's' : '' }}
      </div>
    </q-card-section>
    <q-space />
    <q-card-section>
      <div class="row items-center justify-between">
        <div class="row items-center">
          <q-icon :name="iconRoom" size="16px" class="q-mr-xs text-grey-6" />
          <span class="text-caption text-grey-7">{{ locationInfo }}</span>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatProgramTime, formatProgramDate } from 'src/utils/program';
import { iconPerson, iconRoom, iconStar, iconStarFull, iconStarHalf } from 'src/icons';

interface TrackInfo {
  label: string;
  color?: string;
}

interface SpeakerInfo {
  name: string;
  affiliation?: string;
}

interface FavoriteState {
  isFavorite: boolean;
  isPartial?: boolean;
}

interface Props {
  title: string;
  startTime?: string;
  endTime?: string;
  trackInfo?: TrackInfo;
  speakerInfo?: SpeakerInfo;
  locationInfo?: string;
  timeInfo?: string;
  categoryLabel?: string;
  paperCount?: number;
  favoriteState?: FavoriteState;
  mobile?: boolean;
  showEndTime?: boolean;
  showFavorite?: boolean;
  variant?: 'session' | 'keynote' | 'paper' | 'social';
}

const props = withDefaults(defineProps<Props>(), {
  mobile: false,
  showEndTime: true,
  showFavorite: true,
  variant: 'session',
});

defineEmits<{
  click: [];
}>();

const displayTitle = computed(() => props.title);

const cardClasses = computed(() => [
  'cursor-pointer',
  'full-height',
  'column',
  'program-card',
  `program-card--${props.variant}`,
]);

const favoriteIcon = computed(() => {
  if (!props.favoriteState) return iconStar;
  if (props.favoriteState.isPartial) return iconStarHalf;
  return props.favoriteState.isFavorite ? iconStarFull : iconStar;
});

const formatTime = (time?: string) => {
  if (!time) return '';
  return formatProgramTime(time);
};

const formatDate = (time?: string) => {
  if (!time) return '';
  return formatProgramDate(time);
};
</script>

<style scoped>
.program-card {
  transition: box-shadow 0.2s ease;
}

.program-card--keynote {
  border-left: 5px solid var(--q-primary);
}

.program-card--paper {
  border-left: 5px solid var(--q-secondary);
}

.program-card--social {
  border-left: 5px solid lightgreen;
}
</style>
