<template>
  <q-card
    flat
    square
    bordered
    class="session-card cursor-pointer full-height"
    :class="[{ 'session-card--compact': compact }, { 'session-card--mobile': mobile }]"
    @click="$emit('click')"
  >
    <q-card-section :class="[compact ? 'q-pa-sm' : 'q-pa-md', 'session-card-content']">
      <!-- Main content area -->
      <div class="session-main-content">
        <!-- Header with time and favorite -->
        <div class="row items-start justify-between q-mb-sm">
          <div v-if="showTime" class="session-time text-primary text-weight-bold">
            <div class="row items-center q-gutter-xs">
              <span>{{ formatProgramTime(session.start_at) }}</span>
              <span v-if="showEndTime && session.end_at" class="text-grey-6">
                - {{ formatProgramTime(session.end_at) }}
              </span>
              <span v-if="showDate" class="session-date text-caption text-grey-6">{{
                formatProgramDate(session.start_at)
              }}</span>
            </div>
          </div>
          <q-icon
            :size="compact ? 'sm' : 'md'"
            :name="getFavoriteIcon()"
            :color="getFavoriteColor()"
            class="session-favorite-indicator"
          />
        </div>

        <!-- Track badge -->
        <q-chip
          v-if="session.track && !compact"
          :color="getTrackColor(session.track)"
          text-color="white"
          size="sm"
          class="q-mb-sm"
        >
          {{ getTrackLabel(session.track) }}
        </q-chip>

        <!-- Compact track label -->
        <div v-if="session.track && compact" class="text-caption text-primary q-mb-xs">
          {{ getTrackLabel(session.track) }}
        </div>

        <!-- Title -->
        <h6 :class="compact ? 'text-subtitle2 q-mt-none q-mb-xs' : 'q-mt-none q-mb-sm'">
          {{ props.title || getSessionDisplayTitle(session) }}
        </h6>

        <!-- Papers count (compact version) -->
        <div v-if="hasPapers && compact" class="text-caption text-grey-6 q-mb-xs">
          {{ paperCount }} paper{{ paperCount !== 1 ? 's' : '' }}
        </div>

        <!-- Papers count (full version) -->
        <div v-else-if="hasPapers" class="row items-center q-mb-sm">
          <q-icon :name="iconArticle" size="16px" class="q-mr-xs text-grey-6" />
          <span class="text-body2 text-grey-8">{{ paperCount }} paper{{ paperCount !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- Footer area - Room info -->
      <div class="session-footer">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon :name="iconRoom" size="16px" class="q-mr-xs text-grey-6" />
            <span class="text-caption text-grey-7">{{ getRoomLabel(session.room) }}</span>
          </div>
        </div>
      </div>

      <!-- Additional info for expanded view -->
      <div v-if="expanded" class="q-mt-md">
        <q-separator class="q-mb-md" />

        <!-- Description -->
        <div v-if="session.description" class="session-abstract text-body2 q-mb-md">
          {{ session.description }}
        </div>

        <!-- Subsessions -->
        <div v-if="session.subsessions && session.subsessions.length" class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">Subsessions:</div>
          <q-chip
            v-for="subsession in session.subsessions"
            :key="subsession.id"
            outline
            size="xs"
            class="q-mr-xs q-mb-xs"
          >
            {{ subsession.title }}
          </q-chip>
        </div>

        <!-- Actions -->
        <div class="row q-gutter-sm">
          <q-btn outline size="sm" :icon="iconCalendarToday" label="Add to Calendar" @click.stop="addToCalendar" />
          <q-btn outline size="sm" :icon="iconShare" label="Share" @click.stop="shareSession" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { iconStar, iconStarBorder, iconStarHalf, iconArticle, iconRoom, iconCalendarToday, iconShare } from 'src/icons';
import { formatProgramTime, formatProgramDate, getSessionDisplayTitle } from 'src/utils/program';

const props = defineProps<{
  session: EvanSession;
  title?: string;
  showTime?: boolean;
  showEndTime?: boolean;
  showDate?: boolean;
  expanded?: boolean;
  compact?: boolean;
  mobile?: boolean;
  favoriteState?: 'full' | 'partial' | 'none';
  getTrackName?: (trackId: number | null) => string;
  getRoomName?: (roomId: number | null) => string;
}>();

defineEmits(['click']);

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

const getRoomLabel = (roomId: number | null) => {
  if (props.getRoomName) {
    return props.getRoomName(roomId);
  }
  return roomId ? `Room ${roomId}` : 'No Room';
};

const hasPapers = computed(() => {
  return props.session.papers && props.session.papers.length > 0;
});

const paperCount = computed(() => {
  return props.session.papers ? props.session.papers.length : 0;
});

const addToCalendar = () => {
  console.log('Add to calendar:', getSessionDisplayTitle(props.session));
};

const shareSession = () => {
  const sessionTitle = getSessionDisplayTitle(props.session);
  if (navigator.share) {
    navigator.share({
      title: sessionTitle,
      text: `Check out this session: ${sessionTitle}`,
      url: window.location.href,
    });
  }
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
      return 'orange';
    case 'partial':
      return 'orange';
    default:
      return 'grey-5';
  }
};
</script>

<style lang="scss" scoped>
.session-card {
  position: relative;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &--favorite {
    border-left: 4px solid #ffc107;
  }
}

.session-card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.session-main-content {
  flex: 1;
}

.session-footer {
  margin-top: auto;
  padding-top: 8px;
}

.session-time {
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.session-abstract {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.session-favorite-btn {
  position: relative;
  z-index: 2;
}

.session-time {
  font-size: 0.85rem;

  .text-grey-6 {
    font-weight: normal;
    margin-left: 2px;
  }
}

.session-card--compact {
  .session-title {
    font-size: 14px;
    line-height: 1.3;
  }
}

.session-card--mobile {
  margin-bottom: 8px;

  .session-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 768px) {
  .session-card {
    &:hover {
      transform: none;
    }
  }
}
</style>
