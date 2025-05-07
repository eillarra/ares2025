<template>
  <div class="ares-separator q-mb-md">
    <div class="row items-center q-gutter-md">
      <div class="col">
        <q-separator :color="color" size="2px" />
      </div>
      <div class="col-auto">
        <div
          class="ares-separator-text text-weight-bold text-uppercase text-center"
          :class="textColorClass"
          :style="separatorTextStyle"
        >
          {{ label }}
        </div>
      </div>
      <div class="col">
        <q-separator :color="color" size="2px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    label: string;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    color: 'primary',
    size: 'md',
  },
);

const textColorClass = computed(() => {
  return `text-${props.color}`;
});

const separatorTextStyle = computed(() => {
  const sizeStyles = {
    sm: {
      fontSize: '0.875rem',
      padding: '4px 16px',
      letterSpacing: '0.5px',
      minWidth: '100px',
    },
    md: {
      fontSize: '1rem',
      padding: '6px 20px',
      letterSpacing: '1px',
      minWidth: '120px',
    },
    lg: {
      fontSize: '1.125rem',
      padding: '8px 24px',
      letterSpacing: '1.5px',
      minWidth: '140px',
    },
  };

  const currentSize = sizeStyles[props.size];

  return {
    fontSize: currentSize.fontSize,
    fontWeight: '600',
    letterSpacing: currentSize.letterSpacing,
    padding: currentSize.padding,
    whiteSpace: 'nowrap',
    background: `rgba(var(--q-${props.color}-rgb), 0.08)`,
    borderRadius: '20px',
    border: `1px solid rgba(var(--q-${props.color}-rgb), 0.2)`,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    minWidth: currentSize.minWidth,
  };
});
</script>

<style lang="scss" scoped>
.ares-separator {
  .q-separator {
    opacity: 0.6;
  }
}
</style>
