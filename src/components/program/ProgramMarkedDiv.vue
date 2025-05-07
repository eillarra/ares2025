<template>
  <div v-if="text" class="evan__marked">
    <div v-html="enhancedHtml"></div>
    <template v-for="paperData in paperRefs" :key="paperData.id">
      <teleport :to="`#paper-ref-${paperData.id}`" v-if="paperData.mounted">
        <paper-details-dialog
          :paper="paperData.paper"
          button-label="More info"
          :button-icon="iconInfoFilled"
          button-color="ares-red"
          button-size="sm"
          :button-flat="true"
          :button-dense="true"
          :hide-footer="hideFooter"
          inline
          class="q-ml-sm"
        />
      </teleport>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, watch } from 'vue';

import { useEventStore } from 'src/evan/stores/event';
import { render } from 'src/evan/utils/markdown';

import PaperDetailsDialog from './PaperDetailsDialog.vue';

import { iconInfoFilled } from 'src/icons';

const props = defineProps<{
  text: string;
  hideFooter?: boolean;
}>();

const eventStore = useEventStore();
const paperRefs = ref<
  Array<{
    id: number;
    paper: EvanPaper;
    mounted: boolean;
  }>
>([]);

const enhancedHtml = computed(() => {
  if (!props.text) return '';

  // First render the markdown
  let html = render(props.text) as string;

  // Then replace paper-ref markers with target divs
  html = html.replace(/<paper-ref\s+([^>]+)><\/paper-ref>/g, (match, attributes) => {
    const paperData = extractPaperData(attributes);
    if (paperData) {
      return `<span class="paper-ref-target" id="paper-ref-${paperData.id}"></span>`;
    }
    return match;
  });

  return html;
});

function extractPaperData(attributes: string): { id: number; paper: EvanPaper } | null {
  const idMatch = attributes.match(/data-paper-id="(\d+)"/);
  if (!idMatch) return null;

  const paperId = parseInt(idMatch[1], 10);
  const paper = eventStore.papers.find((p) => p.id === paperId);

  if (!paper) return null;

  return { id: paperId, paper };
}

function updatePaperRefs() {
  const newPaperRefs: Array<{ id: number; paper: EvanPaper; mounted: boolean }> = [];

  // Extract all paper references from the text
  const paperRefMatches = props.text.match(/<paper-ref\s+([^>]+)><\/paper-ref>/g);

  if (paperRefMatches) {
    for (const match of paperRefMatches) {
      const attributeMatch = match.match(/<paper-ref\s+([^>]+)><\/paper-ref>/);
      if (attributeMatch) {
        const paperData = extractPaperData(attributeMatch[1]);
        if (paperData) {
          newPaperRefs.push({
            ...paperData,
            mounted: false,
          });
        }
      }
    }
  }

  paperRefs.value = newPaperRefs;

  // Mount the teleport targets after DOM update
  nextTick(() => {
    paperRefs.value.forEach((paperRef) => {
      const target = document.getElementById(`paper-ref-${paperRef.id}`);
      if (target) {
        paperRef.mounted = true;
      }
    });
  });
}

// Watch for text changes and update paper refs
watch(() => props.text, updatePaperRefs, { immediate: true });

onMounted(() => {
  updatePaperRefs();
});
</script>
