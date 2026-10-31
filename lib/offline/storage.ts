import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserWatchlistItem, UserDiaryItem } from '@/features/account/types';
import { FilmDetailFull, LogFilmPayload } from '@/features/films/types';

export type OfflineMutationType =
  | 'LOG_FILM'
  | 'TOGGLE_WATCHLIST'
  | 'SUBMIT_RATING'
  | 'LIKE_REVIEW';

export interface QueuedMutation {
  id: string;
  type: OfflineMutationType;
  payload: any;
  userId: string;
  timestamp: string;
}

const STORAGE_KEYS = {
  WATCHLIST_PREFIX: '@takilya:watchlist:',
  DIARY_PREFIX: '@takilya:diary:',
  FILM_PREFIX: '@takilya:film:',
  MUTATION_QUEUE: '@takilya:mutation_queue',
};

// ==============================================================================
// 1. WATCHLIST LOCAL CACHE
// ==============================================================================

export async function getCachedWatchlist(userId: string): Promise<UserWatchlistItem[] | null> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEYS.WATCHLIST_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCachedWatchlist(
  userId: string,
  items: UserWatchlistItem[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEYS.WATCHLIST_PREFIX}${userId}`, JSON.stringify(items));
  } catch {}
}

// ==============================================================================
// 2. DIARY LOCAL CACHE
// ==============================================================================

export async function getCachedDiary(userId: string): Promise<UserDiaryItem[] | null> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEYS.DIARY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCachedDiary(
  userId: string,
  items: UserDiaryItem[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEYS.DIARY_PREFIX}${userId}`, JSON.stringify(items));
  } catch {}
}

// ==============================================================================
// 3. BASIC FILM METADATA CACHE
// ==============================================================================

export async function getCachedFilm(filmId: string): Promise<FilmDetailFull | null> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEYS.FILM_PREFIX}${filmId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCachedFilm(filmId: string, film: FilmDetailFull): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEYS.FILM_PREFIX}${filmId}`, JSON.stringify(film));
  } catch {}
}

// ==============================================================================
// 4. OFFLINE MUTATION QUEUE
// ==============================================================================

export async function getMutationQueue(): Promise<QueuedMutation[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.MUTATION_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function enqueueMutation(
  mutation: Omit<QueuedMutation, 'id' | 'timestamp'>
): Promise<QueuedMutation> {
  const item: QueuedMutation = {
    ...mutation,
    id: 'mut-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
  };

  try {
    const current = await getMutationQueue();
    current.push(item);
    await AsyncStorage.setItem(STORAGE_KEYS.MUTATION_QUEUE, JSON.stringify(current));
  } catch {}

  return item;
}

export async function removeMutation(id: string): Promise<void> {
  try {
    const current = await getMutationQueue();
    const updated = current.filter((m) => m.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.MUTATION_QUEUE, JSON.stringify(updated));
  } catch {}
}

export async function clearMutationQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.MUTATION_QUEUE);
  } catch {}
}

