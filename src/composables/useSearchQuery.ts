import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/**
 * Composable for managing search query state synchronized with URL query parameter
 * @param queryParam - The query parameter name to sync with (default: 'q')
 * @param debounceMs - Debounce delay for URL updates in milliseconds (default: 300)
 */
export function useSearchQuery(queryParam = 'q', debounceMs = 300) {
  const route = useRoute();
  const router = useRouter();

  // Initialize search query from URL or empty string
  const searchQuery = ref<string>((route.query[queryParam] as string) || '');

  let debounceTimeout: NodeJS.Timeout | null = null;

  // Update URL when search query changes (with debouncing)
  watch(
    searchQuery,
    (newQuery) => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      debounceTimeout = setTimeout(() => {
        const currentQuery = { ...route.query };

        if (newQuery) {
          currentQuery[queryParam] = newQuery;
        } else {
          delete currentQuery[queryParam];
        }

        router.replace({
          name: route.name || undefined,
          params: route.params,
          query: currentQuery,
        });
      }, debounceMs);
    },
    { immediate: false },
  );

  // Update search query when URL changes (e.g., browser back/forward)
  watch(
    () => route.query[queryParam],
    (newQueryValue) => {
      const newValue = (newQueryValue as string) || '';
      if (newValue !== searchQuery.value) {
        searchQuery.value = newValue;
      }
    },
  );

  return {
    searchQuery,
  };
}
