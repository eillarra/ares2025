<style scoped>
.day-pill {
  transition: all 0.2s ease;
}

.day-pill:hover {
  transform: translateY(-1px);
}
</style>

<template>
  <div
    class="row q-col-gutter-sm"
    :class="{
      'mobile-day-pills': isMobile,
    }"
  >
    <div v-for="dayOption in dayOptions" :key="dayOption.value" class="col-auto">
      <q-btn
        :label="dayOption.label"
        :color="selectedDay === dayOption.value ? 'ares-red' : undefined"
        :text-color="selectedDay === dayOption.value ? 'white' : 'dark'"
        :outline="selectedDay !== dayOption.value"
        rounded
        no-caps
        :size="isMobile ? 'sm' : 'md'"
        @click="onDaySelect(dayOption.value)"
        class="day-pill"
        :class="{ 'text-weight-bold': selectedDay === dayOption.value }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface DayOption {
  label: string;
  value: string;
}

interface Props {
  dayOptions: DayOption[];
  selectedDay: string;
  isMobile?: boolean;
}

interface Emits {
  (e: 'daySelect', day: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const onDaySelect = (day: string) => {
  emit('daySelect', day);
};
</script>
