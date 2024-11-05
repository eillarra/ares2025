<template>
  <div v-if="text" v-html="html" class="ares__marked" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { render } from 'src/utils/markdown';

const props = defineProps<{
  text: string;
}>();

const html = computed<string>(() => {
  return render(props.text) as string;
});
</script>
