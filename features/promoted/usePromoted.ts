import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPromotedSlots,
  fetchPromotedAnalytics,
  createPromotedSlot,
  togglePromotedSlot,
  recordPromotedEvent,
  fetchFilmTrailersForSlot,
} from './api';
import {
  CreatePromotedSlotPayload,
  RecordPromotedEventPayload,
} from './types';

export function usePromotedSlots(includeInactive = true) {
  return useQuery({
    queryKey: ['promotedSlots', includeInactive],
    queryFn: () => fetchPromotedSlots(includeInactive),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePromotedAnalytics() {
  return useQuery({
    queryKey: ['promotedAnalytics'],
    queryFn: fetchPromotedAnalytics,
    staleTime: 1000 * 60,
  });
}

export function useCreatePromotedSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePromotedSlotPayload) => createPromotedSlot(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['promotedSlots'] });
      void queryClient.invalidateQueries({ queryKey: ['promotedAnalytics'] });
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useTogglePromotedSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slotId, isActive }: { slotId: string; isActive: boolean }) =>
      togglePromotedSlot(slotId, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['promotedSlots'] });
      void queryClient.invalidateQueries({ queryKey: ['promotedAnalytics'] });
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useRecordPromotedEvent() {
  return useMutation({
    mutationFn: (payload: RecordPromotedEventPayload) => recordPromotedEvent(payload),
  });
}

export function useFilmTrailersForSlot(filmId?: string) {
  return useQuery({
    queryKey: ['filmTrailersForSlot', filmId],
    queryFn: () => (filmId ? fetchFilmTrailersForSlot(filmId) : Promise.resolve([])),
    enabled: Boolean(filmId),
    staleTime: 1000 * 60 * 5,
  });
}

