<template>
  <q-btn outline rounded no-caps :color="color || 'dark'" class="ares__q-btn shadow-10" />
</template>

<script setup lang="ts">
defineProps<{
  color?: string;
}>();
</script>
