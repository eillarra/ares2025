<template>
  <q-card
    flat
    square
    bordered
    class="keynote-card cursor-pointer full-height"
    :class="[
      { 'keynote-card--compact': compact },
      { 'keynote-card--mobile': mobile },
      { 'keynote-card--primary': isPrimary },
    ]"
    @click="$emit('click')"
  >
    <q-card-section :class="[compact ? 'q-pa-sm' : 'q-pa-md', 'keynote-card-content']">
      <!-- Main content area -->
      <div class="keynote-main-content">
        <!-- Header with favorite -->
        <div class="row items-start justify-between q-mb-sm">
          <div class="keynote-type text-primary text-weight-bold text-caption">
            {{ isPrimary ? 'KEYNOTE' : 'SPEAKER' }}
          </div>
          <q-icon
            :size="compact ? 'sm' : 'md'"
            :name="getFavoriteIcon()"
            :color="getFavoriteColor()"
            class="keynote-favorite-indicator"
          />
        </div>

        <!-- Track badge (if secondary keynote) -->
        <q-chip
          v-if="keynote.session && getSessionTrack() && !compact && !isPrimary"
          :color="getTrackColor(getSessionTrack())"
          text-color="white"
          size="sm"
          class="q-mb-sm"
        >
          {{ getTrackLabel(getSessionTrack()) }}
        </q-chip>

        <!-- Title -->
        <h6 :class="compact ? 'text-subtitle2 q-mt-none q-mb-xs' : 'q-mt-none q-mb-sm'">
          {{ keynote.title }}
        </h6>

        <!-- Speaker -->
        <div class="row items-center q-mb-sm">
          <q-icon :name="iconPerson" size="16px" class="q-mr-xs text-grey-6" />
          <span class="text-body2 text-grey-8 text-weight-medium">{{ keynote.speaker }}</span>
        </div>

        <!-- Speaker affiliation (if available) -->
        <div v-if="keynote.extra_data?.speaker_affiliation && !compact" class="q-mb-sm">
          <span class="text-caption text-grey-6">{{ keynote.extra_data.speaker_affiliation }}</span>
        </div>

        <!-- Abstract preview (if expanded) -->
        <div v-if="expanded && keynote.abstract" class="q-mb-sm">
          <q-separator class="q-mb-sm" />
          <div class="text-body2 text-grey-8">
            {{ getAbstractPreview(keynote.abstract) }}
          </div>
        </div>
      </div>

      <!-- Footer area - Session info -->
      <div v-if="keynote.session" class="keynote-footer">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon :name="iconSchedule" size="16px" class="q-mr-xs text-grey-6" />
            <span class="text-caption text-grey-7">{{ getSessionTimeLabel() }}</span>
          </div>
        </div>
      </div>

      <!-- Additional info for expanded view -->
      <div v-if="expanded" class="q-mt-md">
        <q-separator class="q-mb-md" />

        <!-- Actions -->
        <div class="row q-gutter-sm">
          <q-btn
            v-if="keynote.session"
            outline
            size="sm"
            :icon="iconCalendarToday"
            label="Add Session to Calendar"
            @click.stop="addSessionToCalendar"
          />
          <q-btn outline size="sm" :icon="iconShare" label="Share" @click.stop="shareKeynote" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  iconStar,
  iconStarBorder,
  iconStarHalf,
  iconPerson,
  iconSchedule,
  iconCalendarToday,
  iconShare,
} from 'src/icons';

const props = defineProps<{
  keynote: EvanKeynote;
  expanded?: boolean;
  compact?: boolean;
  mobile?: boolean;
  favoriteState?: 'full' | 'partial' | 'none';
  getTrackName?: (trackId: number | null) => string;
  getSessionTime?: (sessionId: number) => string;
  sessionData?: EvanSession[];
}>();

defineEmits(['click', 'favorite', 'addToCalendar', 'share']);

const isPrimary = computed(() => {
  if (!props.keynote.session || !props.sessionData) return false;
  const session = props.sessionData.find((s) => s.id === props.keynote.session);
  return session?.track ? props.getTrackName?.(session.track)?.toLowerCase().includes('keynote') : false;
});

const getSessionTrack = () => {
  if (!props.keynote.session || !props.sessionData) return null;
  const session = props.sessionData.find((s) => s.id === props.keynote.session);
  return session?.track || null;
};

const getTrackColor = (trackId: number | null) => {
  if (!trackId) return 'grey';
  const colors = ['blue', 'green', 'orange', 'purple', 'teal', 'pink'];
  return colors[trackId % colors.length];
};

const getTrackLabel = (trackId: number | null) => {
  if (props.getTrackName) {
    return props.getTrackName(trackId);
  }
  return trackId ? `Track ${trackId}` : 'No Track';
};

const getSessionTimeLabel = () => {
  if (!props.keynote.session) return 'Session TBD';
  if (props.getSessionTime) {
    return props.getSessionTime(props.keynote.session);
  }
  return `Session ${props.keynote.session}`;
};

const getAbstractPreview = (abstract: string) => {
  if (typeof abstract !== 'string') return '';
  const maxLength = 150;
  return abstract.length > maxLength ? `${abstract.substring(0, maxLength)}...` : abstract;
};

const getFavoriteIcon = () => {
  switch (props.favoriteState) {
    case 'full':
      return iconStar;
    case 'partial':
      return iconStarHalf;
    default:
      return iconStarBorder;
  }
};

const getFavoriteColor = () => {
  switch (props.favoriteState) {
    case 'full':
      return 'amber';
    case 'partial':
      return 'amber';
    default:
      return 'grey-5';
  }
};

const addSessionToCalendar = () => {
  if (props.keynote.session) {
    // Emit event to parent to handle calendar integration
    // This would typically favorite the session
  }
};

const shareKeynote = () => {
  // Share keynote details
  if (navigator.share) {
    navigator.share({
      title: `${props.keynote.title} - ${props.keynote.speaker}`,
      text: (props.keynote.abstract as string) || `Keynote by ${props.keynote.speaker}`,
      url: window.location.href,
    });
  }
};
</script>

<style scoped>
.keynote-card {
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.keynote-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.keynote-card--primary {
  border-left-color: var(--q-primary);
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
}

.keynote-card--primary .keynote-type {
  color: var(--q-primary);
}

.keynote-card--compact {
  min-height: 120px;
}

.keynote-card--mobile {
  font-size: 0.9em;
}

.keynote-card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.keynote-main-content {
  flex: 1;
}

.keynote-footer {
  margin-top: auto;
  padding-top: 8px;
}

.keynote-favorite-indicator {
  cursor: pointer;
  transition: all 0.2s ease;
}

.keynote-favorite-indicator:hover {
  transform: scale(1.1);
}
</style>
