<template>
  <div style="display: inline">
    <ares-btn
      :icon="iconBook"
      :label="buttonLabel"
      :type="buttonType"
      :to="buttonTo"
      :class="buttonClass"
      @click="openDialog"
    />
    <ares-dialog v-model="dialogOpen">
      <ares-dialog-content title="Online proceedings" hide-drawer compact>
        <template #page>
          <marked-div :text="springerText" class="q-px-lg" />
        </template>
      </ares-dialog-content>
    </ares-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useEventStore } from '@evan/stores/event';

import AresBtn from '@/components/AresBtn.vue';
import AresDialog from '@/components/AresDialog.vue';
import AresDialogContent from '@/components/AresDialogContent.vue';

import { iconBook } from '@/icons';

interface Props {
  buttonLabel?: string;
  buttonType?: string;
  buttonTo?: object;
  buttonClass?: string | object;
}

withDefaults(defineProps<Props>(), {
  buttonLabel: 'Online proceedings',
  buttonType: 'a',
  buttonTo: undefined,
  buttonClass: '',
});

const eventStore = useEventStore();

const dialogOpen = ref(false);

const contentsDict = computed(() => eventStore.contentsDict);

const springerText = computed<MarkdownText | null>(() => contentsDict.value['springer']?.value || null);

const openDialog = (event: Event) => {
  event.preventDefault();
  dialogOpen.value = true;
};
</script>
