<template>
  <div v-if="text" class="evan__marked ares__marked-program">
    <div v-html="enhancedHtml"></div>
    <template v-for="paperData in paperRefs" :key="paperData.id">
      <teleport :to="`#paper-ref-${paperData.id}`" v-if="paperData.mounted">
        <paper-details-dialog
          :paper="paperData.paper"
          button-label="More info"
          :button-icon="iconAddCircle"
          button-color="ares-red"
          button-size="sm"
          :button-flat="true"
          :button-dense="true"
          :hide-favorite-btn="hideFavoriteBtn"
          inline
          class="q-ml-sm"
        />
      </teleport>
    </template>
    <template v-for="keynoteData in keynoteRefs" :key="keynoteData.id">
      <teleport :to="`#keynote-ref-${keynoteData.id}`" v-if="keynoteData.mounted">
        <keynote-details-dialog
          :keynote="keynoteData.keynote"
          button-label="More info"
          :button-icon="iconAddCircle"
          button-color="ares-red"
          button-size="sm"
          :button-flat="true"
          :button-dense="true"
          :hide-favorite-btn="hideFavoriteBtn"
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
import KeynoteDetailsDialog from './KeynoteDetailsDialog.vue';

import { iconAddCircle } from 'src/icons';

const props = defineProps<{
  text: string;
  hideFavoriteBtn?: boolean;
}>();

const eventStore = useEventStore();

const paperRefs = ref<
  Array<{
    id: number;
    paper: EvanPaper;
    mounted: boolean;
  }>
>([]);

const keynoteRefs = ref<
  Array<{
    id: number;
    keynote: EvanKeynote;
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

  // Replace [keynote:CODE] references with keynote-ref elements and display text
  html = html.replace(/\[keynote:([^\]]+)\]/g, (match, code) => {
    const keynote = eventStore.keynotes.find((k) => k.code === code);
    if (keynote) {
      return `Keynote: “${keynote.title}” by ${keynote.speaker}<keynote-ref data-keynote-id="${keynote.id}"></keynote-ref><span class="keynote-ref-target" id="keynote-ref-${keynote.id}"></span>`;
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

function updateKeynoteRefs() {
  const newKeynoteRefs: Array<{ id: number; keynote: EvanKeynote; mounted: boolean }> = [];

  // Extract keynote references from the original text using regex
  const keynoteMatches = props.text.match(/\[keynote:([^\]]+)\]/g);

  if (keynoteMatches) {
    for (const match of keynoteMatches) {
      const codeMatch = match.match(/\[keynote:([^\]]+)\]/);
      if (codeMatch) {
        const keynoteCode = codeMatch[1];
        const keynote = eventStore.keynotes.find((k) => k.code === keynoteCode);
        if (keynote) {
          newKeynoteRefs.push({
            id: keynote.id,
            keynote,
            mounted: false,
          });
        }
      }
    }
  }

  keynoteRefs.value = newKeynoteRefs;

  // Mount the teleport targets after DOM update
  nextTick(() => {
    keynoteRefs.value.forEach((keynoteRef) => {
      const target = document.getElementById(`keynote-ref-${keynoteRef.id}`);
      if (target) {
        keynoteRef.mounted = true;
      }
    });
  });
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

function updateAllRefs() {
  updatePaperRefs();
  updateKeynoteRefs();
}

// Watch for text changes and update all refs
watch(() => props.text, updateAllRefs, { immediate: true });

onMounted(() => {
  updateAllRefs();
});
</script>
