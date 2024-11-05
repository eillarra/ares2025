import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { Loading } from 'quasar';

import { eventApi } from 'boot/axios';

export const useEventStore = defineStore('evanEvent', () => {
  const event = ref<EvanEvent | null>(null);
  const _contents = ref<EvanContent[]>([]);

  const contactEmail = computed(() => {
    if (event.value) {
      return event.value.email;
    }

    return 'ares@ugent.be';
  });

  const contentsDict = computed(() => {
    const dict: Record<string, EvanContent> = {};

    _contents.value.forEach((content: EvanContent) => {
      dict[content.key] = content;
    });

    return dict;
  });

  async function fetchEvent() {
    await eventApi.get('').then((res) => (event.value = res.data));
  }

  async function fetchContents() {
    await eventApi.get('contents/').then((res) => (_contents.value = res.data));
  }

  async function init() {
    await fetchEvent();
    await fetchContents().finally(() => Loading.hide());
  }

  return {
    init,
    event,
    contactEmail,
    contentsDict,
  };
});
