import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { Loading } from 'quasar';

import { eventApi } from 'boot/axios';

export const useEventStore = defineStore('evanEvent', () => {
  const _event = ref<EvanEvent | undefined>(undefined);
  const _contents = ref<EvanContent[] | undefined>(undefined);

  const _loaded = computed(() => _event.value && _contents.value);

  const contactEmail = computed(() => {
    if (_event.value) return _event.value.email;
    return 'evan@ugent.be';
  });

  const contentsDict = computed(() => {
    const dict: Record<string, EvanContent> = {};

    _contents.value?.forEach((content: EvanContent) => {
      dict[content.key] = content;
    });

    return dict;
  });

  const event = computed<EvanEvent | undefined>(() => _event.value);

  const mainVenue = computed<EvanVenue | undefined>(() => {
    if (!event.value) return undefined;
    return event.value.venues.find((venue) => venue.is_main);
  });

  async function fetchEvent() {
    await eventApi.get('').then((res) => (_event.value = res.data));
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
    _loaded,
    contactEmail,
    contentsDict,
    event,
    mainVenue,
  };
});
