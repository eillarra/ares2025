<template>
  <div class="q-pb-xl">
    <div class="ares__bg-yellow q-py-xl q-mb-lg" v-show="$q.screen.gt.sm">
      <div class="container">
        <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between items-center">
          <div class="col-12 col-md-4 flex column">
            <h2 class="ares__text-title">Conference program</h2>
            <q-separator />
            <div class="q-mt-lg">
              <div class="row q-col-gutter-sm">
                <div v-for="dayOption in dayOptions" :key="dayOption.value" class="col-auto">
                  <q-btn
                    :label="dayOption.label"
                    :color="selectedDay === dayOption.value ? 'ares-red' : undefined"
                    :text-color="selectedDay === dayOption.value ? 'white' : 'dark'"
                    :outline="selectedDay !== dayOption.value"
                    rounded
                    no-caps
                    size="md"
                    @click="selectDay(dayOption.value)"
                    class="day-pill"
                    :class="{ 'text-weight-bold': selectedDay === dayOption.value }"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-7">
            <div class="row q-col-gutter-lg justify-around">
              <div v-for="item in navigationItems" :key="item.route" class="col-auto">
                <div class="flex column items-center nav-item" @click="navigateTo(item.route)">
                  <q-avatar
                    size="80px"
                    font-size="40px"
                    :color="isActiveRoute(item.route) ? 'ares-red' : 'grey-5'"
                    text-color="white"
                    :icon="item.icon"
                    class="q-mb-md nav-avatar"
                  />
                  <div class="text-center">
                    <div class="ares__text-subtitle2">{{ item.title }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="q-pt-lg" :class="{ 'q-pt-xl': $q.screen.gt.sm }">
      <loading-state v-if="eventStore.loading" message="Loading program data..." />
      <error-state v-else-if="eventStore.error" :error-message="eventStore.error" @retry="loadData" />
      <router-view v-else-if="eventStore.sessions.length > 0" />
      <empty-state
        v-else
        icon="calendar_today"
        title="No program data available"
        description="The conference program will be available soon."
      />
    </div>
  </div>
  <q-page-sticky v-show="$q.screen.lt.md" position="bottom" :offset="[0, 0]">
    <div class="bg-ares-yellow text-dark full-width">
      <div class="row items-center q-pa-sm">
        <!-- Navigation buttons -->
        <div class="col">
          <div class="row justify-around">
            <div v-for="item in navigationItems" :key="item.route" class="col-auto">
              <q-btn
                flat
                :color="isActiveRoute(item.route) ? 'ares-red' : 'grey-7'"
                :icon="item.icon"
                :label="item.title"
                no-caps
                size="sm"
                class="mobile-nav-btn"
                @click="navigateTo(item.route)"
              />
            </div>
          </div>
        </div>
        <div class="col-auto q-pl-sm">
          <q-select
            v-model="selectedDay"
            :options="dayOptions"
            emit-value
            map-options
            dense
            outlined
            class="mobile-day-select"
            popup-content-class="mobile-day-popup"
            @update:model-value="selectDay"
          >
            <template v-slot:selected>
              <div class="text-caption text-weight-medium">
                {{ dayOptions.find((opt) => opt.value === selectedDay)?.label || 'All' }}
              </div>
            </template>
          </q-select>
        </div>
      </div>
    </div>
  </q-page-sticky>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, provide, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { useEventStore } from '@evan/stores/event';
import { getAvailableDays } from '@/utils/program';

import { iconArticle, iconMic, iconProgram, iconStar, iconViewList } from '@/icons';

import LoadingState from '@/components/program/LoadingState.vue';
import ErrorState from '@/components/program/ErrorState.vue';
import EmptyState from '@/components/program/EmptyState.vue';

interface NavigationItem {
  route: string;
  title: string;
  icon: string;
}

const eventStore = useEventStore();
const router = useRouter();
const route = useRoute();

// State
const selectedDay = ref((route.query.day as string)?.toLowerCase() || 'all');

// Helper functions for date/weekday conversion using session groups
const getDateFromWeekday = (weekday: string): string | null => {
  if (weekday === 'all') return null;

  const dayOptions = getAvailableDays(eventStore.sessions);
  const option = dayOptions.find((opt) => opt.value === weekday.toLowerCase());

  return option ? option.date : null;
};

// Create day options from sessions (simple and guaranteed to match schedule)
const createDayOptionsFromSessions = () => {
  const options = [{ label: 'All days', value: 'all' }];
  const sessionDays = getAvailableDays(eventStore.sessions);

  sessionDays.forEach((day) => {
    options.push({ label: day.label, value: day.value });
  });

  return options;
};

// Computed
const availableDates = computed(() => {
  if (!eventStore.sessions.length) return [];
  const dayOptions = getAvailableDays(eventStore.sessions);
  return dayOptions.map((day) => day.date);
});

const dayOptions = computed(() => {
  if (!eventStore.sessions.length) return [{ label: 'All days', value: 'all' }];
  return createDayOptionsFromSessions();
});

const currentEventDay = computed(() => {
  if (!eventStore.event) return null;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

  const eventStart = new Date(eventStore.event.start_date);
  const eventEnd = new Date(eventStore.event.end_date);

  // Check if today is within the event dates
  if (today >= eventStart && today <= eventEnd) {
    return todayStr;
  }

  return null;
});

const navigationItems = computed((): NavigationItem[] => [
  {
    route: 'program',
    title: 'Schedule',
    icon: iconProgram,
  },
  {
    route: 'keynotes',
    title: 'Keynotes',
    icon: iconMic,
  },
  {
    route: 'workshops',
    title: 'Workshops',
    icon: iconViewList,
  },
  {
    route: 'acceptedPapers',
    title: 'Papers',
    icon: iconArticle,
  },
  {
    route: 'userProgram',
    title: 'My Calendar',
    icon: iconStar,
  },
]);

const navigateTo = (routeName: string) => {
  const query = selectedDay.value !== 'all' ? { day: selectedDay.value } : {};
  router.push({ name: routeName, query });
};

const isActiveRoute = (routeName: string) => {
  if (routeName === 'program') {
    return route.name === 'program' || route.name === 'session';
  }
  return route.name === routeName;
};

const selectDay = (day: string) => {
  selectedDay.value = day;

  // Update query parameter (only if not 'all')
  const query = { ...route.query };
  if (day === 'all') {
    delete query.day;
  } else {
    query.day = day;
  }

  router.replace({ query });
};

const setInitialDaySelection = () => {
  // Auto-select current day if the event is happening today
  if (currentEventDay.value && availableDates.value.includes(currentEventDay.value)) {
    const dayOptions = getAvailableDays(eventStore.sessions);
    const todayOption = dayOptions.find((opt) => opt.date === currentEventDay.value);
    if (todayOption) {
      selectedDay.value = todayOption.value;
    }
  }
};

// Methods
const loadData = async () => {
  await eventStore.fetchProgramData();
  setInitialDaySelection();
};

// Lifecycle
onMounted(async () => {
  await loadData();
});

// Provide selectedDay and selectedDate to child components
provide('selectedDay', selectedDay);
provide(
  'selectedDate',
  computed(() => {
    if (selectedDay.value === 'all') return 'all';
    return getDateFromWeekday(selectedDay.value) || 'all';
  }),
);

// Watch for query parameter changes
watch(
  () => route.query.day,
  (newDay) => {
    if (newDay && typeof newDay === 'string') {
      selectedDay.value = newDay.toLowerCase();
    } else if (!newDay) {
      selectedDay.value = 'all';
    }
  },
);
</script>

<style scoped>
.nav-avatar {
  transition: all 0.3s ease;
}

.nav-avatar:hover {
  transform: scale(1.1);
}

.nav-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.day-pill {
  transition: all 0.2s ease;
}

.day-pill:hover {
  transform: translateY(-1px);
}

.mobile-nav-btn {
  flex-direction: column;
  min-width: 60px;
  font-size: 10px;
}

.mobile-nav-btn :deep(.q-btn__content) {
  flex-direction: column;
  line-height: 1.2;
}

.mobile-nav-btn :deep(.q-icon) {
  margin-bottom: 2px;
  font-size: 18px;
}

.mobile-day-select {
  min-width: 80px;
}

.mobile-day-select :deep(.q-field__control) {
  height: 32px;
  padding: 0 8px;
}

.mobile-day-select :deep(.q-field__native) {
  text-align: center;
  font-size: 11px;
}

.mobile-content-padding {
  padding-bottom: 80px;
}
</style>
