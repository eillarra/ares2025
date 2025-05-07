import { ref, computed, watch } from 'vue';

interface FavoritesStorage {
  sessions: number[];
  subsessions: number[];
  lastUpdated: number;
}

const STORAGE_KEY = 'ares2025_favorites';
const STORAGE_VERSION = 1;

const favoriteSessionIds = ref<number[]>([]);
const favoriteSubsessionIds = ref<number[]>([]);
let isInitialized = false;

export function useFavorites() {
  // === Storage Management ===
  const loadFromStorage = (): FavoritesStorage | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored);
      if (data.version !== STORAGE_VERSION) return null;

      return data.favorites;
    } catch (error) {
      console.warn('Failed to load favorites from storage:', error);
      return null;
    }
  };

  const saveToStorage = () => {
    try {
      const data = {
        version: STORAGE_VERSION,
        favorites: {
          sessions: favoriteSessionIds.value,
          subsessions: favoriteSubsessionIds.value,
          lastUpdated: Date.now(),
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save favorites to storage:', error);
    }
  };

  const initialize = () => {
    if (isInitialized) return;

    const stored = loadFromStorage();
    if (stored) {
      favoriteSessionIds.value = stored.sessions || [];
      favoriteSubsessionIds.value = stored.subsessions || [];
    }

    watch([favoriteSessionIds, favoriteSubsessionIds], saveToStorage, { deep: true });

    isInitialized = true;
  };

  // === Query Functions ===
  const isSessionFavorited = (sessionId: number): boolean => {
    return favoriteSessionIds.value.includes(sessionId);
  };

  const isSubsessionFavorited = (subsessionId: number): boolean => {
    return favoriteSubsessionIds.value.includes(subsessionId);
  };

  const isSessionFullyFavorited = (session: EvanSession): boolean => {
    if (!isSessionFavorited(session.id)) return false;
    if (!session.subsessions?.length) return true;
    return session.subsessions.every((sub) => isSubsessionFavorited(sub.id));
  };

  // === Basic Operations ===
  const addSessionFavorite = (sessionId: number) => {
    if (!isSessionFavorited(sessionId)) {
      favoriteSessionIds.value.push(sessionId);
    }
  };

  const removeSessionFavorite = (sessionId: number) => {
    const index = favoriteSessionIds.value.indexOf(sessionId);
    if (index > -1) {
      favoriteSessionIds.value.splice(index, 1);
    }
  };

  const addSubsessionFavorite = (subsessionId: number) => {
    if (!isSubsessionFavorited(subsessionId)) {
      favoriteSubsessionIds.value.push(subsessionId);
    }
  };

  const removeSubsessionFavorite = (subsessionId: number) => {
    const index = favoriteSubsessionIds.value.indexOf(subsessionId);
    if (index > -1) {
      favoriteSubsessionIds.value.splice(index, 1);
    }
  };

  const toggleSessionFavorite = (sessionId: number) => {
    if (isSessionFavorited(sessionId)) {
      removeSessionFavorite(sessionId);
    } else {
      addSessionFavorite(sessionId);
    }
  };

  const toggleSubsessionFavorite = (subsessionId: number) => {
    if (isSubsessionFavorited(subsessionId)) {
      removeSubsessionFavorite(subsessionId);
    } else {
      addSubsessionFavorite(subsessionId);
    }
  };

  const toggleSessionWithSubsessions = (session: EvanSession) => {
    const isCurrentlyFavorited = isSessionFavorited(session.id);

    if (isCurrentlyFavorited) {
      removeSessionFavorite(session.id);
      if (session.subsessions) {
        session.subsessions.forEach((subsession) => {
          if (isSubsessionFavorited(subsession.id)) {
            removeSubsessionFavorite(subsession.id);
          }
        });
      }
    } else {
      addSessionFavorite(session.id);
      if (session.subsessions) {
        session.subsessions.forEach((subsession) => {
          if (!isSubsessionFavorited(subsession.id)) {
            addSubsessionFavorite(subsession.id);
          }
        });
      }
    }
  };

  const toggleSubsessionWithSync = (subsessionId: number, session: EvanSession) => {
    toggleSubsessionFavorite(subsessionId);

    if (!session.subsessions) return;

    if (isSubsessionFavorited(subsessionId)) {
      const allSubsessionsFavorited = session.subsessions.every((sub) => isSubsessionFavorited(sub.id));

      if (allSubsessionsFavorited && !isSessionFavorited(session.id)) {
        addSessionFavorite(session.id);
      }
    } else {
      if (isSessionFavorited(session.id)) {
        const allSubsessionsFavorited = session.subsessions.every((sub) => isSubsessionFavorited(sub.id));

        if (!allSubsessionsFavorited) {
          removeSessionFavorite(session.id);
        }
      }
    }
  };

  const clearAllFavorites = () => {
    favoriteSessionIds.value = [];
    favoriteSubsessionIds.value = [];
  };

  const getFavoriteSessionsWithData = (allSessions: EvanSession[]): EvanSession[] => {
    return allSessions.filter((session) => {
      // Include if session is favorited OR has any favorited subsessions
      if (isSessionFavorited(session.id)) return true;

      if (session.subsessions && session.subsessions.length > 0) {
        return session.subsessions.some((subsession) => isSubsessionFavorited(subsession.id));
      }

      return false;
    });
  };

  const isSessionPartiallyFavorited = (session: EvanSession): boolean => {
    if (!session.subsessions || session.subsessions.length === 0) return false;

    const favoritedSubsessions = session.subsessions.filter((sub) => isSubsessionFavorited(sub.id));
    const totalSubsessions = session.subsessions.length;

    return favoritedSubsessions.length > 0 && favoritedSubsessions.length < totalSubsessions;
  };

  const getSessionFavoriteState = (session: EvanSession): 'full' | 'partial' | 'none' => {
    if (isSessionFavorited(session.id)) return 'full';
    if (isSessionPartiallyFavorited(session)) return 'partial';
    return 'none';
  };

  // === Computed Properties ===
  const favoriteCount = computed(() => {
    return favoriteSessionIds.value.length + favoriteSubsessionIds.value.length;
  });

  const sessionFavoriteCount = computed(() => favoriteSessionIds.value.length);
  const subsessionFavoriteCount = computed(() => favoriteSubsessionIds.value.length);

  // === Initialization ===
  initialize();

  return {
    favoriteSessionIds: computed(() => favoriteSessionIds.value),
    favoriteSubsessionIds: computed(() => favoriteSubsessionIds.value),

    favoriteCount,
    sessionFavoriteCount,
    subsessionFavoriteCount,

    isSessionFavorited,
    isSubsessionFavorited,
    isSessionFullyFavorited,

    addSessionFavorite,
    removeSessionFavorite,
    addSubsessionFavorite,
    removeSubsessionFavorite,

    toggleSessionFavorite,
    toggleSubsessionFavorite,

    toggleSessionWithSubsessions,
    toggleSubsessionWithSync,

    clearAllFavorites,
    getFavoriteSessionsWithData,
    isSessionPartiallyFavorited,
    getSessionFavoriteState,
  };
}
