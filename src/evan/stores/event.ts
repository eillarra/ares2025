import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { Loading } from 'quasar';

import { eventApi } from 'boot/axios';

export const useEventStore = defineStore('evanEvent', () => {
  const _event = ref<EvanEvent | undefined>(undefined);
  const _contents = ref<EvanContent[] | undefined>(undefined);
  const _sessions = ref<EvanSession[]>([]);
  const _papers = ref<EvanPaper[]>([]);
  const _keynotes = ref<EvanKeynote[]>([]);
  const _loading = ref(false);
  const _error = ref<string | null>(null);

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
    return event.value.venues?.find((venue) => venue.is_main);
  });

  const sessions = computed(() => _sessions.value);
  const papers = computed(() => _papers.value);
  const keynotes = computed(() => _keynotes.value);
  const tracks = computed(() => _event.value?.tracks || []);
  const rooms = computed(() => {
    if (!_event.value?.venues) return [];
    return _event.value.venues.flatMap((venue) => venue.rooms || []);
  });
  const loading = computed(() => _loading.value);
  const error = computed(() => _error.value);

  async function fetchEvent() {
    await eventApi.get('').then((res) => (_event.value = res.data));
  }

  async function fetchContents() {
    await eventApi.get('contents/').then((res) => (_contents.value = res.data));
  }

  async function fetchSessions() {
    _loading.value = true;
    _error.value = null;

    try {
      const response = await eventApi.get('sessions/');
      _sessions.value = response.data.results || response.data;
    } catch (err) {
      console.error('Error loading sessions:', err);
      _error.value = 'Failed to load sessions';
    } finally {
      _loading.value = false;
    }
  }

  async function fetchPapers() {
    try {
      const response = await eventApi.get('papers/');
      _papers.value = response.data.results || response.data;
    } catch (err) {
      console.error('Error loading papers:', err);
      _papers.value = [];
    }
  }

  async function fetchKeynotes() {
    try {
      const response = await eventApi.get('keynotes/');
      _keynotes.value = response.data.results || response.data;
    } catch (err) {
      console.error('Error loading keynotes:', err);
      _keynotes.value = [];
    }
  }

  async function fetchProgramData() {
    await Promise.all([fetchSessions(), fetchPapers(), fetchKeynotes()]);
  }

  async function init() {
    await fetchEvent();
    await fetchContents().finally(() => Loading.hide());
  }

  async function fetchSessionDetail(session: EvanSession): Promise<EvanSession> {
    try {
      const response = await eventApi.get(session.self);
      return response.data;
    } catch (err) {
      console.error('Error loading session detail:', err);
      throw err;
    }
  }

  return {
    init,
    _loaded,
    contactEmail,
    contentsDict,
    event,
    mainVenue,
    sessions,
    papers,
    keynotes,
    tracks,
    rooms,
    loading,
    error,
    fetchProgramData,
    fetchSessionDetail,
  };
});
