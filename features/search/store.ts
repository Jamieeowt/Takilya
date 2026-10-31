import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const RECENT_SEARCHES_KEY = 'takilya_recent_searches';
const MAX_RECENT_SEARCHES = 10;

interface SearchStoreState {
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  initRecentSearches: () => Promise<void>;
}

export const useSearchStore = create<SearchStoreState>((set, get) => ({
  recentSearches: [
    'Himala',
    'Leonor Will Never Die',
    'Ishmael Bernal',
    'Cinemalaya',
  ],

  addRecentSearch: (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const current = get().recentSearches;
    const filtered = current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    set({ recentSearches: updated });

    try {
      void SecureStore.setItemAsync(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      // SecureStore fallback ignored in sandbox
    }
  },

  removeRecentSearch: (query: string) => {
    const current = get().recentSearches;
    const updated = current.filter((item) => item.toLowerCase() !== query.toLowerCase());

    set({ recentSearches: updated });

    try {
      void SecureStore.setItemAsync(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {}
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });

    try {
      void SecureStore.deleteItemAsync(RECENT_SEARCHES_KEY);
    } catch (e) {}
  },

  initRecentSearches: async () => {
    try {
      const stored = await SecureStore.getItemAsync(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ recentSearches: parsed });
        }
      }
    } catch (e) {}
  },
}));

