import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchFestivals,
  fetchFestivalById,
  fetchFestivalEditions,
  fetchFestivalSelections,
  fetchFestivalClips,
  postFestivalClip,
} from './api';

export function useFestivals() {
  return useQuery({
    queryKey: ['festivals'],
    queryFn: () => fetchFestivals(),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useFestival(idOrSlug: string) {
  return useQuery({
    queryKey: ['festival', idOrSlug],
    queryFn: () => fetchFestivalById(idOrSlug),
    enabled: Boolean(idOrSlug),
    staleTime: 1000 * 60 * 5,
  });
}

export function useFestivalEditions(festivalId: string) {
  return useQuery({
    queryKey: ['festivalEditions', festivalId],
    queryFn: () => fetchFestivalEditions(festivalId),
    enabled: Boolean(festivalId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useFestivalSelections(editionId?: string) {
  return useQuery({
    queryKey: ['festivalSelections', editionId],
    queryFn: () => (editionId ? fetchFestivalSelections(editionId) : Promise.resolve([])),
    enabled: Boolean(editionId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useFestivalClips(festivalId: string) {
  return useQuery({
    queryKey: ['festivalClips', festivalId],
    queryFn: () => fetchFestivalClips(festivalId),
    enabled: Boolean(festivalId),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePostFestivalClip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      festivalId,
      payload,
    }: {
      festivalId: string;
      payload: {
        film_id: string;
        youtube_url_or_id: string;
        title: string;
        type?: 'official' | 'teaser' | 'clip' | 'behind_the_scenes';
      };
    }) => postFestivalClip(festivalId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['festivalClips', variables.festivalId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['feedVideos'],
      });
    },
  });
}

