import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { queryClient } from '@/lib/queryClient';
import { haptics } from '@/lib/haptics';
import {
  getMutationQueue,
  removeMutation,
  QueuedMutation,
  enqueueMutation,
} from './storage';
import { logFilmAndReview, toggleFilmWatchlist, submitFilmRating } from '@/features/films/api';
import { toggleLikeReview } from '@/features/social/api';

type SyncListener = (state: { isOnline: boolean; isSyncing: boolean; queuedCount: number }) => void;
const listeners = new Set<SyncListener>();

let currentOnlineState = true;
let isSyncing = false;
let currentQueuedCount = 0;

function notifyListeners() {
  listeners.forEach((listener) =>
    listener({
      isOnline: currentOnlineState,
      isSyncing,
      queuedCount: currentQueuedCount,
    })
  );
}

export async function processOfflineQueue(): Promise<{ syncedCount: number; errors: number }> {
  if (isSyncing || !currentOnlineState) {
    return { syncedCount: 0, errors: 0 };
  }

  isSyncing = true;
  notifyListeners();

  let syncedCount = 0;
  let errors = 0;

  try {
    const queue = await getMutationQueue();
    currentQueuedCount = queue.length;
    notifyListeners();

    for (const item of queue) {
      try {
        if (item.type === 'LOG_FILM') {
          await logFilmAndReview(item.payload);
        } else if (item.type === 'TOGGLE_WATCHLIST') {
          await toggleFilmWatchlist(item.payload.filmId, item.payload.userId, item.payload.currentStatus);
        } else if (item.type === 'SUBMIT_RATING') {
          await submitFilmRating(item.payload.filmId, item.payload.userId, item.payload.score);
        } else if (item.type === 'LIKE_REVIEW') {
          await toggleLikeReview(item.payload.userId, item.payload.reviewId, item.payload.currentlyLiked);
        }

        await removeMutation(item.id);
        syncedCount++;
      } catch (err) {
        console.warn(`Failed to process queued mutation ${item.id}:`, err);
        errors++;
      }
    }

    const remaining = await getMutationQueue();
    currentQueuedCount = remaining.length;

    if (syncedCount > 0) {
      haptics.success();
      // Invalidate relevant TanStack Query caches
      void queryClient.invalidateQueries({ queryKey: ['filmDetail'] });
      void queryClient.invalidateQueries({ queryKey: ['userWatchlist'] });
      void queryClient.invalidateQueries({ queryKey: ['userDiary'] });
      void queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      void queryClient.invalidateQueries({ queryKey: ['communityActivity'] });
    }
  } finally {
    isSyncing = false;
    notifyListeners();
  }

  return { syncedCount, errors };
}

// Global network listener
NetInfo.addEventListener((state: NetInfoState) => {
  const online = Boolean(state.isConnected && (state.isInternetReachable ?? true));
  const wasOffline = !currentOnlineState;
  currentOnlineState = online;

  notifyListeners();

  // If transitioned from offline to online, trigger queue sync automatically
  if (online && wasOffline) {
    void processOfflineQueue();
  }
});

// Initial count check
void getMutationQueue().then((q) => {
  currentQueuedCount = q.length;
  notifyListeners();
});

export function useNetworkStatus() {
  const [status, setStatus] = useState({
    isOnline: currentOnlineState,
    isSyncing,
    queuedCount: currentQueuedCount,
  });

  useEffect(() => {
    const listener: SyncListener = (newStatus) => {
      setStatus(newStatus);
    };

    listeners.add(listener);
    // Sync initial state
    setStatus({
      isOnline: currentOnlineState,
      isSyncing,
      queuedCount: currentQueuedCount,
    });

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const syncNow = useCallback(() => {
    return processOfflineQueue();
  }, []);

  return {
    ...status,
    syncNow,
  };
}

