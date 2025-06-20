<template>
  <div class="ares-separator q-mb-md">
    <div class="row items-center q-gutter-md">
      <div class="col-auto">
        <h5 class="ares__text-subtitle2 q-mb-none text-center">{{ label }}</h5>
      </div>
      <div class="col">
        <q-separator size="1px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>
