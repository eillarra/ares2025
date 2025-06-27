import { useFavorites as useEvanFavorites } from '@evan/composables/useFavorites';

// ARES-specific wrapper for favorites with custom storage key
export function useFavorites() {
  return useEvanFavorites('ares2025_favorites', 1);
}
