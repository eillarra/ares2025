<template>
  <div class="text-center q-py-xl">
    <q-icon name="error" size="64px" color="negative" />
    <h5 class="text-negative q-mt-md">{{ errorMessage }}</h5>
    <q-btn v-if="showRetry" color="primary" label="Retry" @click="$emit('retry')" class="q-mt-md" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  errorMessage: string;
  showRetry?: boolean;
}

withDefaults(defineProps<Props>(), {
  showRetry: true,
});

defineEmits<{
  retry: [];
}>();
</script>
