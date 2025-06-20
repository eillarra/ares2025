<template>
  <div class="text-center q-py-xl">
    <q-spinner-dots size="40px" color="primary" />
    <div class="q-mt-md text-grey-6">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string;
}

withDefaults(defineProps<Props>(), {
  message: 'Loading...',
});
</script>
