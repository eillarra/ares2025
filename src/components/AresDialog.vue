<style>
.ares__dialog.fullscreen {
  z-index: 7007 !important;
}
</style>

<template>
  <q-dialog
    :model-value="modelValue"
    square
    :maximized="$q.screen.lt.sm"
    :position="$q.screen.gt.xs ? 'bottom' : undefined"
    transition-show="slide-up"
    transition-hide="slide-down"
    class="ares__dialog"
    v-bind="$attrs"
    @update:model-value="onUpdateModelValue"
  >
    <slot />
  </q-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const onUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value);
};

// Inherit attributes to allow passing through other q-dialog props if needed
defineOptions({
  inheritAttrs: false,
});
</script>
