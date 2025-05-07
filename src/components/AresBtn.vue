<template>
  <q-btn outline rounded no-caps :color="color || 'dark'" class="ares__q-btn shadow-10" :class="{ 'no-label': !label }">
    <template v-if="label">{{ label }}</template>
    <slot />
  </q-btn>
</template>

<script setup lang="ts">
defineProps<{
  color?: string;
  label?: string;
}>();
</script>
