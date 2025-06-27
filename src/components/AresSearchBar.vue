<template>
  <div>
    <q-input
      :model-value="modelValue"
      @update:model-value="(value) => $emit('update:modelValue', String(value))"
      outlined
      dense
      rounded
      color="ares-red"
      :placeholder="placeholder"
      class="bg-white"
    >
      <template v-slot:prepend>
        <q-icon :name="iconSearch" />
      </template>
      <template v-slot:append>
        <q-btn v-if="modelValue" flat round dense :icon="iconClear" @click="$emit('update:modelValue', '')" />
      </template>
    </q-input>
    <div v-if="$slots.footer" class="flex row q-mt-sm text-caption text-grey-6">
      <q-space />
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { iconSearch, iconClear } from '@/icons';

interface Props {
  modelValue: string;
  placeholder?: string;
}

defineProps<Props>();
defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>
